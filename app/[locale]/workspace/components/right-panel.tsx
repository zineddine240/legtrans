"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Sparkles, History, StickyNote, ShieldCheck } from "lucide-react";

export function RightPanel() {
  return (
    <div className="h-full flex flex-col bg-white">
      <Tabs defaultValue="ia" className="w-full flex-1 flex flex-col">
        <TabsList className="w-full justify-start h-12 rounded-none border-b border-[var(--color-border)] bg-white p-0 px-2 overflow-x-auto shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsTrigger value="glossaire" className="data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-primary)] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-3 py-3 h-full text-[var(--color-muted-foreground)] data-[state=active]:text-[var(--color-primary)]">
            <BookOpen className="h-4 w-4 mr-2" />
            <span className="hidden xl:inline">Glossaire</span>
          </TabsTrigger>
          <TabsTrigger value="ia" className="data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-primary)] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-3 py-3 h-full text-[var(--color-muted-foreground)] data-[state=active]:text-[var(--color-primary)]">
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="hidden xl:inline">IA Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="historique" className="data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-primary)] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-3 py-3 h-full text-[var(--color-muted-foreground)] data-[state=active]:text-[var(--color-primary)]">
            <History className="h-4 w-4 mr-2" />
            <span className="hidden xl:inline">Historique</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-primary)] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-3 py-3 h-full text-[var(--color-muted-foreground)] data-[state=active]:text-[var(--color-primary)]">
            <StickyNote className="h-4 w-4 mr-2" />
            <span className="hidden xl:inline">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="verif" className="data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-primary)] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-3 py-3 h-full text-[var(--color-muted-foreground)] data-[state=active]:text-[var(--color-primary)]">
            <ShieldCheck className="h-4 w-4 mr-2" />
            <span className="hidden xl:inline">Vérification</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="glossaire" className="flex-1 m-0 p-4 overflow-y-auto">
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
            <BookOpen className="h-10 w-10 text-[var(--color-muted)]" />
            <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Glossaire de termes</p>
          </div>
        </TabsContent>
        
        <TabsContent value="ia" className="flex-1 m-0 p-4 flex flex-col h-full">
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
            <Sparkles className="h-10 w-10 text-[var(--color-primary)]" />
            <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Assistant IA en attente...</p>
          </div>
        </TabsContent>

        <TabsContent value="historique" className="flex-1 m-0 p-4">
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
            <History className="h-10 w-10 text-[var(--color-muted)]" />
            <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Historique des versions</p>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="flex-1 m-0 p-4">
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
            <StickyNote className="h-10 w-10 text-[var(--color-muted)]" />
            <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Notes de traduction</p>
          </div>
        </TabsContent>

        <TabsContent value="verif" className="flex-1 m-0 p-4">
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
            <ShieldCheck className="h-10 w-10 text-[var(--color-muted)]" />
            <p className="text-sm font-medium text-[var(--color-muted-foreground)]">Vérification qualité (QA)</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
