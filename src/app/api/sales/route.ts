import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
    try {
      const session = await auth();
      if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      
      const tenantId = (session.user as any).tenantId;
      const userId = session.user.id as string;

      const { cart, paymentMethod } = await request.json();

      if (!cart || cart.length === 0) return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });

      const total = cart.reduce((acc: number, item: any) => acc + item.subtotal, 0);

      const result = await prisma.$transaction(async (tx) => {
        
        const activeSession = await tx.cashSession.findFirst({
          where: { tenantId, userId, status: 'OPEN' },
          select: { id: true } 
        });

        if (!activeSession) throw new Error('Caja_Cerrada');

        const nuevaVenta = await tx.sale.create({
          data: {
            total,
            paymentMethod: paymentMethod || 'CASH',
            tenantId,
            userId,
            cashSessionId: activeSession.id,
            items: {
              create: cart.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity,
                priceSnap: item.priceSale
              }))
            }
          }
        });

       await Promise.all([
          ...cart.map((item: any) => 
            tx.product.update({
              where: { id: item.id },
              data: { stock: { decrement: item.quantity } }
            })
          ),
          tx.cashSession.update({
            where: { id: activeSession.id },
            data: { expectedBalance: { increment: total } }
          })
        ]);

        return nuevaVenta;

      }, {
        maxWait: 5000,  // Milisegundos máximos intentando contactar a PostgreSQL
        timeout: 15000  // Le subimos el límite de asfixia a 15 segundos
      });

      return NextResponse.json({ success: true, saleId: result.id });

    } catch (error: any) {
      if (error.message === 'Caja_Cerrada') {
        return NextResponse.json({ error: 'Debes abrir turno de caja antes de vender.' }, { status: 400 });
      }
      console.error('Error en POST /sales:', error);
      return NextResponse.json({ error: 'Error interno procesando la venta' }, { status: 500 });
    }
  }

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const tenantId = (session.user as any).tenantId;

  const userId = session.user.id as string;

  // Capturar los parámetros de fecha de la URL
  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  // Construir el filtro de tiempo de Prisma
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
              select: { name: true }
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