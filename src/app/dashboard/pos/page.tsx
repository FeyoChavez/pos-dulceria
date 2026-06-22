'use client';

import React, { useState, useEffect, useRef } from "react";
import SearchBar from "@/components/ui/SearchBar";
import Ticket from "@/components/ui/Ticket";
import CartTable from "./components/CartTable";
import OrderSummary from "./components/OrderSumary";
import SearchModal from "./components/SearchModal";

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
  // Estados Globales
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCobrande, setIsCobrando] = useState(false);
  const [tenantId, setTenantId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [ticketData, setTicketData] = useState<any>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const totalVenta = cart.reduce((acc, item) => acc + item.subtotal, 0);

  // Efectos (Sesión, Ticket, Teclado)
  useEffect(() => {
    const obtenerSesion = async () => {
      const res = await fetch('/api/auth/session');
      const session = await res.json();
      if (session?.user) {
        setTenantId(session.user.tenantId);
        setUserId(session.user.id);
      }
    };
    obtenerSesion();
    searchInputRef.current?.focus();
  }, []);

  // ticket
  useEffect(() => {
      if (ticketData) {
        const timer = setTimeout(() => {
          window.print(); 
        }, 500); 

        const handleAfterPrint = () => {
          setCart([]); 
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12" && cart.length > 0 && !isCobrande && !ticketData) {
        e.preventDefault();
        handleCobrar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, isCobrande, ticketData]);

  // Lógica de Búsqueda
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&tenantId=${tenantId}`);
      if (!response.ok) {
        if (response.status === 404) alert(`No encontrado: "${query}"`);
        return;
      }
      const data = await response.json();
      if (data.product) {
        addToCart(data.product);
        setSearchInput(""); 
      } else if (data.multiple) {
        setSearchResults(data.products);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error al buscar:", error);
    }
  };

  // Lógica del Carrito
  const addToCart = (product: any) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        const addedQuantity = product.isByWeight ? 0.25 : 1;
        
        // Si ya esta en el carrito, verificamos que la suma no supere el stock
        if (existing) {
          if (existing.quantity + addedQuantity > product.stock) {
            alert(`¡Stock insuficiente! Solo te quedan ${product.stock} unidades de ${product.name}.`);
            return prev;
          }

          return prev.map((item) => item.id === product.id
            ? { ...item, quantity: item.quantity + addedQuantity, subtotal: (item.quantity + addedQuantity) * item.priceSale }
            : item
          );
        }
        
        // Si es la primera vez que se agrega, tambien validamos
        if (addedQuantity > product.stock) {
          alert(`¡No hay stock disponible de ${product.name}!`);
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

        // validacion del limite maximo
        if (newQty > item.stock) {
          alert(`Límite alcanzado. Solo tienes ${item.stock} en inventario.`);
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
    if (cart.length === 0 || isCobrande) return;
    setIsCobrando(true);
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, paymentMethod: "CASH", tenantId, userId }),
      });
      if (response.ok) {
        setTicketData({ cart: [...cart], total: totalVenta, date: new Date() });
      } else {
        alert('Hubo un error al procesar el cobro.');
      }
    } catch (error) {
      alert('Error de red al conectar con el servidor.');
    } finally {
      setIsCobrando(false);
    }
  };

return (
    <>
      {/* VISTA NORMAL DEL POS */}
      <div className="print:hidden h-full bg-zinc-50 p-4 lg:p-6 font-sans text-zinc-900">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-6 h-full">
          
          {/* Lado Izquierdo */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-white z-10">
              <SearchBar value={searchInput} onChange={setSearchInput} onSubmit={handleSearchSubmit} inputRef={searchInputRef} placeholder="Escanea el código de barras o escribe y presiona Enter..." />
            </div>
            <div className="flex-1 overflow-x-auto">
              <CartTable cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />
            </div>
          </div>

          {/* Lado Derecho */}
          <OrderSummary itemsCount={cart.length} totalVenta={totalVenta} isCobrande={isCobrande} onCobrar={handleCobrar} />
        </div>

        <SearchModal 
          isOpen={isModalOpen} 
          results={searchResults} 
          onSelect={product => { addToCart(product); setIsModalOpen(false); setSearchInput(""); setTimeout(() => searchInputRef.current?.focus(), 50); }} 
          onClose={() => { setIsModalOpen(false); setSearchInput(""); setTimeout(() => searchInputRef.current?.focus(), 50); }} 
        />
      </div>

      {/* VISTA DE IMPRESION DEL TICKET  */}
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