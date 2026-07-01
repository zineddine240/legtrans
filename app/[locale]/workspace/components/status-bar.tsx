"use client";

import React from "react";
import { CheckCircle2, Languages } from "lucide-react";

export function StatusBar() {
  return (
    <div className="h-[32px] shrink-0 bg-white border-t border-[#e5e3dc] flex items-center px-4 z-20 text-[12px] font-medium text-[#595959] relative">
      
      {/* Left */}
      <div className="flex items-center gap-3 flex-1">
        <div className="flex items-center gap-1.5 text-[#1a1a1a]">
          <div className="w-2 h-2 rounded-full bg-[#10b981]" />
          Connecté
        </div>
        <div className="w-px h-3 bg-[#e5e3dc]" />
        <div className="hover:text-[#1a1a1a] cursor-pointer transition-colors">
          OCR: <span className="text-[#0d6e4e] font-semibold">92%</span> confiance
        </div>
      </div>

      {/* Center */}
      <div className="flex items-center justify-center gap-3 flex-1 font-mono text-[11px]">
        <span>0 mots</span>
        <div className="w-px h-3 bg-[#e5e3dc]" />
        <span>0 caractères</span>
        <div className="w-px h-3 bg-[#e5e3dc]" />
        <span>Page 1 / 1</span>
      </div>

      {/* Right */}
      <div className="flex items-center justify-end gap-3 flex-1">
        <span>Édition</span>
        <div className="w-px h-3 bg-[#e5e3dc]" />
        <div className="flex items-center gap-1 cursor-pointer hover:text-[#1a1a1a] transition-colors">
          <Languages className="h-3 w-3" />
          <span>FR → AR</span>
        </div>
        <div className="w-px h-3 bg-[#e5e3dc]" />
        <span className="text-[#a8a8a8]">v1.0</span>
      </div>

    </div>
  );
}
