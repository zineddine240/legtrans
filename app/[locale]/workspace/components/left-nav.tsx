"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LeftNavProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function LeftNav({ isCollapsed, setIsCollapsed }: LeftNavProps) {
  const pages = [1]; // Just 1 page for now as mockup

  return (
    <div 
      className={cn(
        "flex flex-col border-r border-[#e5e3dc] bg-[#faf8f3] transition-all duration-300 ease-in-out relative z-10",
        isCollapsed ? "w-[48px]" : "w-[96px]"
      )}
    >
      <div className="flex-1 py-4 flex flex-col items-center gap-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {pages.map((page) => (
          <div key={page} className="flex flex-col items-center gap-1.5 w-full px-2">
            {!isCollapsed && <span className="text-[10px] font-bold text-[#a8a8a8]">PAGE {page}</span>}
            
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                    "bg-white border shadow-sm cursor-pointer transition-all rounded-[2px]",
                    "border-[#0d6e4e] ring-2 ring-[#0d6e4e]/20",
                    isCollapsed ? "w-8 h-11" : "w-16 h-22 hover:scale-105 hover:shadow-md"
                  )}
                >
                  {/* Mock thumbnail content */}
                  <div className="w-full h-full bg-[url('https://placehold.co/120x160/ffffff/e5e3dc?text=Doc')] bg-cover bg-center rounded-[1px] opacity-50" />
                </div>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="text-xs">Page {page}</TooltipContent>
              )}
            </Tooltip>
          </div>
        ))}

        <div className="w-full px-2 mt-2">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "border-[#e5e3dc] text-[#595959] hover:text-[#1a1a1a] hover:bg-white bg-transparent border-dashed",
                  isCollapsed ? "w-8 h-8 p-0 mx-auto flex" : "w-16 h-10 mx-auto flex"
                )}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Ajouter une page</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Ajouter une page</TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-[#e5e3dc] bg-white shadow-sm hover:bg-[#faf8f3] z-20 text-[#595959] hover:text-[#1a1a1a]"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
