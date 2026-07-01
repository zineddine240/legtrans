"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { EditorToolbar } from "./editor-toolbar";
import { EditorFooter } from "./editor-footer";
import { getTiptapExtensions } from "@/lib/editor/tiptap-config";

interface TranslationEditorProps {
  initialContent?: string;
  onUpdate?: (content: string) => void;
  defaultDirection?: "rtl" | "ltr";
}

export function TranslationEditor({
  initialContent = "",
  onUpdate,
  defaultDirection = "rtl"
}: TranslationEditorProps) {
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    extensions: getTiptapExtensions(),
    content: initialContent,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-base max-w-none focus:outline-none min-h-[400px] w-full p-8 lg:px-12 lg:py-8 text-[var(--color-foreground)] ${defaultDirection === 'rtl' ? 'font-arabic leading-[1.85]' : 'font-sans leading-[1.65]'} text-[16px]`,
        dir: defaultDirection,
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        const currentDir = editor.view.dom.dir || "rtl";
        const newDir = currentDir === "rtl" ? "ltr" : "rtl";
        editor.view.dom.dir = newDir;
        
        if (newDir === "rtl") {
          editor.view.dom.classList.add("font-arabic", "leading-[1.85]");
          editor.view.dom.classList.remove("font-sans", "leading-[1.65]");
        } else {
          editor.view.dom.classList.add("font-sans", "leading-[1.65]");
          editor.view.dom.classList.remove("font-arabic", "leading-[1.85]");
        }

        editor.commands.focus();
        // Force Tiptap to detect change
        editor.chain().insertContent("\u200B").deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).run();
      }
    };

    const domElement = editor.view.dom;
    domElement.addEventListener("keydown", handleKeyDown);
    return () => domElement.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  if (!mounted) {
    return <div className="flex-1 w-full h-full bg-white animate-pulse rounded-md border border-[var(--color-border)]" />;
  }

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden shadow-sm rounded-md">
      <EditorToolbar editor={editor} />
      
      <div className="flex-1 overflow-auto bg-white [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[var(--color-border)] [&::-webkit-scrollbar-thumb]:rounded-full">
        <EditorContent editor={editor} className="h-full w-full" />
      </div>

      <EditorFooter editor={editor} />
      
      <style dangerouslySetInnerHTML={{__html: `
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #8a8a8a;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror[dir="rtl"] p.is-editor-empty:first-child::before {
          float: right;
        }
        .ProseMirror-focused {
          outline: none;
        }
      `}} />
    </div>
  );
}
