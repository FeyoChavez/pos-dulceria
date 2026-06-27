'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import PurchaseHeaderForm from './components/PurchaseHeaderForm';
import ProductPredictiveSearch from './components/ProductPredictiveSearch';
import ReceivedItemsTable from './components/ReceivedItemsTable';
import PurchaseSummaryBar from './components/PurchaseSummaryBar';

export default function NuevaCompraPage() {
  const router = useRouter();
  
  // Catálogos precargados
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Estados de la nota
  const [supplierId, setSupplierId] = useState('');
  const [fundingSource, setFundingSource] = useState('CASH_REGISTER');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [cart, setCart] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const [resSup, resProd] = await Promise.all([
          fetch('/api/suppliers'),
          fetch('/api/products') 
        ]);
        if (resSup.ok) setSuppliers(await resSup.json());
        if (resProd.ok) setProducts(await resProd.json());
      } catch { toast.error("Error cargando catálogos"); }
      finally { setLoadingInitial(false); }
    };
    initData();
  }, []);

  // Lógica de Carrito
  const handleAddProduct = (prod: any) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === prod.id);
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      // Por defecto sugerimos un costo estimado del 70% del precio de venta, o 0
      const costoSugerido = prod.cost || (prod.price ? Number((prod.price * 0.7).toFixed(2)) : 0);
      return [...prev, { product: prod, quantity: 1, costPrice: costoSugerido }];
    });
    toast.info(`+ ${prod.name}`, { autoClose: 1000, hideProgressBar: true });
  };

  const handleUpdateQty = (idx: number, val: number) => {
    setCart(prev => prev.map((item, i) => i === idx ? { ...item, quantity: val } : item));
  };

  const handleUpdateCost = (idx: number, val: number) => {
    setCart(prev => prev.map((item, i) => i === idx ? { ...item, costPrice: val } : item));
  };

  const handleRemove = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const totalCompra = cart.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0);
  const isCartValid = cart.length > 0 && cart.every(i => i.quantity > 0 && i.costPrice >= 0 && i.costPrice !== '');
  const isFormReady = Boolean(supplierId) && isCartValid;

  // GATILLO DE GUARDADO
  const handleSubmitPurchase = async () => {
    if (!supplierId) return toast.warning("Selecciona un proveedor");
    if (cart.length === 0) return toast.warning("Agrega al menos un producto");
    
    setSubmitting(true);
    const toastId = toast.loading("Procesando entrada de almacén...");

    const payload = {
      supplierId,
      fundingSource,
      paymentMethod,
      items: cart.map(i => ({
        productId: i.product.id,
        quantity: i.quantity,
        costPrice: i.costPrice
      }))
    };

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        toast.update(toastId, { render: "¡Inventario cargado exitosamente!", type: "success", isLoading: false, autoClose: 2000 });
        router.push('/dashboard/proveedores'); // O a tu futura tabla de historial de compras
        router.refresh();
      } else {
        toast.update(toastId, { render: data.error || "Error al registrar", type: "error", isLoading: false, autoClose: 4000 });
      }
    } catch {
      toast.update(toastId, { render: "Fallo de conexión", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return <div className="h-full flex items-center justify-center text-zinc-400 font-medium text-sm">Cargando motor de almacén...</div>;
  }

  return (
    <div className="min-h-full bg-zinc-50 p-4 lg:p-8 font-sans text-zinc-900 pb-28">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* NAVEGACIÓN */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/proveedores" className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Recepción de Mercancía</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Genera una nota de compra para incrementar stock automáticamente.</p>
          </div>
        </div>

        <PurchaseHeaderForm
          suppliers={suppliers} supplierId={supplierId} onSupplierChange={setSupplierId}
          fundingSource={fundingSource} onSourceChange={setFundingSource}
          paymentMethod={paymentMethod} onMethodChange={setPaymentMethod}
        />

        <ProductPredictiveSearch products={products} onSelectProduct={handleAddProduct} />

        <ReceivedItemsTable 
          items={cart} onUpdateQty={handleUpdateQty} 
          onUpdateCost={handleUpdateCost} onRemove={handleRemove} 
        />

        <PurchaseSummaryBar
          total={totalCompra} itemCount={cart.length}
          onSubmit={handleSubmitPurchase} isSubmitting={submitting}
          disabled={!isFormReady}
        />

      </div>
    </div>
  );
}