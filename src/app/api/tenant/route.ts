import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

// OBTENER CONFIGURACIÓN ACTUAL DEL NEGOCIO
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No_Auth' }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, legalName: true, address: true, phone: true, ticketMessage: true }
    });
    return NextResponse.json(tenant);
  } catch {
    return NextResponse.json({ error: 'Error leyendo tenant' }, { status: 500 });
  }
}

// ACTUALIZAR CONFIGURACIÓN
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No_Auth' }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  try {
    const body = await request.json();
    
    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: body.name?.trim() || "Mi Dulcería",
        legalName: body.legalName?.trim() || null,
        address: body.address?.trim() || null,
        phone: body.phone?.trim() || null,
        ticketMessage: body.ticketMessage?.trim() || null,
      }
    });

    return NextResponse.json({ success: true, tenant: updated });
  } catch {
    return NextResponse.json({ error: 'Error guardando datos' }, { status: 500 });
  }
}