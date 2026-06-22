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
  if (startDateStr) {
    // Desde el primer milisegundo del día (00:00:00.000)
    dateFilter.gte = new Date(`${startDateStr}T00:00:00.000Z`);
  }
  if (endDateStr) {
    // Hasta el último milisegundo del día (23:59:59.999)
    dateFilter.lte = new Date(`${endDateStr}T23:59:59.999Z`);
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
          refunds: true // Traemos las devoluciones que ocurrieron EN ESTE TURNO
        }
      });

      const auditReports = closedSessions.map(session => {
        // Calcular todo lo que entró en ventas
        const cashSales = session.sales.filter(s => s.paymentMethod === 'CASH').reduce((acc, s) => acc + s.total, 0);
        const cardSales = session.sales.filter(s => s.paymentMethod === 'CARD').reduce((acc, s) => acc + s.total, 0);

        // Calcular todo lo que salió por devoluciones en ESTA caja
        const cashRefunds = session.refunds.reduce((acc, refund) => acc + refund.amount, 0);

        // (Fondo Inicial + Ventas Efectivo) - Dinero Devuelto = Lo que debería haber en el cajón
        const computedExpected = session.openingBalance + cashSales - cashRefunds;
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