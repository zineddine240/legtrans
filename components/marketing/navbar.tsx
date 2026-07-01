"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale, LayoutDashboard, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

export function MarketingNavbar() {
  const { user } = useAuth();
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-[100] w-full h-[72px] bg-white border-b border-[#e5e3dc] shadow-sm transition-all duration-300">
      <div className="container mx-auto h-full px-6 flex items-center justify-between max-w-7xl">
        {/* Left: Logo & Hamburger Trigger on mobile */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-[#faf8f3] text-primary-dark transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="LegTrans DZ Logo" 
              className="w-10 h-10 rounded-lg object-contain shadow-md group-hover:scale-105 transition-all duration-300 border border-[#e5e3dc]/50" 
            />
            <div className="flex flex-col">
              <span className="font-brand-serif font-bold text-2xl tracking-normal text-primary-dark leading-none">LegTrans DZ</span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation (Desktop only) */}
        <nav className="hidden lg:flex items-center gap-10">
          <Link href="#features" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">{t("features")}</Link>
          <Link href="#pricing" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">{t("pricing")}</Link>
          <Link href="#how-it-works" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">{t("howItWorks")}</Link>
          <Link href="#about" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">{t("about")}</Link>
          <Link href="#contact" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">{t("contact")}</Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="flex items-center gap-3 pr-4 border-r border-[#e5e3dc] rtl:pr-0 rtl:pl-4 rtl:border-r-0 rtl:border-l">
            <LanguageSwitcher />
          </div>
          
          {user ? (
            <Link href="/dashboard" className="hidden sm:block">
              <Button className="btn-primary h-11 px-6 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                {t("mySpace")}
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="hidden sm:block text-sm font-bold text-primary hover:text-primary-light transition-colors">
                {t("login")}
              </Link>
              
              <Link href="/auth/register" className="hidden sm:block">
                <Button className="btn-primary h-11 px-8 text-xs font-bold uppercase tracking-widest">
                  {t("freeTrial")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE DRAWER MENU OVERLAY */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 top-[72px] z-50 lg:hidden bg-black/20 backdrop-blur-sm transition-all"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className={`w-80 bg-white h-[calc(100vh-72px)] shadow-2xl border-t border-[#e5e3dc] flex flex-col p-6 justify-between transition-all duration-300 ${
              isRtl ? "mr-auto border-l animate-in slide-in-from-left" : "ml-auto border-l animate-in slide-in-from-right"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a8a8a8] border-b border-[#f5f3ed] pb-2">
                {isRtl ? "التنقل" : "Navigation"}
              </span>
              
              <nav className="flex flex-col gap-5">
                <Link 
                  href="#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-bold text-primary-dark hover:text-primary transition-all"
                >
                  {t("features")}
                </Link>
                <Link 
                  href="#pricing" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-bold text-primary-dark hover:text-primary transition-all"
                >
                  {t("pricing")}
                </Link>
                <Link 
                  href="#how-it-works" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-bold text-primary-dark hover:text-primary transition-all"
                >
                  {t("howItWorks")}
                </Link>
                <Link 
                  href="#about" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-bold text-primary-dark hover:text-primary transition-all"
                >
                  {t("about")}
                </Link>
                <Link 
                  href="#contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-bold text-primary-dark hover:text-primary transition-all"
                >
                  {t("contact")}
                </Link>
              </nav>
            </div>

            <div className="flex flex-col gap-4 border-t border-[#f5f3ed] pt-6 mb-12">
              {user ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full">
                  <Button className="btn-primary h-12 w-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    {t("mySpace")}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center">
                    <Button variant="outline" className="h-12 w-full border-[#e5e3dc] text-sm font-bold text-primary hover:bg-[#faf8f3]">
                      {t("login")}
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                    <Button className="btn-primary h-12 w-full text-xs font-bold uppercase tracking-widest">
                      {t("freeTrial")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

