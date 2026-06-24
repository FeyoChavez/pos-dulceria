import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

// OBTENER LISTA DE CLIENTES
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const tenantId = (session.user as any).tenantId;

    const customers = await prisma.customer.findMany({
    where: { tenantId },
    select: { id: true, name: true, phone: true, balance: true },
    orderBy: { name: 'asc' }
  });

    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo clientes' }, { status: 500 });
  }
}

// REGISTRAR UN NUEVO CLIENTE
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const tenantId = (session.user as any).tenantId;
    const { name, phone } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'El nombre del cliente es obligatorio' }, { status: 400 });
    }

    const newCustomer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        balance: 0,
        tenantId
      }
    });

    return NextResponse.json({ success: true, customer: newCustomer });
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar al cliente' }, { status: 500 });
  }
}

// REGISTRAR ABONO 
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'No_Auth' }, { status: 401 });

    const tenantId = (session.user as any).tenantId;
    const userId = session.user.id;
    const { customerId, montoAbono, paymentMethod = 'CASH' } = await request.json();

    if (!customerId || !montoAbono || montoAbono <= 0) return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });

    const activeSession = await prisma.cashSession.findFirst({
      where: { tenantId, userId, status: 'OPEN' },
      select: { id: true }
    });

    if (paymentMethod === 'CASH' && !activeSession) {
      return NextResponse.json({ error: 'Abre caja para recibir efectivo.' }, { status: 400 });
    }

    // all orders
    const operaciones: any[] = [
      prisma.customer.update({
        where: { id: customerId, tenantId },
        data: { balance: { increment: montoAbono } }
      }),
      (prisma as any).customerPayment.create({
        data: { amount: montoAbono, paymentMethod, tenantId, customerId, userId, cashSessionId: paymentMethod === 'CASH' ? activeSession?.id : null }
      })
    ];

    if (paymentMethod === 'CASH' && activeSession) {
      operaciones.push(
        prisma.cashSession.update({
          where: { id: activeSession.id },
          data: { expectedBalance: { increment: montoAbono } }
        })
      );
    }

    const [updatedCustomer] = await prisma.$transaction(operaciones);

    // Limpieza de basura decimal 
    if (Math.abs(updatedCustomer.balance) < 0.01) {
      await prisma.customer.update({ where: { id: customerId }, data: { balance: 0 } });
      updatedCustomer.balance = 0;
    }

    return NextResponse.json({ success: true, customer: updatedCustomer });

  } catch (error) {
    return NextResponse.json({ error: 'Error procesando abono' }, { status: 500 });
  }
}