'use client';

import React, { useState, useEffect, useRef } from "react";
import SearchBar from "@/components/ui/SearchBar";
import Ticket from "@/components/ui/Ticket";
import CartTable from "./components/CartTable";
import OrderSummary from "./components/OrderSumary";
import SearchModal from "./components/SearchModal";
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
  const [tenantId, setTenantId] = useState('');
  const [userId, setUserId] = useState('');

  // Estados Operativos del POS
  const [cart, setCart] = useState<CartItem[]>([]);
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
        setAppStatus('READY');
      })
      .catch(() => setAppStatus('LOCKED'));
  }, []);

  // Efecto auto-focus cuando el POS está listo
  useEffect(() => {
    if (appStatus === 'READY') {
      searchInputRef.current?.focus();
    }
  }, [appStatus]);

  // Efecto de Impresión Rápida (80ms)
  useEffect(() => {
    if (ticketData) {
      const timer = setTimeout(() => {
        window.print(); 
      }, 80); 

      const handleAfterPrint = () => {
        setTicketData(null); 
        setTimeout(() => searchInputRef.current?.focus(), 50);
      };

      window.addEventListener('afterprint', handleAfterPrint);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('afterprint', handleAfterPrint);
      };
    }
  }, [ticketData]);

  // Efecto Teclado F12
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12" && cart.length > 0 && !isCobrando && !ticketData) {
        e.preventDefault();
        handleCobrar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, isCobrando, ticketData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toLowerCase();
    if (!query || catalogoLocal.length === 0) return;

    // Es código de barras exacto
    const matchExacto = catalogoLocal.find(p => p.barcode?.toLowerCase() === query);
    if (matchExacto) {
      addToCart(matchExacto);
      setSearchInput("");
      return;
    }

    // si contiene las letras tecleadas
    const coincidencias = catalogoLocal.filter(p => 
      p.name.toLowerCase().includes(query) || p.barcode?.toLowerCase().includes(query)
    );

    if (coincidencias.length === 1) {
      addToCart(coincidencias[0]);
      setSearchInput("");
    } else if (coincidencias.length > 1) {
      setSearchResults(coincidencias);
      setIsModalOpen(true);
    } else {
      alert(`No encontrado en el catálogo: "${searchInput.trim()}"`);
    }
  };

  // Lógica del Carrito
  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const addedQuantity = product.isByWeight ? 0.25 : 1;
      
      if (existing) {
        if (existing.quantity + addedQuantity > product.stock) {
          alert(`¡Stock insuficiente! Solo quedan ${product.stock} de ${product.name}.`);
          return prev;
        }
        return prev.map((item) => item.id === product.id
          ? { ...item, quantity: item.quantity + addedQuantity, subtotal: (item.quantity + addedQuantity) * item.priceSale }
          : item
        );
      }
      
      if (addedQuantity > product.stock) {
        alert(`¡No hay stock de ${product.name}!`);
        return prev;
      }

      return [...prev, {
        id: product.id, 
        name: product.name, 
        barcode: product.barcode,
        priceSale: product.priceSale, 
        isByWeight: product.isByWeight,
        quantity: addedQuantity, 
        subtotal: addedQuantity * product.priceSale,
        stock: product.stock 
      }];
    });
  };

  const updateQuantity = (id: string, amount: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(item.isByWeight ? 0.05 : 1, item.quantity + amount);
        if (newQty > item.stock) {
          alert(`Límite alcanzado. Solo tienes ${item.stock}.`);
          return item; 
        }
        return { ...item, quantity: newQty, subtotal: newQty * item.priceSale };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    searchInputRef.current?.focus();
  };

  const handleCobrar = async () => {
    if (cart.length === 0 || isCobrando) return;
    
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
          paymentMethod: "CASH", 
          tenantId, 
          userId 
        }),
      }).then((res) => {
        if (!res.ok) console.error("Desfase al guardar en BD");
      });
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setIsCobrando(false);
    }
  };

  if (appStatus === 'LOADING') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50 font-sans">
        <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium text-zinc-500">Iniciando terminal de cobro...</p>
      </div>
    );
  }

  if (appStatus === 'LOCKED') {
    return (
      <div className="h-screen w-full bg-black/85 flex flex-col items-center justify-center p-6 font-sans animate-in fade-in duration-200">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl max-w-md w-full flex flex-col items-center text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-zinc-100">Turno de Caja Cerrado</h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              El Punto de Venta está bloqueado por seguridad. Para poder escanear dulces y registrar ingresos, primero debes declarar el fondo inicial.
            </p>
          </div>
          <div className="w-full pt-2">
            <Link href="/dashboard/caja" className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-white text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-all shadow-lg hover:scale-[1.02] active:scale-95">
              <span>Abrir Caja Ahora</span>
              <ArrowRight className="w-4 h-4 text-zinc-900" /> 
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="print:hidden h-full bg-zinc-50 p-4 lg:p-6 font-sans text-zinc-900">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-6 h-full">
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-white z-10">
              <SearchBar value={searchInput} onChange={setSearchInput} onSubmit={handleSearchSubmit} inputRef={searchInputRef} placeholder="Escanea el código o teclea y presiona Enter..." />
            </div>
            <div className="flex-1 overflow-x-auto">
              <CartTable cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />
            </div>
          </div>
          <OrderSummary itemsCount={cart.length} totalVenta={totalVenta} isCobrande={isCobrando} onCobrar={handleCobrar} />
        </div>
        <SearchModal isOpen={isModalOpen} results={searchResults} onSelect={product => { addToCart(product); setIsModalOpen(false); setSearchInput(""); setTimeout(() => searchInputRef.current?.focus(), 50); }} onClose={() => { setIsModalOpen(false); setSearchInput(""); setTimeout(() => searchInputRef.current?.focus(), 50); }} />
      </div>

      <div className="hidden print:block">
        {ticketData && (
          <div id="ticket-print-container">
            <Ticket cart={ticketData.cart} total={ticketData.total} date={ticketData.date} />
          </div>
        )}
      </div>
    </>
  );
}