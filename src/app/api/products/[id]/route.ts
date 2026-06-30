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
    
    const { 
      name, barcode, priceCost, priceSale, isByWeight,
      priceWholesale, minWholesaleQty, discountPercent, discountEndDate,
      parentId, conversionFactor
    } = body;

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

        priceWholesale: priceWholesale ? Number(priceWholesale) : null,
        minWholesaleQty: minWholesaleQty ? Number(minWholesaleQty) : null,
        discountPercent: discountPercent ? Number(discountPercent) : null,
        discountEndDate: discountEndDate ? new Date(discountEndDate) : null,

        parentId: parentId || null,
        conversionFactor: conversionFactor ? Number(conversionFactor) : null
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
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const tenantId = (session.user as any).tenantId;
    const { id } = await params;

    // soft delete
    await prisma.product.update({
      where: { id, tenantId },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true, message: 'Producto archivado correctamente' });

  } catch (error: any) {
    console.error("Error archivando producto:", error);
    return NextResponse.json({ error: 'Error interno al intentar archivar el producto' }, { status: 500 });
  }
}