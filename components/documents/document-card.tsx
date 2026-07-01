"use client";

import { FileText, MoreVertical, Download, Clock, CheckCircle2, AlertCircle, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentCardProps {
  title: string;
  refNumber: string;
  status: "draft" | "translating" | "verifying" | "certified";
  date: string;
  pages: number;
}

export function DocumentCard({ title, refNumber, status, date, pages }: DocumentCardProps) {
  const statusConfig = {
    draft: { label: "Brouillon", color: "bg-muted/20 text-muted-foreground border-muted/30", icon: Clock },
    translating: { label: "En cours", color: "bg-info/10 text-info border-info/20", icon: Clock },
    verifying: { label: "À vérifier", color: "bg-warning/10 text-warning border-warning/20", icon: AlertCircle },
    certified: { label: "Certifié", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  };

  const config = statusConfig[status];

  return (
    <div className="legal-card rounded-xl p-5 flex flex-col gap-4 group">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center text-primary/60 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <FileText className="w-6 h-6" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> Voir</DropdownMenuItem>
            <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Télécharger</DropdownMenuItem>
            <DropdownMenuItem className="text-error focus:text-error"><Trash2 className="mr-2 h-4 w-4" /> Archiver</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-1">
        <h4 className="font-bold text-foreground leading-tight line-clamp-1">{title}</h4>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{refNumber}</p>
      </div>

      <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
        <Badge variant="outline" className={`${config.color} gap-1.5 px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wider border`}>
          <config.icon className="w-3 h-3" />
          {config.label}
        </Badge>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <span>{pages} p.</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}
