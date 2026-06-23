import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'No_Auth' }, { status: 401 });

    const tenantId = (session.user as any).tenantId;
    const userId = session.user.id;

    // Disparo SQL optimizado: Pedimos la caja y los dulces al mismo tiempo
    const [cajaAbierta, catalogo] = await Promise.all([
      prisma.cashSession.findFirst({
        where: { tenantId, userId, status: 'OPEN' },
        select: { id: true } 
      }),
      prisma.product.findMany({
        where: { tenantId },
        select: { 
          id: true, 
          name: true, 
          barcode: true, 
          priceSale: true, 
          isByWeight: true, 
          stock: true 
        }
      })
    ]);

    return NextResponse.json({
      tenantId,
      userId,
      isCajaAbierta: !!cajaAbierta,
      catalogo
    });

  } catch (error) {
    return NextResponse.json({ error: 'Error_DB' }, { status: 500 });
  }
}