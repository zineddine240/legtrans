"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname, notFound } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Users, CreditCard, Clock, ArrowLeft, Loader2, ShieldCheck, LogOut, Database, BookOpen } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f3]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!profile || !profile.is_admin) {
    notFound();
  }

  const navItems = [
    { name: "Membres & Comptes", href: "/admin/utilisateurs", icon: Users },
    { name: "Traductions", href: "/admin/translations", icon: Database },
    { name: "Glossaire", href: "/admin/glossary", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1a1a] text-white flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mr-2" />
          <span className="font-bold tracking-wider text-sm">LEGTRANS ADMIN</span>
        </div>

        <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold px-3 mb-2">Gestion</div>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-emerald-500/10 text-emerald-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-800 flex flex-col gap-2">
          <button 
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full px-2 py-1.5 rounded hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'app
          </button>
          <button 
            onClick={async () => {
              const { auth } = await import("@/integrations/firebase/config");
              auth.signOut().then(() => router.push("/auth/login"));
            }}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full px-2 py-1.5 rounded hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shrink-0 justify-between">
          <h1 className="text-lg font-bold text-gray-800">
            {navItems.find(i => pathname.startsWith(i.href))?.name || "Tableau de bord"}
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500 font-medium">Connecté en tant que Admin</div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
              {profile.display_name?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
