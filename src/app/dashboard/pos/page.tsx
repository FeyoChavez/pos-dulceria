"use client";

import React, { useState, useEffect, useRef } from "react";
import SearchBar from "@/components/ui/SearchBar";

interface CartItem {
  id: string;
  name: string;
  barcode: string | null;
  priceSale: number;
  isByWeight: boolean;
  quantity: number;
  subtotal: number;
}

export default function PosPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCobrande, setIsCobrando] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [tenantId, setTenantId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

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
  }, []);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12" && cart.length > 0 && !isCobrande) {
        e.preventDefault();
        handleCobrar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, isCobrande]);

  // Búsqueda controlada: Solo se ejecuta al dar Enter
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(query)}&tenantId=${tenantId}`,
      );
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

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        const addedQuantity = product.isByWeight ? 0.25 : 1;
        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + addedQuantity,
                subtotal: (item.quantity + addedQuantity) * item.priceSale,
              }
            : item,
        );
      }
      const initialQuantity = product.isByWeight ? 0.25 : 1;
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          priceSale: product.priceSale,
          isByWeight: product.isByWeight,
          quantity: initialQuantity,
          subtotal: initialQuantity * product.priceSale,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    searchInputRef.current?.focus();
  };

  const handleSelectFromModal = (product: any) => {
    addToCart(product);
    setIsModalOpen(false);
    setSearchResults([]);
    setSearchInput("");
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  // Función para mandar la venta al Backend
  const handleCobrar = async () => {
    if (cart.length === 0 || isCobrande) return;
    setIsCobrando(true);

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          paymentMethod: "CASH",
          tenantId: tenantId,
          userId: userId,
        }),
      });

      if (response.ok) {
        alert("¡Venta procesada con éxito y stock actualizado!");
        setCart([]); // Limpia la caja para la siguiente venta
      } else {
        alert("Hubo un error al procesar el cobro.");
      }
    } catch (error) {
      console.error("Error al cobrar:", error);
      alert("Error de red al conectar con el servidor.");
    } finally {
      setIsCobrando(false);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  };

  const totalVenta = cart.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="min-h-screen bg-zinc-50 p-4 lg:p-6 font-sans text-zinc-900 relative">
      <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-6 h-full">
        {/* TABLA IZQUIERDA */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="p-5 border-b border-zinc-100 bg-white z-10">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={handleSearchSubmit}
              inputRef={searchInputRef}
              placeholder="Escanea el código de barras o escribe y presiona Enter..."
            />
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead className="sticky top-0 bg-zinc-50/90 backdrop-blur-sm z-10">
                <tr className="text-zinc-500 text-xs uppercase tracking-wider font-semibold border-b border-zinc-200">
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4 text-center">Cantidad / Peso</th>
                  <th className="px-6 py-4 text-right">Precio</th>
                  <th className="px-6 py-4 text-right">Subtotal</th>
                  <th className="px-6 py-4 text-center w-16"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                        <svg
                          className="w-16 h-16 mb-4 text-zinc-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <p className="text-lg font-medium text-zinc-500">
                          La caja está vacía
                        </p>
                        <p className="text-sm mt-1">
                          Escanea un producto para comenzar a cobrar
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cart.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-zinc-900">{item.name}</p>
                        {item.barcode && (
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {item.barcode}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg p-1">
                          {/* Botón de restar cantidad */}
                          <button
                            onClick={() => {
                              setCart((prev) =>
                                prev.map((p) =>
                                  p.id === item.id
                                    ? {
                                        ...p,
                                        quantity: Math.max(
                                          p.isByWeight ? 0.05 : 1,
                                          p.quantity -
                                            (p.isByWeight ? 0.25 : 1),
                                        ),
                                        subtotal:
                                          Math.max(
                                            p.isByWeight ? 0.05 : 1,
                                            p.quantity -
                                              (p.isByWeight ? 0.25 : 1),
                                          ) * p.priceSale,
                                      }
                                    : p,
                                ),
                              );
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 text-zinc-600 font-bold text-sm transition-colors"
                          >
                            -
                          </button>

                          <span className="min-w-[60px] text-sm font-semibold text-zinc-800">
                            {item.isByWeight
                              ? `${item.quantity.toFixed(3)} kg`
                              : `${item.quantity} pza`}
                          </span>

                          {/* Botón de sumar cantidad */}
                          <button
                            onClick={() => {
                              const added = item.isByWeight ? 0.25 : 1;
                              setCart((prev) =>
                                prev.map((p) =>
                                  p.id === item.id
                                    ? {
                                        ...p,
                                        quantity: p.quantity + added,
                                        subtotal:
                                          (p.quantity + added) * p.priceSale,
                                      }
                                    : p,
                                ),
                              );
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-200 text-zinc-600 font-bold text-sm transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right text-zinc-600">
                        ${item.priceSale.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold text-zinc-900 text-lg">
                        ${item.subtotal.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-zinc-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RESUMEN DERECHA */}
        <div className="w-full lg:w-[400px] flex flex-col bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-zinc-900 mb-6">
              Resumen de Venta
            </h2>
            <div className="space-y-4 text-sm text-zinc-600">
              <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                <span>Total de artículos</span>
                <span className="font-medium text-zinc-900">{cart.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                <span>Subtotal base</span>
                <span className="font-medium text-zinc-900">
                  ${totalVenta.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-200">
            <div className="flex justify-between items-end mb-6">
              <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                Total a Pagar
              </span>
              <span className="text-4xl font-bold text-zinc-900 tracking-tight">
                ${totalVenta.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCobrar}
              disabled={cart.length === 0 || isCobrande}
              className="w-full bg-zinc-900 text-white py-4 px-6 rounded-xl font-medium text-lg shadow-md shadow-zinc-900/20 hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isCobrande ? "Procesando..." : "Cobrar Venta"}
            </button>
            <p className="text-center text-xs text-zinc-400 mt-3">
              Presiona F12 para cobrar rápidamente
            </p>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-100">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-lg font-semibold text-zinc-900">
                Selecciona un producto
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSearchInput("");
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              <ul className="space-y-1">
                {searchResults.map((product) => (
                  <li key={product.id}>
                    <button
                      onClick={() => handleSelectFromModal(product)}
                      className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-zinc-50 active:bg-zinc-100 text-left group"
                    >
                      <div>
                        <p className="font-medium text-zinc-900 group-hover:text-zinc-600">
                          {product.name}
                        </p>
                        <p className="text-sm text-zinc-500 mt-0.5">
                          {product.barcode
                            ? `Cód: ${product.barcode}`
                            : "Sin código"}{" "}
                          •{" "}
                          {product.isByWeight ? "Venta a granel" : "Por pieza"}
                        </p>
                      </div>
                      <span className="font-semibold text-zinc-900">
                        ${product.priceSale.toFixed(2)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
