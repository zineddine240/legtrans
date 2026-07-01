"use client";

import React, { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { TopBar } from "./top-bar";
import { LeftNav } from "./left-nav";
import { RightPanel } from "./right-panel";
import { StatusBar } from "./status-bar";

interface WorkspaceShellProps {
  children: React.ReactNode;
  documentId: string;
}

export function WorkspaceShell({ children, documentId }: WorkspaceShellProps) {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-[#faf8f3] text-[#1a1a1a] overflow-hidden">
      <TopBar documentId={documentId} />
      
      <div className="flex-1 flex overflow-hidden">
        <LeftNav isCollapsed={isNavCollapsed} setIsCollapsed={setIsNavCollapsed} />
        
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={75} minSize={30} className="flex flex-col bg-[#faf8f3] z-0">
            {children}
          </ResizablePanel>
          
          <ResizableHandle className="w-px bg-[#e5e3dc] hover:bg-[#0d6e4e] transition-colors z-10" />
          
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-[#faf8f3] border-l border-[#e5e3dc] z-0">
            <RightPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      <StatusBar />
    </div>
  );
}
