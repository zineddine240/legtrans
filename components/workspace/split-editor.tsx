"use client";

import { useState } from "react";
import { 
  ZoomIn, ZoomOut, RotateCcw, Download, 
  CheckCircle, Globe, FileText, Search, 
  Table as TableIcon, Hash, Save, ShieldCheck,
  Type, AlignRight, AlignLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function SplitEditor() {
  const [direction, setDirection] = useState<"rtl" | "ltr">("rtl");
  const [fontSize, setFontSize] = useState(16);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Top Toolbar */}
      <div className="h-12 border-b border-border bg-secondary/30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1.5 px-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Vérification en cours
          </Badge>
          <span className="text-xs text-muted-foreground font-medium border-l border-border pl-2 ml-2">
            Document #2024-0892
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
          <Button className="btn-gold h-8 px-4 font-bold text-xs">
            CERTIFIER LE DOCUMENT
          </Button>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Source Document (PDF/OCR) */}
        <div className="w-1/2 border-r border-border flex flex-col bg-secondary/10">
          <div className="h-10 border-b border-border flex items-center justify-between px-3 bg-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Document Source (FR)</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7"><ZoomOut className="w-4 h-4" /></Button>
              <span className="text-xs font-medium px-2">100%</span>
              <Button variant="ghost" size="icon" className="h-7 w-7"><ZoomIn className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-8 flex justify-center">
            {/* Mock PDF Content */}
            <div className="w-[450px] aspect-[1/1.414] bg-white shadow-xl border border-border p-12 flex flex-col gap-6 grayscale opacity-80 pointer-events-none">
                <div className="w-24 h-24 bg-secondary self-end opacity-20" />
                <div className="h-8 bg-secondary w-2/3" />
                <div className="h-4 bg-secondary w-full" />
                <div className="h-4 bg-secondary w-full" />
                <div className="h-4 bg-secondary w-5/6" />
                <div className="mt-8 h-20 bg-secondary w-full" />
                <div className="mt-auto flex justify-between">
                    <div className="h-12 w-32 bg-secondary" />
                    <div className="h-12 w-32 bg-secondary" />
                </div>
            </div>
          </div>
        </div>

        {/* Right: Translation Workspace */}
        <div className="w-1/2 flex flex-col">
          <div className="h-10 border-b border-border flex items-center justify-between px-3 bg-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Traduction (AR)</span>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-7 w-7", direction === "rtl" && "bg-secondary")}
                onClick={() => setDirection("rtl")}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-7 w-7", direction === "ltr" && "bg-secondary")}
                onClick={() => setDirection("ltr")}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <div className="w-px h-4 bg-border mx-1" />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFontSize(f => f + 1)}><Type className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-white">
            <textarea
              dir={direction}
              style={{ fontSize: `${fontSize}px` }}
              className={cn(
                "w-full h-full p-12 focus:outline-none resize-none leading-relaxed",
                direction === "rtl" ? "font-arabic" : "font-sans"
              )}
              placeholder="Commencez la traduction ici..."
              defaultValue={`الجمهورية الجزائرية الديمقراطية الشعبية

شهادة ميلاد

بموجب البيانات المسجلة في سجلات الحالة المدنية لبلدية الجزائر الوسطى، نؤكد أن السيد...`}
            />
          </div>
        </div>
      </div>

      {/* Bottom Context Bar */}
      <div className="h-10 border-t border-border bg-white flex items-center justify-between px-4 text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Termes juridiques: <span className="text-foreground font-bold">12 détectés</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Mots: <span className="text-foreground font-bold">142</span></span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground italic">
            Dernière sauvegarde automatique il y a 2 minutes
        </div>
      </div>
    </div>
  );
}
