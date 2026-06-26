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
        sales: {
          include: {
            items: true,
            refund: true
          }
        },
        refunds: true,
        customerPayments: true,
        expenses: true 
      }
    });

    if (!activeSession) return NextResponse.json({ isOpen: false });

    let cashSalesGross = 0; // Ventas brutas en efectivo
    let cardSalesNet = 0;   // Ventas netas con tarjeta
    let cashRefunds = 0;    // Total de dinero devuelto en efectivo

    activeSession.sales.forEach(sale => {
      // Calculamos cuánto valía el ticket originalmente (sin importar si luego se modificó)
      const originalSaleTotal = sale.items.reduce((acc, item) => acc + (item.quantity * item.priceSnap), 0);

      if (sale.paymentMethod === 'CASH') {
        cashSalesGross += originalSaleTotal;

        // Evaluamos qué dinero salió de la caja
        if (sale.refund) {
          // Si el ticket entero se anuló, sumamos el ticket completo a las devoluciones
          cashRefunds += originalSaleTotal;
        } else {
          // Si el ticket sigue vivo, buscamos pieza por pieza cuáles se devolvieron
          sale.items.forEach(item => {
            if (item.refunded) {
              cashRefunds += (item.quantity * item.priceSnap);
            }
          });
        }
      } else if (sale.paymentMethod === 'CARD') {
        // Lógica similar para tarjetas 
        let cardRefunds = 0;
        if (sale.refund) {
          cardRefunds = originalSaleTotal;
        } else {
          sale.items.forEach(item => {
            if (item.refunded) cardRefunds += (item.quantity * item.priceSnap);
          });
        }
        cardSalesNet += (originalSaleTotal - cardRefunds);
      }
    });

    // Abonos a credito 
    const cashAbonos = activeSession.customerPayments
      .filter(p => p.paymentMethod === 'CASH')
      .reduce((acc, p) => acc + p.amount, 0);

    const totalExpenses = activeSession.expenses
      ? activeSession.expenses.reduce((acc, e) => acc + e.amount, 0)
      : 0;

    const legacyRefunds = activeSession.refunds ? activeSession.refunds.reduce((acc, r) => acc + r.amount, 0) : 0;
    cashRefunds += legacyRefunds;

    const expectedBalance = activeSession.openingBalance + cashSalesGross + cashAbonos - cashRefunds - totalExpenses;

    return NextResponse.json({
      isOpen: true,
      session: {
        id: activeSession.id,
        openingBalance: activeSession.openingBalance,
        openedAt: activeSession.openedAt,
        cashSales: cashSalesGross,
        cardSales: cardSalesNet,
        cashAbonos, 
        cashRefunds,
        totalExpenses,
        expensesList: activeSession.expenses || [], 
        expectedBalance
      }
    });
  } catch (error) {
    console.error('Error al obtener sesión de caja:', error);
    return NextResponse.json({ error: 'Error interno al calcular la caja' }, { status: 500 });
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
    
    const existing = await prisma.cashSession.findFirst({
      where: { tenantId, userId, status: 'OPEN' }
    });
    if (existing) return NextResponse.json({ error: 'Ya tienes una caja abierta' }, { status: 400 });

    const newSession = await prisma.cashSession.create({
      data: {
        tenantId,
        userId: userId!,
        openingBalance: Number(openingBalance),
        expectedBalance: Number(openingBalance),
        status: 'OPEN'
      }
    });

    return NextResponse.json(newSession);
  } catch (error) {
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