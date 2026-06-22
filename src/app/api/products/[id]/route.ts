import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const tenantId = (session.user as any).tenantId;

    const { id } = await params;

    const body = await request.json();
    const { name, barcode, priceCost, priceSale, isByWeight } = body;

    if (!name || priceCost === undefined || priceSale === undefined) {
      return NextResponse.json({ error: 'Faltan campos mandatorios (Nombre, Costo o Venta)' }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { 
        id, 
        tenantId 
      },
      data: {
        name,
        barcode: barcode === '' ? null : barcode,
        priceCost: Number(priceCost),
        priceSale: Number(priceSale),
        isByWeight: Boolean(isByWeight),
      }
    });

    return NextResponse.json(updatedProduct);

  } catch (error: any) {
    console.error("ERROR REAL EN PUT /api/products/[id]:", error); 
    return NextResponse.json({ error: 'Error interno al actualizar el producto' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> } 
) {

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