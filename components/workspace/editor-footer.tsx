"use client";

import React from "react";
import { Editor } from "@tiptap/react";

interface EditorFooterProps {
  editor: Editor | null;
}

export function EditorFooter({ editor }: EditorFooterProps) {
  if (!editor) return null;

  const words = editor.storage.characterCount.words();
  const characters = editor.storage.characterCount.characters();
  
  const selection = editor.state.selection;
  let line = 1;
  let col = 1;
  
  if (selection) {
    const resolvedPos = editor.state.doc.resolve(selection.from);
    line = (resolvedPos as any).path && (resolvedPos as any).path.length > 1 ? (resolvedPos as any).index(0) + 1 : 1;
    col = resolvedPos.parentOffset + 1;
  }

  return (
    <div className="h-[32px] shrink-0 sticky bottom-0 bg-[var(--color-secondary)] border-t border-[var(--color-border)] flex items-center px-4 z-10 text-xs text-[var(--color-muted-foreground)] font-medium font-sans w-full">
      <div className="flex items-center gap-6 flex-1">
        <span>{words} {words > 1 ? "mots" : "mot"}</span>
        <span>{characters.toLocaleString()} caractères</span>
      </div>
      
      <div className="flex items-center justify-end flex-1">
        <span className="font-mono bg-[var(--color-background)] px-2 py-0.5 rounded border border-[var(--color-border)] shadow-sm">
          L {line}, C {col}
        </span>
      </div>
    </div>
  );
}
