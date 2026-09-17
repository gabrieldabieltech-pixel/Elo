import { requireAuth } from "@/lib/server-auth";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Home, Building } from "lucide-react";
import { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const auth = await requireAuth({ allowRoles: ["ADMIN"] });
  // auth returns AuthContext (redirects if not allowed)
  const user = (auth as any).user;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-app-bg">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface border-r border-border p-4 flex flex-col">
        <div className="mb-8 mt-2 px-2">
          <Link href="/">
            <Image
              src="/elo-logo-horizontal.png"
              alt="Elo"
              width={120}
              height={36}
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </Link>
          <div className="mt-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Painel Admin
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          <Link 
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-primary bg-primary-soft hover:bg-primary-soft/80 transition-colors"
          >
            <Building size={18} />
            Empresas
          </Link>
        </nav>

        <div className="mt-auto border-t border-border pt-4">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-text-primary">{user.nome}</p>
            <p className="text-xs text-text-secondary">{user.email}</p>
          </div>
          <Link 
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-text-secondary hover:bg-surface-muted transition-colors"
          >
            <Home size={18} />
            Página Inicial
          </Link>
          <Link 
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-danger hover:bg-danger-soft transition-colors mt-1"
          >
            <LogOut size={18} />
            Sair
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
