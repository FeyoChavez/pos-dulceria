import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  // Esperamos los parámetros de la ruta antes de usarlos
  const { id } = await params;

  try {
    const body = await request.json();
    const { name, barcode, priceCost, priceSale, stock, isByWeight } = body;

    const updatedProduct = await prisma.product.update({
      // Validamos el id y aseguramos que el producto pertenezca al tenant actual
      where: { id, tenantId: (session.user as any).tenantId },
      data: {
        name,
        barcode: barcode || null,
        priceCost: Number(priceCost),
        priceSale: Number(priceSale),
        stock: Number(stock),
        isByWeight: Boolean(isByWeight),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.product.delete({
      where: { id, tenantId: (session.user as any).tenantId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 });
  }
}