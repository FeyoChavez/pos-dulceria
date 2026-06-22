import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cart, paymentMethod, tenantId, userId } = body;

    if (!cart || cart.length === 0 || !tenantId || !userId) {
      return NextResponse.json({ error: 'Datos de venta incompletos' }, { status: 400 });
    }

    // Calcular el total en el servidor para evitar manipulaciones en el cliente
    const total = cart.reduce((acc: number, item: any) => acc + item.subtotal, 0);

    // Ejecutamos todo dentro de la transacción segura
    const result = await prisma.$transaction(async (tx) => {
      
      // VALIDACIÓN CRÍTICA: Buscar si el cajero tiene un turno/caja abierta actualmente
      const activeSession = await tx.cashSession.findFirst({
        where: { 
          tenantId, 
          userId, 
          status: 'OPEN' 
        }
      });

      // Si no hay caja abierta:
      if (!activeSession) {
        throw new Error('Caja_Cerrada');
      }

      // Crear la Venta asignándole el cashSessionId de la caja activa
      const nuevaVenta = await tx.sale.create({
        data: {
          total,
          paymentMethod: paymentMethod || 'CASH',
          tenantId,
          userId,
          cashSessionId: activeSession.id, //  Conectamos la venta al corte actual
        },
      });

      // Guardar detalles y actualizar inventario
      for (const item of cart) {
        // Guardar el detalle de lo vendido
        await tx.saleItem.create({
          data: {
            saleId: nuevaVenta.id,
            productId: item.id,
            quantity: item.quantity,
            priceSnap: item.priceSale,
          },
        });

        // Descontar del inventario del producto
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return nuevaVenta;
    });

    return NextResponse.json({ success: true, saleId: result.id });

  } catch (error: any) {
    // Si la transacción se canceló porque la caja estaba cerrada, respondemos con código 400
    if (error.message === 'Caja_Cerrada') {
      return NextResponse.json({ error: 'Debes abrir turno/caja antes de realizar una venta.' }, { status: 400 });
    }

    console.error('Error registrando la venta:', error);
    return NextResponse.json({ error: 'Error interno al procesar la venta' }, { status: 500 });
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