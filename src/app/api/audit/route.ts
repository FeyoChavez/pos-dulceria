import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  // Obtener los parámetros de fecha de la URL
  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  // Construir el filtro condicional de fechas para Prisma
  const dateFilter: any = {};
  
  // offset de México (-06:00)
  if (startDateStr) {
    dateFilter.gte = new Date(`${startDateStr}T00:00:00.000-06:00`);
  }
  if (endDateStr) {
    dateFilter.lte = new Date(`${endDateStr}T23:59:59.999-06:00`);
  }

  try {
    const closedSessions = await prisma.cashSession.findMany({
      where: { 
        tenantId, 
        status: 'CLOSED',
        ...(startDateStr || endDateStr ? { closedAt: dateFilter } : {})
      },
      orderBy: { closedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        sales: {
          include: {
            items: { include: { product: { select: { name: true } } } }
          }
        },
        refunds: true,
        expenses: true //  Traemos los egresos que ocurrieron en este turno
      }
    });

    const auditReports = closedSessions.map(session => {
      // Calcular ingresos brutos por método de pago
      const cashSales = session.sales.filter(s => s.paymentMethod === 'CASH').reduce((acc, s) => acc + s.total, 0);
      const cardSales = session.sales.filter(s => s.paymentMethod === 'CARD').reduce((acc, s) => acc + s.total, 0);

      // Calcular salidas por devoluciones en efectivo
      const cashRefunds = session.refunds.reduce((acc, refund) => acc + refund.amount, 0);

      // Calcular salidas por egresos de caja chica
      const totalExpenses = session.expenses.reduce((acc, expense) => acc + expense.amount, 0);

      //  (Fondo Inicial + Ventas Efectivo) - Devoluciones - Egresos
      const computedExpected = session.openingBalance + cashSales - cashRefunds - totalExpenses;
      
      // La diferencia real contra lo que el cajero contó físicamente en la noche
      const difference = (session.closingBalance || 0) - (session.expectedBalance || computedExpected);

      return {
        id: session.id,
        cashier: session.user.name,
        openedAt: session.openedAt,
        closedAt: session.closedAt,
        openingBalance: session.openingBalance,
        expectedBalance: session.expectedBalance || computedExpected,
        closingBalance: session.closingBalance || 0,
        difference,
        cashSales,
        cardSales,
        totalRefunded: cashRefunds, 
        totalExpenses, 
        expensesDetail: session.expenses, 
        totalSales: cashSales + cardSales,
        salesCount: session.sales.length,
        salesDetail: session.sales
      };
    });

    return NextResponse.json(auditReports);
  } catch (error) {
    console.error('Error en auditoría:', error);
    return NextResponse.json({ error: 'Error al compilar reporte de auditoría' }, { status: 500 });
  }
}