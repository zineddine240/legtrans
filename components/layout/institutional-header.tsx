"use client";

import Link from "next/link";
import { Scale, Bell, Globe, User, LogOut, Settings, CreditCard, ChevronDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

export function InstitutionalHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="institutional-header">
      <div className="container mx-auto h-full px-4 flex items-center justify-between max-w-7xl">
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm group-hover:bg-primary-light transition-colors">
              <Scale className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-primary-dark leading-none">LegTrans DZ</span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/dashboard" className="text-sm font-semibold text-primary-dark hover:text-accent transition-colors">Tableau de bord</Link>
          <Link href="/documents" className="text-sm font-semibold text-muted-foreground hover:text-primary-dark transition-colors">Documents</Link>
          <Link href="/translate" className="text-sm font-semibold text-muted-foreground hover:text-primary-dark transition-colors">Traduire</Link>
          <Link href="/archive" className="text-sm font-semibold text-muted-foreground hover:text-primary-dark transition-colors">Archive</Link>
        </nav>

        {/* Right: User Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white" />
          </Button>

          <div className="h-6 w-px bg-border mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-secondary">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">Traducteur Professionnel</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Mon Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Abonnement</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-error focus:text-error" onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden lg:flex items-center gap-1 ml-2">
            <Button variant="outline" size="sm" className="h-8 px-2 border-border text-xs font-bold bg-white">
              FR
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground text-xs font-bold font-arabic">
              عربي
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
