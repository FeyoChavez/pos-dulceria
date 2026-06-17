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

    // Si algo falla, se cancela todo.
    const result = await prisma.$transaction(async (tx) => {
      const nuevaVenta = await tx.sale.create({
        data: {
          total,
          paymentMethod: paymentMethod || 'CASH',
          tenantId,
          userId,
        },
      });

      // guardar detalles y actualizar inventario
      for (const item of cart) {
        // Guardar el detalle de lo vendido (usando priceSnap para congelar el precio)
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
              decrement: item.quantity, // Prisma 6 maneja decrementos nativos de forma segura
            },
          },
        });
      }

      return nuevaVenta;
    });

    return NextResponse.json({ success: true, saleId: result.id });

  } catch (error) {
    console.error('Error registrando la venta:', error);
    return NextResponse.json({ error: 'Error interno al procesar la venta' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const tenantId = (session.user as any).tenantId;

  try {
    // obtenemos las ventas de esta tienda, incluyendo quien la hizo y que articulos tiene
    const sales = await prisma.sale.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true } // traemos el nombre del cajero 
        },
        items: {
          include: {
            product: {
              select: { name: true } // traemos el nombre del dulce vendido
            }
          }
        }
      }
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error al obtener historial de ventas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}