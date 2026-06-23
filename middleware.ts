import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLogged = !!req.auth;
  const role = (req.auth?.user as any)?.role;
  const { nextUrl } = req;

  if (!isLogged) return;

  // Definimos qué rutas requieren estrictamente jerarquía de ADMINISTRADOR
  const requiereAdmin = nextUrl.pathname.startsWith("/dashboard") && 
                        !nextUrl.pathname.startsWith("/dashboard/pos") && 
                        !nextUrl.pathname.startsWith("/dashboard/caja");

  if (requiereAdmin && role === "CASHIER") {
    // Si un cajero intenta colarse, lo redireccionamos de inmediato a su pos
    return NextResponse.redirect(new URL("/dashboard/pos", nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};