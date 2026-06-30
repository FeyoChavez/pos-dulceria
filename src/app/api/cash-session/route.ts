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
        expenses: true,
        purchases: true, 
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

    const totalPurchasesFromRegister = activeSession.purchases
      ? activeSession.purchases.reduce((acc, p) => acc + p.total, 0)
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
        totalExpenses: totalExpenses + totalPurchasesFromRegister,
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
    // recibimos lo que el cajero contó físicamente.
    const { closingBalance, id } = await request.json();

    // Traemos el historial completo del turno para auditar los billetes reales
    const activeSession = await prisma.cashSession.findUnique({
      where: { id, tenantId, userId, status: 'OPEN' },
      include: {
        sales: { include: { items: true, refund: true } },
        refunds: true,
        customerPayments: true,
        expenses: true
      }
    });

    if (!activeSession) {
      return NextResponse.json({ error: 'No hay una caja abierta para cerrar' }, { status: 400 });
    }

    // Calculamos cuánto billete debe haber.
    let ventasEfectivo = 0;
    let devEfectivo = 0;
    
    activeSession.sales.forEach(s => {
      const t = s.items.reduce((sum, i) => sum + (i.quantity * i.priceSnap), 0);
      if (s.paymentMethod === 'CASH') {
        ventasEfectivo += t;
        if (s.refund) devEfectivo += t;
        else s.items.forEach(i => { if (i.refunded) devEfectivo += (i.quantity * i.priceSnap); });
      }
    });
    
    const abonosEfectivo = activeSession.customerPayments.filter(p => p.paymentMethod === 'CASH').reduce((sum, p) => sum + p.amount, 0);
    const gastos = activeSession.expenses.reduce((sum, e) => sum + e.amount, 0);
    const retirosLegacy = activeSession.refunds.reduce((sum, r) => sum + r.amount, 0);

    const exactExpectedBalance = activeSession.openingBalance + ventasEfectivo + abonosEfectivo - devEfectivo - gastos - retirosLegacy;
    // *(Si además tienes compras pagadas en efectivo de caja, réstalas aquí también)*

    const closedSession = await prisma.cashSession.update({
      where: { id },
      data: {
        closingBalance: Number(closingBalance), // El dinero que el cajero jura que hay
        expectedBalance: exactExpectedBalance,  // El dinero que el sistema sabe que debe haber
        status: 'CLOSED',
        closedAt: new Date()
      }
    });

    // Calculamos si le sobró o le faltó dinero 
    const difference = Number(closingBalance) - exactExpectedBalance;

    return NextResponse.json({ ...closedSession, difference });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno al realizar el corte de caja' }, { status: 500 });
  }
}