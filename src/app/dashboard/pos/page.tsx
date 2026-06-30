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
import { toast } from "react-toastify"; 
import WeightInputModal from "./components/WeightInputModal";

interface CartItem {
  id: string;
  name: string;
  barcode: string | null;
  priceSale: number;
  isByWeight: boolean;
  quantity: number;
  subtotal: number;
  stock: number;
  priceWholesale?: number | null;
  minWholesaleQty?: number | null;
  discountPercent?: number | null;
  discountEndDate?: string | null;
  parentId?: string | null;
}

const calcularPrecioUnitarioReal = (item: any, qty: number): number => {
  const ahora = new Date();

  if (item.discountPercent && item.discountPercent > 0) {
    const sigueVigente = !item.discountEndDate || ahora <= new Date(item.discountEndDate);
    if (sigueVigente) {
      const factor = (100 - item.discountPercent) / 100;
      return item.priceSale * factor;
    }
  }

  if (item.priceWholesale && item.minWholesaleQty && qty >= item.minWholesaleQty) {
    return item.priceWholesale;
  }

  return item.priceSale;
};

export default function PosPage() {
  const [appStatus, setAppStatus] = useState<'LOADING' | 'LOCKED' | 'READY'>('LOADING');
  const [catalogoLocal, setCatalogoLocal] = useState<any[]>([]);
  const [clientesLocal, setClientesLocal] = useState<Customer[]>([]); 
  const [tenantId, setTenantId] = useState('');
  const [tenantLocal, setTenantLocal] = useState<any | null>(null);
  const [userId, setUserId] = useState('');

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

  const [weightModalData, setWeightModalData] = useState<{ isOpen: boolean; product: any | null }>({ isOpen: false, product: null });

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
        setTenantLocal(data.tenant || null);
        setAppStatus('READY');
      })
      .catch(() => {
        setAppStatus('LOCKED');
        toast.error("Error al conectar con la caja.");
      });
  }, []);

  useEffect(() => {
    if (appStatus === 'READY') searchInputRef.current?.focus();
  }, [appStatus]);

  // pintar rapido el ticket
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

  // cobrar con F12
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

  // buscador
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toLowerCase();
    if (!query || catalogoLocal.length === 0) return;

    const matchExacto = catalogoLocal.find(p => p.barcode?.toLowerCase() === query);
    if (matchExacto) { addToCart(matchExacto); setSearchInput(""); return; }

    const coincidencias = catalogoLocal.filter(p => p.name.toLowerCase().includes(query) || p.barcode?.toLowerCase().includes(query));

    if (coincidencias.length === 1) { addToCart(coincidencias[0]); setSearchInput(""); } 
    else if (coincidencias.length > 1) { setSearchResults(coincidencias); setIsModalOpen(true); } 
    else { toast.warning(`No encontrado: "${searchInput.trim()}"`); } 
  };

  // agregar al carrito
  const addToCart = (product: any) => {
    if (product.isByWeight) {
      setWeightModalData({ isOpen: true, product });
    } else {
      // Producto normal por piezas, entra con 1 unidad
      processAddToCart(product, 1);
    }
  };

  // actualiza el carrito
  const processAddToCart = (product: any, qtyToAdd: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      
      if (existing) {
        const nuevaQty = existing.quantity + qtyToAdd;
        
        // Ignora el límite si el producto tiene un Padre (se romperá caja)
        if (nuevaQty > product.stock && !product.parentId) {
          toast.error(`Stock insuficiente. Solo quedan ${product.stock} disponibles.`);
          return prev;
        }

        const precioUnitario = calcularPrecioUnitarioReal(product, nuevaQty);

        return prev.map((item) => item.id === product.id
          ? { ...item, quantity: nuevaQty, subtotal: Number((nuevaQty * precioUnitario).toFixed(2)) }
          : item
        );
      }

      // Ignora el límite si el producto tiene un Padre
      if (qtyToAdd > product.stock && !product.parentId) {
        toast.error(`Stock insuficiente. Solo quedan ${product.stock} disponibles.`);
        return prev;
      }

      const precioUnitario = calcularPrecioUnitarioReal(product, qtyToAdd);

      return [...prev, {
        id: product.id, name: product.name, barcode: product.barcode, priceSale: product.priceSale, 
        isByWeight: product.isByWeight, quantity: qtyToAdd, subtotal: Number((qtyToAdd * precioUnitario).toFixed(2)), 
        stock: product.stock, priceWholesale: product.priceWholesale, minWholesaleQty: product.minWholesaleQty,
        discountPercent: product.discountPercent, discountEndDate: product.discountEndDate,
        parentId: product.parentId 
      }];
    });
  };

  const updateQuantity = (id: string, amount: number) => {
    const existing = cart.find(item => item.id === id);
    if (!existing) return;

    const newQty = Math.max(existing.isByWeight ? 0.05 : 1, existing.quantity + amount);
    
    // Ignora el límite al sumar si es un producto hijo
    if (newQty > existing.stock && !existing.parentId) {
      toast.warning("Límite de inventario alcanzado");
      return;
    }

    const precioUnitario = calcularPrecioUnitarioReal(existing, newQty);

    setCart(cart.map((item) =>
      item.id === id
        ? { ...item, quantity: newQty, subtotal: Number((newQty * precioUnitario).toFixed(2)) }
        : item
    ));
  };

  // modificar state de cantidad/peso
  const setExactQuantity = (id: string, exactQty: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        
        // Ignora el límite manual si es un producto hijo
        if (exactQty > item.stock && !item.parentId) {
          toast.warning(`Solo quedan ${item.stock} disponibles en inventario.`);
          return item; 
        }
        
        const precioUnitario = calcularPrecioUnitarioReal(item, exactQty);
        return { ...item, quantity: exactQty, subtotal: Number((exactQty * precioUnitario).toFixed(2)) };
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
    if (paymentMethod === 'CREDIT' && !selectedCustomer) {
      toast.warning('Selecciona un deudor de la libreta para poder fiar la cuenta.'); 
      return;
    }
    
    const snapshotCart = [...cart];
    const snapshotTotal = totalVenta;
    const toastId = toast.loading("Procesando pago..."); 

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
        if (!res.ok) {
          toast.update(toastId, { render: "Error al registrar la venta en la base de datos.", type: "error", isLoading: false, autoClose: 4000 });
        } else {
          toast.update(toastId, { render: "¡Venta cobrada con éxito!", type: "success", isLoading: false, autoClose: 2000 });
        }
        setPaymentMethod('CASH');
        setSelectedCustomer(null);
      });
    } catch (error) { 
      console.error("Error de red:", error); 
      toast.update(toastId, { render: "Error de red al cobrar.", type: "error", isLoading: false, autoClose: 4000 });
    } 
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
              <CartTable cart={cart} updateQuantity={updateQuantity} setExactQuantity={setExactQuantity} removeFromCart={removeFromCart} />
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
        
        <WeightInputModal 
          isOpen={weightModalData.isOpen}
          productName={weightModalData.product?.name || ''}
          onClose={() => {
            setWeightModalData({ isOpen: false, product: null });
            setTimeout(() => searchInputRef.current?.focus(), 50); 
          }}
          onSubmit={(peso) => {
            setWeightModalData({ isOpen: false, product: null });
            processAddToCart(weightModalData.product, peso); 
            setTimeout(() => searchInputRef.current?.focus(), 50);
          }}
        />
      </div>

      <div className="hidden print:block">{ticketData && <div id="ticket-print-container"><Ticket cart={ticketData.cart} total={ticketData.total} date={ticketData.date} tenant={tenantLocal} /></div>}
      </div>
      
    </>
  );
}