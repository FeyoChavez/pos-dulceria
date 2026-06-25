import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 

export async function POST(req: Request) {
  try {
    const { saleId, itemId } = await req.json();

    if (!saleId || !itemId) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Verificamos que el artículo exista y no este ya devuelto
    const item = await prisma.saleItem.findUnique({ where: { id: itemId } });
    
    if (!item) return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 });
    if (item.refunded) return NextResponse.json({ error: "Este artículo ya fue devuelto" }, { status: 400 });

    const montoADevolver = item.quantity * item.priceSnap;

    // Hacemos los 3 movimientos al mismo tiempo
    await prisma.$transaction([
      // Marcar el artículo específico como devuelto
      prisma.saleItem.update({
        where: { id: itemId },
        data: { refunded: true },
      }),
      // Regresar el stock al inventario
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      }),
      // Restar el dinero del total del ticket original
      prisma.sale.update({
        where: { id: saleId },
        data: { total: { decrement: montoADevolver } },
      })
    ]);

    return NextResponse.json({ success: true, message: "Devolución parcial aplicada" });

  } catch (error) {
    console.error("Error en devolución parcial:", error);
    return NextResponse.json({ error: "Fallo interno en el servidor" }, { status: 500 });
  }
}