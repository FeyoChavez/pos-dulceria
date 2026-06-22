import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const tenantId = (session.user as any).tenantId;
    const userId = session.user.id as string;

    const body = await request.json();
    const { saleId, reason, restock } = body;

    if (!saleId) return NextResponse.json({ error: 'ID de venta requerido' }, { status: 400 });

    // Obtener la venta original y validar que no esté ya devuelta
    const originalSale = await prisma.sale.findUnique({
      where: { id: saleId, tenantId },
      include: { items: true, refund: true }
    });

    if (!originalSale) return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
    if (originalSale.refund) return NextResponse.json({ error: 'Esta venta ya fue devuelta previamente' }, { status: 400 });

    // Validar sesión de caja SI el pago fue en efectivo
    let activeSession = null;
    if (originalSale.paymentMethod === 'CASH') {
      activeSession = await prisma.cashSession.findFirst({
        where: { tenantId, userId, status: 'OPEN' }
      });
      
      if (!activeSession) {
        return NextResponse.json({ 
          error: 'Debes tener un turno de caja abierto para devolver dinero en efectivo.' 
        }, { status: 400 });
      }
    }

    // Ejecutar la transacción maestra
    const result = await prisma.$transaction(async (tx) => {
      
      // Crear el ticket de reembolso
      const refund = await tx.refund.create({
        data: {
          amount: originalSale.total,
          reason: reason || 'Devolución solicitada por el cliente',
          restock: restock !== undefined ? restock : true, 
          saleId: originalSale.id,
          tenantId,
          userId, 
          cashSessionId: activeSession ? activeSession.id : null,
        }
      });

      // Descontar el dinero de la caja activa actual
      if (activeSession && originalSale.paymentMethod === 'CASH') {
        await tx.cashSession.update({
          where: { id: activeSession.id },
          data: {
            expectedBalance: {
              decrement: originalSale.total
            }
          }
        });
      }

      // Regresar el producto al inventario (si restock es true)
      if (restock !== false) {
        for (const item of originalSale.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { 
                increment: item.quantity // Prisma devuelve el stock mágicamente
              }
            }
          });
        }
      }

      return refund;
    });

    return NextResponse.json({ success: true, refund: result });

  } catch (error) {
    console.error('Error procesando devolución:', error);
    return NextResponse.json({ error: 'Error interno al procesar la devolución' }, { status: 500 });
  }
}