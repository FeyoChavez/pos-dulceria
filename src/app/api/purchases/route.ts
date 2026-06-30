import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

// OBTENER HISTORIAL DE COMPRAS 
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const tenantId = (session.user as any).tenantId;

  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  const dateFilter: any = {};
  if (startDateStr) dateFilter.gte = new Date(`${startDateStr}T00:00:00.000-06:00`);
  if (endDateStr) dateFilter.lte = new Date(`${endDateStr}T23:59:59.999-06:00`);

  try {
    const purchases = await prisma.purchase.findMany({
      where: {
        tenantId,
        ...(startDateStr || endDateStr ? { createdAt: dateFilter } : {})
      },
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: { select: { name: true } },
        items: {
          include: { product: { select: { name: true } } }
        },
        payments: true
      }
    });
    return NextResponse.json(purchases);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener historial de compras' }, { status: 500 });
  }
}

// PROCESAR UNA COMPRA DE MERCANCÍA E INJECTAR STOCK
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    
    const tenantId = (session.user as any).tenantId;
    const userId = session.user.id as string;

    const { supplierId, fundingSource, items, paymentMethod } = await request.json();

    // Validaciones primarias de sanidad
    if (!supplierId) return NextResponse.json({ error: 'Debes seleccionar un proveedor' }, { status: 400 });
    if (!items || items.length === 0) return NextResponse.json({ error: 'La compra no tiene artículos' }, { status: 400 });
    if (!['CASH_REGISTER', 'ADMINISTRATION', 'SUPPLIER_CREDIT'].includes(fundingSource)) {
      return NextResponse.json({ error: 'Origen de fondos inválido' }, { status: 400 });
    }

    // Calcular el costo total de la compra de forma exacta
    const totalPurchase = Number(items.reduce((acc: number, item: any) => acc + (item.quantity * item.costPrice), 0).toFixed(2));

    const result = await prisma.$transaction(async (tx) => {
      let activeSessionId: string | null = null;
      // El estatus inicial depende de si se fía o se liquida al momento
      const purchaseStatus = fundingSource === 'SUPPLIER_CREDIT' ? 'PENDING' : 'PAID';

      // CONTROL DE CAJA CHICA SI EL FONDO SALE DEL POS
      if (fundingSource === 'CASH_REGISTER') {
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
        activeSessionId = activeSession.id;

        // Calcular efectivo disponible en tiempo real en el cajón físico
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

        const dineroRealCajon = activeSession.openingBalance + ventasEfectivo + abonosEfectivo - devEfectivo - gastos - retirosLegacy;

        if (dineroRealCajon < totalPurchase) {
          throw new Error('Fondos_Insuficientes_En_Caja');
        }

        // Decrementar el saldo esperado de la caja registradora en base de datos
        await tx.cashSession.update({
          where: { id: activeSession.id },
          data: { expectedBalance: { decrement: totalPurchase } }
        });
      }

      // CREAR EL REGISTRO MAESTRO DE LA COMPRA
      const nuevaCompra = await tx.purchase.create({
        data: {
          total: totalPurchase,
          status: purchaseStatus,
          tenantId,
          userId,
          supplierId,
          cashSessionId: activeSessionId,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: Number(item.quantity),
              costPrice: Number(item.costPrice)
            }))
          }
        }
      });

      // LIQUIDAR COMPRA Y GENERAR COMPROBANTE DE PAGO SI NO ES CRÉDITO
      if (purchaseStatus === 'PAID') {
        await tx.purchasePayment.create({
          data: {
            amount: totalPurchase,
            paymentMethod: fundingSource === 'CASH_REGISTER' ? 'CASH' : (paymentMethod || 'TRANSFER'),
            tenantId,
            purchaseId: nuevaCompra.id
          }
        });
      }

      // ACTUALIZAR STOCK Y COSTO DEL PADRE + AUTO-CALCULAR COSTO DE SUS HIJOS
      for (const item of items) {
        // Actualizamos el Padre (Incrementa stock y fija el nuevo costo de la factura)
        await tx.product.update({
          where: { id: item.productId },
          data: { 
            stock: { increment: Number(item.quantity) },
            priceCost: Number(item.costPrice) 
          }
        });

        // Buscamos si este Padre tiene Hijos vinculados
        const childProducts = await tx.product.findMany({
          where: { parentId: item.productId, tenantId }
        });

        // Si tiene hijos, les actualizamos su costo de reposicion unitario en automatico
        if (childProducts.length > 0) {
          for (const child of childProducts) {
            if (child.conversionFactor && child.conversionFactor > 0) {
              const newChildCost = Number((Number(item.costPrice) / child.conversionFactor).toFixed(2));
              
              await tx.product.update({
                where: { id: child.id },
                data: { priceCost: newChildCost }
              });
            }
          }
        }
      }

      return nuevaCompra;
    });

    return NextResponse.json({ success: true, purchaseId: result.id });

  } catch (error: any) {
    if (error.message === 'Caja_Cerrada') {
      return NextResponse.json({ error: 'Debes abrir turno de caja antes de comprar desde la registradora.' }, { status: 400 });
    }
    if (error.message === 'Fondos_Insuficientes_En_Caja') {
      return NextResponse.json({ error: 'No hay suficiente dinero en la caja registradora para pagar esta mercancía.' }, { status: 400 });
    }
    console.error('Error al procesar compra:', error);
    return NextResponse.json({ error: 'Error interno al guardar la compra' }, { status: 500 });
  }
}