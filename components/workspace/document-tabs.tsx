"use client";

import React from "react";
import { 
  FileText, Languages, Eye, Columns3, 
  Minus, Plus, Maximize2, LayoutPanelLeft, LayoutList, Layers, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type TabId = "source" | "translate" | "preview" | "compare";

export interface DocumentTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  viewMode: "split" | "single" | "stacked";
  onViewModeChange: (mode: "split" | "single" | "stacked") => void;
  onFullscreenToggle: () => void;
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "source", label: "Source", icon: FileText },
  { id: "translate", label: "Traduction", icon: Languages },
  { id: "preview", label: "Aperçu", icon: Eye },
  { id: "compare", label: "Comparer", icon: Columns3 },
];

export function DocumentTabs({
  activeTab,
  onTabChange,
  zoom,
  onZoomChange,
  viewMode,
  onViewModeChange,
  onFullscreenToggle
}: DocumentTabsProps) {

  return (
    <div 
      className="h-[44px] shrink-0 border-b border-[var(--color-border)] bg-white flex items-center justify-between px-2 z-10 relative" 
      role="tablist" 
      aria-label="Document views"
    >
      <div className="flex items-center h-full">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center h-full px-4 gap-2 text-sm transition-colors border-b-2 outline-none focus-visible:ring-2 focus-visible:ring-[#0d6e4e] focus-visible:ring-inset",
                isActive 
                  ? "border-[#0d6e4e] text-[#0d6e4e] font-semibold" 
                  : "border-transparent text-[#595959] hover:bg-[#f5f3ed] hover:text-[#1a1a1a] cursor-pointer font-medium"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1 pr-1">
        <div className="flex items-center h-7 bg-[#faf8f3] rounded border border-[#e5e3dc] overflow-hidden">
          <button 
            onClick={() => onZoomChange(Math.max(10, zoom - 10))}
            aria-label="Zoom out"
            className="h-full w-7 flex items-center justify-center text-[#595959] hover:text-[#1a1a1a] hover:bg-[#f5f3ed] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6e4e] focus-visible:ring-inset"
          >
            <Minus className="h-3 w-3" />
          </button>
          <button 
            onClick={() => onZoomChange(100)}
            aria-label="Reset zoom"
            className="h-full px-2 text-xs font-medium text-[#1a1a1a] hover:bg-[#f5f3ed] min-w-[3rem] text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6e4e] focus-visible:ring-inset"
          >
            {zoom}%
          </button>
          <button 
            onClick={() => onZoomChange(Math.min(300, zoom + 10))}
            aria-label="Zoom in"
            className="h-full w-7 flex items-center justify-center text-[#595959] hover:text-[#1a1a1a] hover:bg-[#f5f3ed] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6e4e] focus-visible:ring-inset"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        <div className="h-5 w-px bg-[#e5e3dc] mx-1" aria-hidden="true" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-[#1a1a1a] font-medium hover:bg-[#f5f3ed] px-2 gap-1.5 rounded">
              {viewMode === "single" && <LayoutList className="h-3.5 w-3.5 text-[#595959]" />}
              {viewMode === "split" && <LayoutPanelLeft className="h-3.5 w-3.5 text-[#595959]" />}
              {viewMode === "stacked" && <Layers className="h-3.5 w-3.5 text-[#595959]" />}
              
              {viewMode === "split" ? "Split" : viewMode === "single" ? "Single column" : "Stacked"}
              <ChevronDown className="h-3 w-3 text-[#595959]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem 
              onClick={() => onViewModeChange("single")}
              className={cn("cursor-pointer gap-2 text-sm", viewMode === "single" && "bg-[#f5f3ed] font-medium")}
            >
              <LayoutList className={cn("h-4 w-4", viewMode === "single" ? "text-[#0d6e4e]" : "text-[#595959]")} /> 
              Single column
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onViewModeChange("split")}
              className={cn("cursor-pointer gap-2 text-sm", viewMode === "split" && "bg-[#f5f3ed] font-medium")}
            >
              <LayoutPanelLeft className={cn("h-4 w-4", viewMode === "split" ? "text-[#0d6e4e]" : "text-[#595959]")} /> 
              Split
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onViewModeChange("stacked")}
              className={cn("cursor-pointer gap-2 text-sm", viewMode === "stacked" && "bg-[#f5f3ed] font-medium")}
            >
              <Layers className={cn("h-4 w-4", viewMode === "stacked" ? "text-[#0d6e4e]" : "text-[#595959]")} /> 
              Stacked
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onFullscreenToggle}
          aria-label="Toggle fullscreen"
          className="h-7 w-7 rounded text-[#595959] hover:text-[#1a1a1a] hover:bg-[#f5f3ed] ml-0.5"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
