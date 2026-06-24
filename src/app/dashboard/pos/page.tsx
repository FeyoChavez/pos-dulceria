'use client';

import React, { useState, useEffect, useRef } from "react";
import SearchBar from "@/components/ui/SearchBar";
import Ticket from "@/components/ui/Ticket";
import CartTable from "./components/CartTable";
import OrderSummary from "./components/OrderSumary";
import SearchModal from "./components/SearchModal";
import PaymentSelector, { Customer } from "./components/PaymentSelector";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  barcode: string | null;
  priceSale: number;
  isByWeight: boolean;
  quantity: number;
  subtotal: number;
  stock: number;
}

export default function PosPage() {
  const [appStatus, setAppStatus] = useState<'LOADING' | 'LOCKED' | 'READY'>('LOADING');
  const [catalogoLocal, setCatalogoLocal] = useState<any[]>([]);
  const [clientesLocal, setClientesLocal] = useState<Customer[]>([]); 
  const [tenantId, setTenantId] = useState('');
  const [userId, setUserId] = useState('');

  // Estados de Carrito y Transacción
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT'>('CASH'); 
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null); 
  
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCobrando, setIsCobrando] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const totalVenta = cart.reduce((acc, item) => acc + item.subtotal, 0);

  useEffect(() => {
    fetch('/api/pos/init')
      .then(res => res.json())
      .then(data => {
        if (data.error || data.isCajaAbierta === false) {
          setAppStatus('LOCKED');
          return;
        }
        setTenantId(data.tenantId);
        setUserId(data.userId);
        setCatalogoLocal(data.catalogo || []);
        setClientesLocal(data.clientes || []);
        setAppStatus('READY');
      })
      .catch(() => setAppStatus('LOCKED'));
  }, []);

  useEffect(() => {
    if (appStatus === 'READY') searchInputRef.current?.focus();
  }, [appStatus]);

  useEffect(() => {
    if (ticketData) {
      const timer = setTimeout(() => { window.print(); }, 80);
      const handleAfterPrint = () => {
        setTicketData(null);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      };
      window.addEventListener('afterprint', handleAfterPrint);
      return () => { clearTimeout(timer); window.removeEventListener('afterprint', handleAfterPrint); };
    }
  }, [ticketData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12" && cart.length > 0 && !isCobrando && !ticketData) {
        e.preventDefault();
        handleCobrar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, isCobrando, ticketData, paymentMethod, selectedCustomer]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toLowerCase();
    if (!query || catalogoLocal.length === 0) return;

    const matchExacto = catalogoLocal.find(p => p.barcode?.toLowerCase() === query);
    if (matchExacto) { addToCart(matchExacto); setSearchInput(""); return; }

    const coincidencias = catalogoLocal.filter(p => p.name.toLowerCase().includes(query) || p.barcode?.toLowerCase().includes(query));

    if (coincidencias.length === 1) { addToCart(coincidencias[0]); setSearchInput(""); } 
    else if (coincidencias.length > 1) { setSearchResults(coincidencias); setIsModalOpen(true); } 
    else { alert(`No encontrado: "${searchInput.trim()}"`); }
  };

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const addedQuantity = product.isByWeight ? 0.25 : 1;
      
      if (existing) {
        if (existing.quantity + addedQuantity > product.stock) return prev;
        return prev.map((item) => item.id === product.id
          ? { ...item, quantity: item.quantity + addedQuantity, subtotal: (item.quantity + addedQuantity) * item.priceSale }
          : item
        );
      }
      if (addedQuantity > product.stock) return prev;
      return [...prev, {
        id: product.id, name: product.name, barcode: product.barcode,
        priceSale: product.priceSale, isByWeight: product.isByWeight,
        quantity: addedQuantity, subtotal: addedQuantity * product.priceSale, stock: product.stock 
      }];
    });
  };

  const updateQuantity = (id: string, amount: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(item.isByWeight ? 0.05 : 1, item.quantity + amount);
        if (newQty > item.stock) return item;
        return { ...item, quantity: newQty, subtotal: newQty * item.priceSale };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => { setCart((prev) => prev.filter((item) => item.id !== id)); searchInputRef.current?.focus(); };

  const handleCobrar = async () => {
    if (cart.length === 0 || isCobrando) return;
    if (paymentMethod === 'CREDIT' && !selectedCustomer) {
      alert('Por favor selecciona un deudor de la libreta para poder fiar la cuenta.');
      return;
    }
    
    const snapshotCart = [...cart];
    const snapshotTotal = totalVenta;

    setTicketData({ cart: snapshotCart, total: snapshotTotal, date: new Date() });
    setCart([]);
    setIsCobrando(true);

    try {
      fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cart: snapshotCart, 
          paymentMethod, 
          customerId: paymentMethod === 'CREDIT' ? selectedCustomer?.id : null,
          tenantId, 
          userId 
        }),
      }).then((res) => {
        if (!res.ok) console.error("Error al registrar venta.");
        setPaymentMethod('CASH');
        setSelectedCustomer(null);
      });
    } catch (error) { console.error("Error de red:", error); } 
    finally { setIsCobrando(false); }
  };

  if (appStatus === 'LOADING') return ( <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50"><div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3" /><p className="text-xs font-medium text-zinc-500">Iniciando terminal...</p></div> );
  if (appStatus === 'LOCKED') return ( <div className="h-screen w-full bg-black/85 flex flex-col items-center justify-center p-6"><div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center space-y-5 max-w-md w-full"><Lock className="w-6 h-6 text-amber-400 mx-auto" /><h2 className="text-xl font-bold text-zinc-100">Turno Cerrado</h2><Link href="/dashboard/caja" className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-zinc-900 rounded-xl font-bold text-sm"><span>Abrir Caja Ahora</span><ArrowRight className="w-4 h-4" /></Link></div></div> );

  return (
    <>
      <div className="print:hidden h-full bg-zinc-50 p-4 lg:p-6 font-sans text-zinc-900">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-6 h-full">
          
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-white">
              <SearchBar value={searchInput} onChange={setSearchInput} onSubmit={handleSearchSubmit} inputRef={searchInputRef} placeholder="Escanea código de barras o teclea el dulce..." />
            </div>
            <div className="flex-1 overflow-x-auto">
              <CartTable cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />
            </div>
          </div>
          
          <div className="w-full lg:w-96 flex flex-col gap-4">
            <PaymentSelector 
              paymentMethod={paymentMethod}
              onChangePayment={setPaymentMethod}
              clientes={clientesLocal}
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
            />

            <OrderSummary itemsCount={cart.length} totalVenta={totalVenta} isCobrande={isCobrando} onCobrar={handleCobrar} />
          </div>

        </div>
        <SearchModal isOpen={isModalOpen} results={searchResults} onSelect={product => { addToCart(product); setIsModalOpen(false); setSearchInput(""); setTimeout(() => searchInputRef.current?.focus(), 50); }} onClose={() => { setIsModalOpen(false); setSearchInput(""); setTimeout(() => searchInputRef.current?.focus(), 50); }} />
      </div>

      <div className="hidden print:block">{ticketData && <div id="ticket-print-container"><Ticket cart={ticketData.cart} total={ticketData.total} date={ticketData.date} /></div>}</div>
    </>
  );
}