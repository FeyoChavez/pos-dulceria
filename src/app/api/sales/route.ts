import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const tenantId = (session.user as any).tenantId;
  const userId = session.user.id as string;

  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  const dateFilter: any = {};
  if (startDateStr) {
    dateFilter.gte = new Date(`${startDateStr}T00:00:00.000-06:00`);
  }
  if (endDateStr) {
    dateFilter.lte = new Date(`${endDateStr}T23:59:59.999-06:00`);
  }

  try {
    const sales = await prisma.sale.findMany({
      where: { 
        tenantId,
        // Si se pasan fechas, filtramos el campo createdAt
        ...(startDateStr || endDateStr ? { createdAt: dateFilter } : {})
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        },
        items: {
          include: {
            product: {
              select: { 
                name: true,
                isByWeight: true
               }
            }
          }
        },
        refund: true
      }
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error al obtener historial de ventas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

async function procesarSalidaConRuptura(tx: any, productId: string, tenantId: string, userId: string, qtyNeeded: number) {
  const prod = await tx.product.findUnique({
    where: { id: productId, tenantId },
    select: { id: true, name: true, stock: true, parentId: true, conversionFactor: true }
  });

  if (!prod) throw new Error('Producto_No_Encontrado');

  // CAMINO A: Hay stock suelto suficiente para surtir la venta
  if (prod.stock >= qtyNeeded) {
    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: qtyNeeded } }
    });
    return;
  }

  // CAMINO B: No alcanza el stock suelto, evaluamos si podemos "abrir una caja" (Tiene Padre)
  if (prod.parentId && prod.conversionFactor && prod.conversionFactor > 0) {
    const stockFaltante = qtyNeeded - prod.stock;
    const cajasAAbrir = Math.ceil(stockFaltante / prod.conversionFactor);

    // Rompemos las cajas necesarias del producto Padre recursivamente
    await procesarSalidaConRuptura(tx, prod.parentId, tenantId, userId, cajasAAbrir);

    // Calculamos cuantas piezas sueltas salieron de esas cajas
    const piezasGeneradas = cajasAAbrir * prod.conversionFactor;

    // Dejamos el rastro en el Kardex Universal para auditoría
    await tx.inventoryMovement.create({
      data: {
        type: 'IN',
        quantity: piezasGeneradas,
        reason: `Desempaque automático (${cajasAAbrir} caja/s) para surtir venta de: ${prod.name}`,
        productId: prod.id,
        tenantId,
        userId
      }
    });

    // Actualizamos el stock final del producto hijo (Lo que tenía + lo que salió de la caja - lo que se vendió hoy)
    const stockFinal = prod.stock + piezasGeneradas - qtyNeeded;

    await tx.product.update({
      where: { id: prod.id },
      data: { stock: stockFinal }
    });

  } else {
    // CAMINO C: Es un producto normal sin caja o ya no hay cajas en el almacén. 
    // Restamos directo (permitiendo negativos contables de mostrador)
    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: qtyNeeded } }
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const tenantId = (session.user as any).tenantId;
    const userId = session.user.id as string;

    const { cart, paymentMethod, customerId } = await request.json();

    if (!cart || cart.length === 0) return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
    if (paymentMethod === 'CREDIT' && !customerId) {
      return NextResponse.json({ error: 'Debes seleccionar un cliente para ventas a crédito.' }, { status: 400 });
    }

    const total = Number(cart.reduce((acc: number, item: any) => acc + item.subtotal, 0).toFixed(2));

    const result = await prisma.$transaction(async (tx) => {
      
      const activeSession = await tx.cashSession.findFirst({
        where: { tenantId, userId, status: 'OPEN' },
        select: { id: true } 
      });

      if (!activeSession) throw new Error('Caja_Cerrada');

      // Crear el ticket maestro de venta
      const nuevaVenta = await tx.sale.create({
        data: {
          total,
          paymentMethod,
          tenantId,
          userId,
          cashSessionId: activeSession.id,
          customerId: paymentMethod === 'CREDIT' ? customerId : null,
          items: {
            create: cart.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              priceSnap: item.quantity > 0 ? Number((item.subtotal / item.quantity).toFixed(2)) : item.priceSale
            }))
          }
        }
      });

      // Descontar de inventario
      for (const item of cart) {
        await procesarSalidaConRuptura(tx, item.id, tenantId, userId, Number(item.quantity));
      }

      // Operaciones Financieras y de Arqueo (En paralelo)
      const finOps: any[] = [];

      if (paymentMethod === 'CREDIT') {
        finOps.push(
          tx.customer.update({
            where: { id: customerId },
            data: { balance: { decrement: total } }
          })
        );
      } else if (paymentMethod === 'CASH') {
        finOps.push(
          tx.cashSession.update({
            where: { id: activeSession.id },
            data: { expectedBalance: { increment: total } }
          })
        );
      }

      if (finOps.length > 0) await Promise.all(finOps);

      return nuevaVenta;

    }, { maxWait: 5000, timeout: 15000 });

    return NextResponse.json({ success: true, saleId: result.id });

  } catch (error: any) {
    if (error.message === 'Caja_Cerrada') {
      return NextResponse.json({ error: 'Turno de caja cerrado.' }, { status: 400 });
    }
    console.error('Error en POS:', error);
    return NextResponse.json({ error: 'Error procesando la venta' }, { status: 500 });
  }
}