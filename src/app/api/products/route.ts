import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const tenantId = (session.user as any).tenantId;

  try {
    const products = await prisma.product.findMany({
      where: { 
        tenantId},
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const tenantId = (session.user as any).tenantId;

  try {
    const body = await request.json();
    const { name, barcode, priceCost, priceSale, stock, isByWeight, parentId, conversionFactor } = body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        barcode: barcode || null,
        priceCost: Number(priceCost),
        priceSale: Number(priceSale),
        stock: Number(stock),
        isByWeight: Boolean(isByWeight),
        tenantId,

        priceWholesale: body.priceWholesale,
        minWholesaleQty: body.minWholesaleQty,
        discountPercent: body.discountPercent,
        discountEndDate: body.discountEndDate,

        parentId: parentId ? String(parentId) : null,
        conversionFactor: conversionFactor ? Number(conversionFactor) : null
      },
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}