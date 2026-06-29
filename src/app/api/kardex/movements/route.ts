import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const tenantId = (session.user as any).tenantId;
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Filtro de hora local México (-06:00)
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(`${startDate}T00:00:00.000-06:00`);
    if (endDate) dateFilter.lte = new Date(`${endDate}T23:59:59.999-06:00`);
    const hasDateFilter = Boolean(startDate || endDate);

    const searchFilter = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { barcode: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    // Mermas e Incidencias manuales
    const movementsPromise = (!type || type === 'ALL' || ['IN', 'OUT'].includes(type))
      ? prisma.inventoryMovement.findMany({
          where: {
            tenantId,
            ...(hasDateFilter ? { createdAt: dateFilter } : {}),
            ...(type && type !== 'ALL' ? { type } : {}),
            ...(search ? { product: searchFilter } : {})
          },
          include: {
            product: { select: { name: true, barcode: true, isByWeight: true } },
            user: { select: { name: true } },
          }
        })
      : Promise.resolve([]);

    //  Entradas por Compras de Almacén
    const purchasesPromise = (!type || type === 'ALL' || type === 'PURCHASE' || type === 'IN')
      ? prisma.purchaseItem.findMany({
          where: {
            purchase: { tenantId, ...(hasDateFilter ? { createdAt: dateFilter } : {}) },
            ...(search ? { product: searchFilter } : {})
          },
          include: {
            product: { select: { name: true, barcode: true, isByWeight: true } },
            purchase: { select: { id: true, createdAt: true, supplier: { select: { name: true } } } }
          }
        })
      : Promise.resolve([]);

    // Salidas por Ventas en el POS
    const salesPromise = (!type || type === 'ALL' || type === 'SALE' || type === 'OUT')
      ? prisma.saleItem.findMany({
          where: {
            sale: { tenantId, ...(hasDateFilter ? { createdAt: dateFilter } : {}) },
            ...(search ? { product: searchFilter } : {})
          },
          include: {
            product: { select: { name: true, barcode: true, isByWeight: true } },
            sale: { select: { id: true, createdAt: true } }
          }
        })
      : Promise.resolve([]);

    const [rawMovements, rawPurchases, rawSales] = await Promise.all([movementsPromise, purchasesPromise, salesPromise]);

    // NORMALIZACIÓN A
    const normalizedMovements = rawMovements.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString()
    }));

    // NORMALIZACIÓN B
    const normalizedPurchases = rawPurchases.map(pi => ({
      id: `PUR-${pi.id}`,
      quantity: pi.quantity,
      type: 'PURCHASE', 
      reason: `Compra Almacén #${pi.purchase.id.slice(-6).toUpperCase()} (${pi.purchase.supplier.name})`,
      createdAt: pi.purchase.createdAt.toISOString(),
      product: pi.product,
      user: { name: 'Recepción Almacén' }
    }));

    // NORMALIZACIÓN C (Las ventas del POS)
    const normalizedSales = rawSales.map(si => ({
      id: `POS-${si.id}`,
      quantity: si.quantity,
      type: 'SALE', 
      reason: `Ticket Venta POS #${si.sale.id.slice(-6).toUpperCase()}`,
      createdAt: si.sale.createdAt.toISOString(),
      product: si.product,
      user: { name: 'Cajero POS' }
    }));

    // Fusión total y ordenamiento cronológico perfecto
    const universalKardex = [...normalizedMovements, ...normalizedPurchases, ...normalizedSales].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(universalKardex);

  } catch (error) {
    console.error('Error fetching universal kardex:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
// Guardar ajustes del modal Ajustar Stock
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const tenantId = (session.user as any).tenantId;
    const userId = session.user.id;

    const body = await request.json();
    const { productId, type, quantity, reason } = body;
    const qty = Number(quantity);

    if (!productId) return NextResponse.json({ error: 'Falta el ID del producto' }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const movement = await tx.inventoryMovement.create({
        data: { type, quantity: qty, reason, productId, tenantId, userId: userId! }
      });

      const product = await tx.product.update({
        where: { id: productId, tenantId },
        data: {
          stock: type === 'IN' ? { increment: qty } : { decrement: qty }
        }
      });

      return { movement, newStock: product.stock };
    });

    return NextResponse.json({ success: true, data: result });

  } catch (error: any) {
    console.error("Error al guardar movimiento:", error);
    return NextResponse.json({ error: error.message || 'Error interno al guardar' }, { status: 500 });
  }
}