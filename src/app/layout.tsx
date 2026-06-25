import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. IMPORTACIÓN OBLIGATORIA DE ESTILOS
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyPOS",
  description: "Punto de venta",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}

        <ToastContainer 
          className="print:hidden"        
          position="top-right" 
          autoClose={3500} 
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          theme="light" 
        />
      </body>
    </html>
  );
}