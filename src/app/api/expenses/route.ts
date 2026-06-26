import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

// OBTENER EL HISTORIAL DE GASTOS
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const tenantId = (session.user as any).tenantId;
  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  const dateFilter: any = {};
  if (startDateStr) dateFilter.gte = new Date(`${startDateStr}T00:00:00.000Z`);
  if (endDateStr) dateFilter.lte = new Date(`${endDateStr}T23:59:59.999Z`);

  try {
    const expenses = await prisma.expense.findMany({
      where: {
        tenantId,
        ...(startDateStr || endDateStr ? { createdAt: dateFilter } : {})
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener egresos' }, { status: 500 });
  }
}

//  REGISTRAR UN NUEVO EGRESO (CAJA CHICA)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const tenantId = (session.user as any).tenantId;
    const userId = session.user.id as string;
    const { concept, amount } = await request.json();

    if (!concept || !concept.trim()) return NextResponse.json({ error: 'Concepto obligatorio' }, { status: 400 });
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      // A. Traemos la caja abierta CON todos sus movimientos reales
      const activeSession = await tx.cashSession.findFirst({
        where: { tenantId, userId, status: 'OPEN' },
        include: {
          sales: { include: { items: true, refund: true } },
          refunds: true,
          customerPayments: true,
          expenses: true
        }
      });

      if (!activeSession) throw new Error('Caja_Cerrada');

      // B. MATEMÁTICA PURA: ¿Cuánto billete físico hay en el cajón en este segundo?
      let ventasEfectivo = 0;
      let devolucionesEfectivo = 0;

      activeSession.sales.forEach(sale => {
        const totalOrig = sale.items.reduce((acc, item) => acc + (item.quantity * item.priceSnap), 0);
        if (sale.paymentMethod === 'CASH') {
          ventasEfectivo += totalOrig;
          if (sale.refund) devolucionesEfectivo += totalOrig;
          else sale.items.forEach(i => { if (i.refunded) devolucionesEfectivo += (i.quantity * i.priceSnap); });
        }
      });

      const abonosEfectivo = activeSession.customerPayments
        .filter(p => p.paymentMethod === 'CASH')
        .reduce((acc, p) => acc + p.amount, 0);

      const gastosAnteriores = activeSession.expenses.reduce((acc, e) => acc + e.amount, 0);
      const retirosLegacy = activeSession.refunds.reduce((acc, r) => acc + r.amount, 0);

      const dineroFisicoReal = activeSession.openingBalance + ventasEfectivo + abonosEfectivo - devolucionesEfectivo - gastosAnteriores - retirosLegacy;

      // C. EL CANDADO REAL
      if (dineroFisicoReal < parsedAmount) {
        throw new Error('Fondos_Insuficientes');
      }

      // D. Guardamos el gasto
      const nuevoEgreso = await tx.expense.create({
        data: {
          concept: concept.trim(),
          amount: parsedAmount,
          tenantId,
          userId,
          cashSessionId: activeSession.id
        }
      });

      // Mantenemos actualizada la columna vieja por retrocompatibilidad
      await tx.cashSession.update({
        where: { id: activeSession.id },
        data: { expectedBalance: { decrement: parsedAmount } }
      });

      return nuevoEgreso;
    });

    return NextResponse.json({ success: true, expense: result });

  } catch (error: any) {
    if (error.message === 'Caja_Cerrada') return NextResponse.json({ error: 'Turno cerrado.' }, { status: 400 });
    if (error.message === 'Fondos_Insuficientes') return NextResponse.json({ error: 'Fondos insuficientes en caja para cubrir este egreso.' }, { status: 400 });
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}