import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

// ============================================================================
// 1. EL GET: PARA LEER LA TABLA DEL KARDEX
// ============================================================================
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

    const whereClause: any = { tenantId };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) whereClause.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    if (type && type !== 'ALL') {
      whereClause.type = type;
    }

    if (search) {
      whereClause.product = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const movements = await prisma.inventoryMovement.findMany({
      where: whereClause,
      include: {
        product: { select: { name: true, barcode: true, isByWeight: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error('Error fetching inventory movements:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ============================================================================
// 2. EL POST: PARA GUARDAR UN NUEVO AJUSTE DESDE EL MODAL
// ============================================================================
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