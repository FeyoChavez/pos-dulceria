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
    dateFilter.gte = new Date(`${startDateStr}T00:00:00.000Z`);
  }
  if (endDateStr) {
    dateFilter.lte = new Date(`${endDateStr}T23:59:59.999Z`);
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

      // Crear la venta vinculando al cliente si es credito
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

      // Operaciones Contables específicas por método de pago
      const operaciones = [
        ...cart.map((item: any) => 
          tx.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.quantity } }
          })
        )
      ];

      if (paymentMethod === 'CREDIT') {
        // Si es credito, restamos el dinero de su balance (acumula deuda negativa)
        operaciones.push(
          tx.customer.update({
            where: { id: customerId },
            data: { balance: { decrement: total } }
          })
        );
      } else if (paymentMethod === 'CASH') {
        // SOLO el efectivo físico incrementa el arqueo esperado de la caja
        operaciones.push(
          tx.cashSession.update({
            where: { id: activeSession.id },
            data: { expectedBalance: { increment: total } }
          })
        );
      }

      await Promise.all(operaciones);
      return nuevaVenta;

    }, { maxWait: 5000, timeout: 15000 });

    return NextResponse.json({ success: true, saleId: result.id });

  } catch (error: any) {
    if (error.message === 'Caja_Cerrada') {
      return NextResponse.json({ error: 'Turno de caja cerrado.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error procesando la venta' }, { status: 500 });
  }
}