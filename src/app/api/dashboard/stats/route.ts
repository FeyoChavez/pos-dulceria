import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const tenantId = (session.user as any).tenantId;

    // Rango de tiempo: Últimos 7 días para la gráfica semanal
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 1. Obtener todas las ventas y sus productos en el rango de 7 días
    const sales = await prisma.sale.findMany({
      where: {
        tenantId,
        createdAt: { gte: sevenDaysAgo },
        refund: null // Excluimos ventas que fueron devueltas
      },
      include: {
        items: { include: { product: { select: { name: true, priceCost: true } } } }
      },
      orderBy: { createdAt: 'asc' }
    });

    // 2. Procesamiento financiero de KPIs y Gráfica
    let totalRevenue = 0;
    let totalCost = 0;
    const dailyDataMap: Record<string, { dia: string; ventas: number; ganancia: number }> = {};
    const productSalesCount: Record<string, { name: string; qty: number }> = {};

    // Inicializar los últimos 7 días con ceros para que la gráfica no salga mocha si no hay ventas
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
      const key = d.toISOString().split('T')[0];
      dailyDataMap[key] = { dia: label, ventas: 0, ganancia: 0 };
    }

    // Iterar sobre las ventas reales para poblar la analítica
    sales.forEach(sale => {
      totalRevenue += sale.total;
      const dateKey = sale.createdAt.toISOString().split('T')[0];
      
      let saleCost = 0;

      sale.items.forEach(item => {
        const cost = item.priceSnap * item.quantity; // Basado en el precio capturado
        const originalCost = (item.product?.priceCost || 0) * item.quantity;
        saleCost += originalCost;

        // Contador para dulces más vendidos
        if (item.product) {
          if (!productSalesCount[item.productId]) {
            productSalesCount[item.productId] = { name: item.product.name, qty: 0 };
          }
          productSalesCount[item.productId].qty += item.quantity;
        }
      });

      totalCost += saleCost;

      // Inyectar datos en el mapa de la gráfica por día
      if (dailyDataMap[dateKey]) {
        dailyDataMap[dateKey].ventas += sale.total;
        dailyDataMap[dateKey].ganancia += (sale.total - saleCost);
      }
    });

    // Formatear la data de la gráfica para Recharts (Convertir objeto a Array ordenado)
    const chartData = Object.values(dailyDataMap);

    // Obtener el Top 5 de productos más vendidos
    const topProducts = Object.values(productSalesCount)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Cantidad de alertas de stock bajo (Menos de 5 unidades)
    const lowStockCount = await prisma.product.count({
      where: { tenantId, stock: { lte: 5 } }
    });

    return NextResponse.json({
      kpis: {
        revenue: totalRevenue,
        netProfit: totalRevenue - totalCost,
        salesCount: sales.length,
        lowStockCount
      },
      chartData,
      topProducts
    });

  } catch (error) {
    console.error('Error compiling dashboard data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}