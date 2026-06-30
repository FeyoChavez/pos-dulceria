import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'No_Auth' }, { status: 401 });

    const tenantId = (session.user as any).tenantId;
    const userId = session.user.id;
    const tenantInfo = await prisma.tenant.findUnique({ where: { id: tenantId }});

    // Descargamos Caja, Productos y Clientes en paralelo
    const [cajaAbierta, catalogo, clientes] = await Promise.all([
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
        stock: true,
        isByWeight: true,
        priceWholesale: true,
        minWholesaleQty: true,
        discountPercent: true,
        discountEndDate: true,
        parentId: true,
        conversionFactor: true,
      }
      }),
      prisma.customer.findMany({
        where: { tenantId },
        select: { id: true, name: true, balance: true },
        orderBy: { name: 'asc' }
      })
    ]);

    return NextResponse.json({
      tenantId,
      userId,
      isCajaAbierta: !!cajaAbierta,
      catalogo,
      clientes,
      tenant: tenantInfo
    });

  } catch (error) {
    return NextResponse.json({ error: 'Error_DB' }, { status: 500 });
  }
}