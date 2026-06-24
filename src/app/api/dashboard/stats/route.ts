import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const tenantId = (session.user as any).tenantId;

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 es Domingo, 1 es Lunes...
    const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0); // Lunes a las 00:00:00

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999); // Domingo a las 23:59:59

    const [sales, lowStockProducts, ventasPorMetodo, abonosPorMetodo] = await Promise.all([
      
      // Consultamos los registros de Lunes a Domingo
      prisma.sale.findMany({
        where: { tenantId, createdAt: { gte: startOfWeek, lte: endOfWeek }, refund: null },
        select: {
          total: true,
          createdAt: true,
          items: {
            select: {
              quantity: true,
              priceSnap: true,
              productId: true,
              product: { select: { name: true, priceCost: true } }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }),

      prisma.product.findMany({
        where: { tenantId, stock: { lte: 5 } },
        select: { name: true, stock: true },
        orderBy: { stock: 'asc' } 
      }),

      prisma.sale.groupBy({
        by: ['paymentMethod'],
        _sum: { total: true },
        where: { tenantId, createdAt: { gte: startOfWeek, lte: endOfWeek }, refund: null }
      }),

      (prisma as any).customerPayment.groupBy({
        by: ['paymentMethod'],
        _sum: { amount: true },
        where: { tenantId, createdAt: { gte: startOfWeek, lte: endOfWeek } }
      })

    ]);

    let totalRevenue = 0;
    let totalCost = 0;
    const dailyDataMap: Record<string, { dia: string; ventas: number; ganancia: number }> = {};
    const productSalesCount: Record<string, { name: string; qty: number }> = {};

    // dibujar de lunes=0 a domingo=i
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);

      const key = currentDay.toISOString().split('T')[0];
      const label = currentDay.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
      dailyDataMap[key] = { dia: label, ventas: 0, ganancia: 0 };
    }

    sales.forEach(sale => {
      totalRevenue += sale.total;
      const dateKey = sale.createdAt.toISOString().split('T')[0];
      let saleCost = 0;

      sale.items.forEach(item => {
        const originalCost = (item.product?.priceCost || 0) * item.quantity;
        saleCost += originalCost;

        if (item.product) {
          if (!productSalesCount[item.productId]) {
            productSalesCount[item.productId] = { name: item.product.name, qty: 0 };
          }
          productSalesCount[item.productId].qty += item.quantity;
        }
      });

      totalCost += saleCost;

      if (dailyDataMap[dateKey]) {
        dailyDataMap[dateKey].ventas += sale.total;
        dailyDataMap[dateKey].ganancia += (sale.total - saleCost);
      }
    });

    const breakdown = { CASH: 0, CARD: 0, TRANSFER: 0, CREDIT: 0 };

    ventasPorMetodo.forEach((v: any) => {
      const m = v.paymentMethod as keyof typeof breakdown;
      if (breakdown[m] !== undefined) breakdown[m] += (v._sum.total || 0);
    });

    abonosPorMetodo.forEach((a: any) => {
      const m = a.paymentMethod as keyof typeof breakdown;
      if (breakdown[m] !== undefined) breakdown[m] += (a._sum.amount || 0);
    });

    const lowStockList = lowStockProducts.slice(0, 5); 
    const lowStockCount = lowStockProducts.length;
    
    return NextResponse.json({
      kpis: {
        revenue: Number(totalRevenue.toFixed(2)),
        netProfit: Number((totalRevenue - totalCost).toFixed(2)),
        salesCount: sales.length,
        lowStockCount
      },
      chartData: Object.values(dailyDataMap),
      topProducts: Object.values(productSalesCount).sort((a, b) => b.qty - a.qty).slice(0, 5),
      breakdown, 
      lowStockList
    });

  } catch (error) {
    console.error('Error en API Dashboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}