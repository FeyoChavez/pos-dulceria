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

    // Construcción dinámica del filtro de Prisma
    const whereClause: any = {
      tenantId,
    };

    // Filtro por rango de fechas
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) whereClause.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    // Filtro por tipo de movimiento
    if (type && type !== 'ALL') {
      whereClause.type = type;
    }

    // Filtro por búsqueda de producto (Nombre o código)
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
        product: {
          select: {
            name: true,
            barcode: true,
            isByWeight: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error('Error fetching inventory movements:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}