import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { saleId, itemId } = await req.json();

    if (!saleId || !itemId) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Buscamos el artículo Y el ticket completo para saber cómo se pagó
    const item = await prisma.saleItem.findUnique({ 
      where: { id: itemId },
      include: {
        sale: true // datos del ticket padre
      }
    });
    
    if (!item) return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 });
    if (item.refunded) return NextResponse.json({ error: "Este artículo ya fue devuelto" }, { status: 400 });

    const montoADevolver = Number((item.quantity * item.priceSnap).toFixed(2));
    const sale = item.sale;

    // Preparamos las operaciones base (Ticket, Inventario y Artículo)
    const operaciones: any[] = [
      prisma.saleItem.update({
        where: { id: itemId },
        data: { refunded: true },
      }),
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      }),
      prisma.sale.update({
        where: { id: saleId },
        data: { total: { decrement: montoADevolver } },
      })
    ];

    if (sale.paymentMethod === 'CASH' && sale.cashSessionId) {
      // Si fue en efectivo, le restamos el dinero al cajón físico
      operaciones.push(
        prisma.cashSession.update({
          where: { id: sale.cashSessionId },
          data: { expectedBalance: { decrement: montoADevolver } }
        })
      );
    } else if (sale.paymentMethod === 'CREDIT' && sale.customerId) {
      // Si fue fiado, le regresamos ese saldo a favor al deudor
      operaciones.push(
        prisma.customer.update({
          where: { id: sale.customerId },
          data: { balance: { increment: montoADevolver } } 
        })
      );
    }

    // Ejecutamos todo de golpe de forma segura
    await prisma.$transaction(operaciones);

    return NextResponse.json({ success: true, message: "Devolución parcial aplicada" });

  } catch (error) {
    console.error("Error en devolución parcial:", error);
    return NextResponse.json({ error: "Fallo interno en el servidor" }, { status: 500 });
  }
}