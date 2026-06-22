import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

// OBTENER ESTADO DE LA CAJA ACTUAL
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const userId = session.user.id;

  try {
    const activeSession = await prisma.cashSession.findFirst({
      where: { tenantId, userId, status: 'OPEN' },
      include: { 
        sales: true,
        refunds: true 
      }
    });

    if (!activeSession) {
      return NextResponse.json({ isOpen: false });
    }

    // Calcular ventas
    const cashSales = activeSession.sales
      .filter(s => s.paymentMethod === 'CASH')
      .reduce((acc, s) => acc + s.total, 0);

    const cardSales = activeSession.sales
      .filter(s => s.paymentMethod === 'CARD')
      .reduce((acc, s) => acc + s.total, 0);

    // Calcular cuánto dinero salió por devoluciones
    const cashRefunds = activeSession.refunds.reduce((acc, r) => acc + r.amount, 0);

    // Fondo + Ventas Efectivo - Devoluciones
    const expectedBalance = activeSession.openingBalance + cashSales - cashRefunds;

    return NextResponse.json({
      isOpen: true,
      session: {
        id: activeSession.id,
        openingBalance: activeSession.openingBalance,
        openedAt: activeSession.openedAt,
        cashSales,
        cardSales,
        cashRefunds, 
        expectedBalance
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener sesión de caja' }, { status: 500 });
  }
}

// INICIAR CAJA
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const userId = session.user.id;

  try {
    const { openingBalance } = await request.json();
    
    // Log para ver si los datos de sesión están llegando bien
    console.log("Intentando abrir caja:", { tenantId, userId, openingBalance });

    const existing = await prisma.cashSession.findFirst({
      where: { tenantId, userId, status: 'OPEN' }
    });
    if (existing) return NextResponse.json({ error: 'Ya tienes una caja abierta' }, { status: 400 });

    const newSession = await prisma.cashSession.create({
      data: {
        tenantId,
        userId: userId!,
        openingBalance: Number(openingBalance),
        status: 'OPEN'
      }
    });

    return NextResponse.json(newSession);
  } catch (error) {
    // 🔥 AHORA SÍ VEREMOS EL ERROR EN LA TERMINAL
    console.error("ERROR REAL AL ABRIR CAJA:", error); 
    return NextResponse.json({ error: 'Error interno de la base de datos' }, { status: 500 });
  }
}

// CERRAR CAJA (ACTUALIZAR SESIÓN)
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const tenantId = (session.user as any).tenantId;
  const userId = session.user.id;

  try {
    const { closingBalance, id, expectedBalance } = await request.json();

    const closedSession = await prisma.cashSession.update({
      where: { id, tenantId, userId },
      data: {
        closingBalance: Number(closingBalance),
        expectedBalance: Number(expectedBalance),
        status: 'CLOSED',
        closedAt: new Date()
      }
    });

    return NextResponse.json(closedSession);
  } catch (error) {
    return NextResponse.json({ error: 'Error al cerrar caja' }, { status: 500 });
  }
}