"use client";

import { useState } from "react";
import { Link, usePathname, useRouter } from "@/src/i18n/routing";
import { Bell, LogOut, Menu, X, LayoutDashboard, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "@/components/language-switcher";

import { useTranslations } from "next-intl";

export function TopBar() {
  const t = useTranslations("TopBar");
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/ocr", label: t("nav.ocr") },
    { href: "/translate", label: t("nav.text_translate") },
    { href: "/document-translation", label: t("nav.doc_translate") },
    { href: "/glossary", label: t("nav.glossary") },
    { href: "/dashboard/assistant", label: t("nav.assistant") },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-[#e5e3dc] px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img 
              src="/logo.png" 
              alt="LegTrans DZ Logo" 
              className="h-7 w-7 rounded-lg object-contain border border-[#e5e3dc]/50 shadow-sm" 
            />
            <span className="font-brand-serif text-[17px] font-bold text-[#1a1a1a] tracking-tight">
              LegTrans DZ
            </span>
          </Link>
        </div>

        {/* CENTER (Desktop only) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors relative py-4",
                  isActive
                    ? "text-[#0d6e4e] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0d6e4e]"
                    : "text-[#595959] hover:text-[#1a1a1a]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          
          <Link
            href="/billing"
            title={t("billing")}
            className="h-8 w-8 rounded-md hover:bg-[#f5f3ed] flex items-center justify-center transition-colors shrink-0"
          >
            <Receipt className="w-[18px] h-[18px] text-[#595959]" />
          </Link>

          <Link
            href="/account"
            className="group flex items-center gap-2 ms-1 rounded-full pe-2.5 ps-0.5 py-0.5 transition-all duration-200 hover:bg-[#f5f3ed]"
            style={{ border: "1px solid #e5e3dc" }}
          >
            <div className="relative">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#0d6e4e] to-[#074a35] text-white text-[11px] font-bold flex items-center justify-center">
                {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 rtl:right-auto rtl:-left-0.5 w-2.5 h-2.5 bg-[#25d366] rounded-full border-2 border-white" />
            </div>
            <span className="text-[12px] font-semibold text-gray-700 max-w-[80px] truncate hidden sm:block">
              {profile?.display_name?.split(" ")[0] || t("userMenu.account")}
            </span>
          </Link>

          <button 
            onClick={handleSignOut}
            title={t("userMenu.logout")}
            className="hidden sm:flex h-8 w-8 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 items-center justify-center transition-colors ms-1"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER MENU */}
      <div 
        className={cn(
          "fixed inset-0 top-14 z-40 md:hidden bg-black/20 backdrop-blur-sm transition-all duration-300",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div 
          className={cn(
            "absolute top-0 bottom-0 left-0 rtl:left-auto rtl:right-0 w-72 bg-white h-full border-r rtl:border-r-0 rtl:border-l border-[#e5e3dc] flex flex-col p-4 justify-between transition-transform duration-300 ease-in-out",
            mobileMenuOpen 
              ? "translate-x-0" 
              : "ltr:-translate-x-full rtl:translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 pt-2">{t("mobile.navigation")}</span>
            
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all",
                pathname === "/dashboard" ? "bg-[#0d6e4e]/10 text-[#0d6e4e]" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              {t("nav.dashboard")}
            </Link>

            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all",
                    isActive ? "bg-[#0d6e4e]/10 text-[#0d6e4e]" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-[#0d6e4e]" : "bg-gray-300")} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-[#e5e3dc] pt-4 flex flex-col gap-2 mb-16">
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0d6e4e] to-[#074a35] text-white text-xs font-bold flex items-center justify-center">
                {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-gray-800">{profile?.display_name || t("userMenu.account")}</span>
                <span className="text-[10px] text-gray-400">{user?.email}</span>
              </div>
            </Link>

            <Link
              href="/billing"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all text-start w-full"
            >
              <Receipt className="w-4 h-4" />
              {t("billing")}
            </Link>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all text-start w-full"
            >
              <LogOut className="w-4 h-4" />
              {t("userMenu.logout")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
