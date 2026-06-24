import { auth } from "@/auth";
import Sidebar from "@/components/ui/SideBar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  // Redirección preventiva de seguridad si la sesión expiró
  if (!session?.user) redirect("/auth/login");

  const role = (session.user as any).role || "CASHIER";

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-50 overflow-hidden">
      <Sidebar userRole={role} />
      
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}