import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

//  OBTENER CATÁLOGO DE PROVEEDORES
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  try {
    const suppliers = await prisma.supplier.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener proveedores' }, { status: 500 });
  }
}

//  REGISTRAR UN NUEVO PROVEEDOR
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  try {
    const { name, phone, email, address } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre del proveedor es obligatorio' }, { status: 400 });
    }

    const newSupplier = await prisma.supplier.create({
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        tenantId
      }
    });

    return NextResponse.json(newSupplier);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// EDITAR UN PROVEEDOR EXISTENTE
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  try {
    const { id, name, phone, email, address } = await request.json();

    if (!id || !name || !name.trim()) {
      return NextResponse.json({ error: 'El ID y el Nombre son obligatorios' }, { status: 400 });
    }

    const updated = await prisma.supplier.update({
      where: { id, tenantId },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar el proveedor' }, { status: 500 });
  }
}

// ELIMINAR PROVEEDOR
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID faltante' }, { status: 400 });

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id, tenantId },
      include: { _count: { select: { purchases: true } } }
    });

    if (!supplier) return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });

    if (supplier._count.purchases > 0) {
      return NextResponse.json({ 
        error: `No se puede eliminar: "${supplier.name}" ya tiene facturas de compra en el historial. Edítalo en su lugar.` 
      }, { status: 400 });
    }

    await prisma.supplier.delete({ where: { id, tenantId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno al intentar eliminar' }, { status: 500 });
  }
}