import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  const tenantId = (session.user as any).tenantId; // desde la url

  if (!query) {
    return NextResponse.json({ error: 'Faltan parámetros de búsqueda' }, { status: 400 });
  }

  try {
    // buscar por código de barras exacto 
    const productByBarcode = await prisma.product.findFirst({
      where: {
        tenantId: tenantId,
        barcode: query,
      },
    });

    if (productByBarcode) {
      return NextResponse.json({ product: productByBarcode });
    }

    // Si no es un código de barras, buscamos coincidencias en el nombre 
    const productsByName = await prisma.product.findMany({
      where: {
        tenantId: tenantId,
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: 5, // Limitamos a 5 resultados para no saturar si busca algo muy genérico como "Goma"
    });

    if (productsByName.length > 0) {
      if (productsByName.length === 1) {
        return NextResponse.json({ product: productsByName[0] });
      }
      return NextResponse.json({ products: productsByName, multiple: true });
    }

    // Si no encuentra nada
    return NextResponse.json({ product: null }, { status: 404 });

  } catch (error) {
    console.error('Error buscando producto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}