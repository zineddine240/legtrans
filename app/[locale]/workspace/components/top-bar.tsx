"use client";

import React, { useState } from "react";
import { Bell, CheckCircle2, Languages, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function TopBar({ documentId }: { documentId: string }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(`Acte de Naissance #${documentId}`);

  return (
    <header className="h-[56px] shrink-0 border-b border-[#e5e3dc] bg-white flex items-center justify-between px-4 z-20 relative">
      
      {/* Left section */}
      <div className="flex items-center gap-3 flex-1">
        <div className="flex items-center gap-2">
          {/* Mock Logo */}
          <div className="h-8 w-8 bg-[#0d6e4e] rounded flex items-center justify-center text-white font-bold text-xs">
            LDZ
          </div>
          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-[#0d6e4e] text-[#0d6e4e] px-1.5 py-0">PRO</Badge>
        </div>
        
        <div className="h-5 w-px bg-[#e5e3dc] mx-1" />
        
        <div className="flex items-center text-[13px] font-medium text-[#595959]">
          <span className="hover:text-[#1a1a1a] cursor-pointer transition-colors hidden sm:inline">Documents</span>
          <span className="mx-2 text-[#a8a8a8] hidden sm:inline">›</span>
          <span className="text-[#1a1a1a] truncate max-w-[120px] sm:max-w-none">{title}</span>
        </div>
      </div>

      {/* Center section */}
      <div className="flex-1 flex justify-center items-center gap-3">
        <div 
          className="flex items-center gap-2 group cursor-pointer hover:bg-[#f5f3ed] px-3 py-1.5 rounded transition-colors"
          onClick={() => setIsEditingTitle(true)}
        >
          {isEditingTitle ? (
            <input 
              autoFocus
              className="font-semibold text-[14px] text-[#1a1a1a] bg-transparent border-b border-[#0d6e4e] outline-none w-[200px] text-center"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            />
          ) : (
            <span className="font-semibold text-[14px] text-[#1a1a1a] truncate max-w-[200px]">
              {title}
            </span>
          )}
          {!isEditingTitle && <Pencil className="h-3 w-3 text-[#a8a8a8] opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
        
        <Badge variant="secondary" className="bg-[#0d6e4e]/10 text-[#0d6e4e] hover:bg-[#0d6e4e]/20 border-0 font-medium text-[11px] px-2 py-0.5">
          Brouillon
        </Badge>
        
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#595959] ml-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#0d6e4e]" />
          Enregistré à 14:32
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 flex-1 justify-end text-[13px] font-medium text-[#595959]">
        <div className="hidden xl:flex items-center gap-4">
          <span className="hover:text-[#1a1a1a] cursor-pointer transition-colors">Tableau de bord</span>
          <span className="hover:text-[#1a1a1a] cursor-pointer transition-colors">Documents</span>
          <span className="text-[#1a1a1a] cursor-pointer transition-colors">Traduire</span>
          <span className="hover:text-[#1a1a1a] cursor-pointer transition-colors">Archive</span>
        </div>
        
        <div className="h-5 w-px bg-[#e5e3dc] mx-3 hidden xl:block" />
        
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#595959] hover:text-[#1a1a1a] hover:bg-[#f5f3ed] relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white" />
        </Button>
        
        <Button variant="ghost" className="hidden md:flex h-8 px-2 gap-1.5 text-[#595959] hover:text-[#1a1a1a] hover:bg-[#f5f3ed]">
          <Languages className="h-4 w-4" />
          <span className="text-xs">FR | عربي</span>
        </Button>
        
        <Avatar className="h-8 w-8 ml-1 border border-[#e5e3dc] cursor-pointer hover:border-[#0d6e4e] transition-colors">
          <AvatarFallback className="bg-[#0d6e4e] text-white text-xs font-bold">TR</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
