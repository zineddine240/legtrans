"use client";

import { CheckCircle2, AlertCircle, AlertTriangle, Table as TableIcon, Edit3, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface OCRResultProps {
  confidence: number;
}

export function OCRResult({ confidence }: OCRResultProps) {
  const getConfidenceStatus = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "text-success", bg: "bg-success" };
    if (score >= 70) return { label: "Moyen", color: "text-warning", bg: "bg-warning" };
    return { label: "Faible", color: "text-error", bg: "bg-error" };
  };

  const status = getConfidenceStatus(confidence);

  return (
    <div className="flex flex-col gap-6">
      {/* Confidence Header */}
      <div className="legal-card rounded-xl p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Analyse OCR Terminée</h3>
            <p className="text-sm text-muted-foreground">Texte extrait avec un score de confiance de {confidence}%</p>
          </div>
          <Badge className={`${status.color} bg-white border-${status.color}/20 gap-1.5`}>
            {confidence >= 90 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {status.label}
          </Badge>
        </div>
        <Progress value={confidence} className={`h-2 ${status.bg}/10`} />
      </div>

      {/* Extracted Table Preview */}
      <div className="legal-card rounded-xl overflow-hidden bg-white">
        <div className="p-4 border-b border-border bg-secondary/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold uppercase tracking-wider">Tableau Détecté</span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-primary">
            <Edit3 className="w-3.5 h-3.5 mr-2" /> ÉDITER LE TABLEAU
          </Button>
        </div>
        <div className="p-0">
          <Table>
            <TableHeader className="bg-secondary/10">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="font-bold text-foreground h-10">Désignation</TableHead>
                <TableHead className="font-bold text-foreground h-10">Quantité</TableHead>
                <TableHead className="font-bold text-foreground h-10">Prix Unitaire</TableHead>
                <TableHead className="font-bold text-foreground h-10 text-right">Total (DZD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border">
                <TableCell className="font-medium">Frais de procédure</TableCell>
                <TableCell>01</TableCell>
                <TableCell>2.500,00</TableCell>
                <TableCell className="text-right font-bold">2.500,00</TableCell>
              </TableRow>
              <TableRow className="border-border">
                <TableCell className="font-medium">Droit de timbre</TableCell>
                <TableCell>04</TableCell>
                <TableCell>500,00</TableCell>
                <TableCell className="text-right font-bold">2.000,00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Validation Message */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-info/5 border border-info/20">
        <AlertCircle className="w-5 h-5 text-info shrink-0 mt-0.5" />
        <p className="text-sm text-info-foreground leading-relaxed">
            <span className="font-bold">Note du Traducteur:</span> Les tableaux extraits doivent être vérifiés par rapport à l'original scanné avant la certification finale.
        </p>
      </div>
    </div>
  );
}
