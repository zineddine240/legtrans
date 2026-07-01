"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import { 
  Undo, Redo, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ArrowRightFromLine, ArrowLeftFromLine, ChevronDown, Plus, 
  List, ListOrdered, Table, Calendar, Stamp, FileBadge,
  FileDown, FileSpreadsheet, ScanText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const currentDir = editor.view.dom.dir || "rtl";
  const isRTL = currentDir === "rtl";

  const toggleDirection = (dir: "rtl" | "ltr") => {
    if (currentDir === dir) return;
    editor.view.dom.dir = dir;
    
    if (dir === "rtl") {
      editor.view.dom.classList.add("font-arabic", "leading-[1.85]");
      editor.view.dom.classList.remove("font-sans", "leading-[1.65]");
    } else {
      editor.view.dom.classList.add("font-sans", "leading-[1.65]");
      editor.view.dom.classList.remove("font-arabic", "leading-[1.85]");
    }

    editor.commands.focus();
    editor.chain().insertContent("\u200B").deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from }).run();
  };

  const insertDate = () => {
    const today = new Date();
    const formatted = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getFullYear()}`;
    editor.chain().focus().insertContent(formatted).run();
  };

  const insertStamp = () => editor.chain().focus().insertContent("[TAMPON OFFICIEL]").run();
  const insertTranslatorInfo = () => editor.chain().focus().insertContent("[Nom du traducteur — N° agrément]").run();

  const ToolbarBtn = ({ 
    active, onClick, icon: Icon, disabled = false, title
  }: { active?: boolean, onClick: () => void, icon: React.ElementType, disabled?: boolean, title?: string }) => (
    <button
      type="button"
      title={title}
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6e4e]",
        disabled ? "opacity-50 cursor-not-allowed text-[#a8a8a8]" :
        active 
          ? "bg-[#0d6e4e]/10 text-[#0d6e4e] font-medium" 
          : "text-[#595959] hover:bg-[#f5f3ed] hover:text-[#1a1a1a]"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-[#e5e3dc] mx-1" aria-hidden="true" />;

  return (
    <div className="h-[48px] shrink-0 sticky top-0 bg-white border-b border-[#e5e3dc] flex items-center px-3 z-10 gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      {/* Group 1: History */}
      <ToolbarBtn 
        onClick={() => editor.chain().focus().undo().run()} 
        disabled={!editor.can().undo()}
        icon={Undo} title="Undo" 
      />
      <ToolbarBtn 
        onClick={() => editor.chain().focus().redo().run()} 
        disabled={!editor.can().redo()}
        icon={Redo} title="Redo" 
      />
      <Divider />

      {/* Group 2: Format */}
      <ToolbarBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} icon={Bold} title="Bold" />
      <ToolbarBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} icon={Italic} title="Italic" />
      <ToolbarBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} icon={Underline} title="Underline" />
      <ToolbarBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} icon={Strikethrough} title="Strikethrough" />
      <Divider />

      {/* Group 3: Alignment */}
      <ToolbarBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} icon={AlignLeft} title="Align left" />
      <ToolbarBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} icon={AlignCenter} title="Align center" />
      <ToolbarBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} icon={AlignRight} title="Align right" />
      <ToolbarBtn active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} icon={AlignJustify} title="Justify" />
      <Divider />

      {/* Group 4: Direction */}
      <div className="flex bg-[#f5f3ed] rounded p-0.5 border border-[#e5e3dc]">
        <button
          onClick={() => toggleDirection("ltr")}
          className={cn("px-2 py-1 h-7 rounded flex items-center gap-1 text-[11px] font-semibold transition-colors", !isRTL ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#595959] hover:text-[#1a1a1a]")}
        >
          <ArrowRightFromLine className="h-3 w-3" /> LTR
        </button>
        <button
          onClick={() => toggleDirection("rtl")}
          className={cn("px-2 py-1 h-7 rounded flex items-center gap-1 text-[11px] font-semibold transition-colors", isRTL ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#595959] hover:text-[#1a1a1a]")}
        >
          <ArrowLeftFromLine className="h-3 w-3" /> RTL
        </button>
      </div>
      <Divider />

      {/* Group 5: Font */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-[#595959] px-2 hover:bg-[#f5f3ed] hover:text-[#1a1a1a] font-normal">
            Sans
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Sans-serif</DropdownMenuItem>
          <DropdownMenuItem>Serif</DropdownMenuItem>
          <DropdownMenuItem>Monospace</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-[#595959] px-2 hover:bg-[#f5f3ed] hover:text-[#1a1a1a] font-normal">
            15pt
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[60px]">
          {["11pt", "12pt", "14pt", "15pt", "16pt", "18pt"].map(s => <DropdownMenuItem key={s}>{s}</DropdownMenuItem>)}
        </DropdownMenuContent>
      </DropdownMenu>
      <Divider />

      {/* Group 6: Lists */}
      <ToolbarBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} icon={List} title="Bullet List" />
      <ToolbarBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} icon={ListOrdered} title="Numbered List" />
      <Divider />

      {/* Group 7: Insert */}
      <ToolbarBtn onClick={() => {}} icon={Table} title="Insert Table" />
      <ToolbarBtn onClick={insertDate} icon={Calendar} title="Insert Date" />
      <ToolbarBtn onClick={insertStamp} icon={Stamp} title="Insert Stamp" />
      <ToolbarBtn onClick={insertTranslatorInfo} icon={FileBadge} title="Insert Translator Info" />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Group 8: Export */}
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[#595959] hover:bg-[#f5f3ed] hover:text-[#1a1a1a] font-medium hidden md:flex">
        <FileDown className="h-4 w-4" /> DOCX
      </Button>
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[#595959] hover:bg-[#f5f3ed] hover:text-[#1a1a1a] font-medium hidden lg:flex">
        <FileSpreadsheet className="h-4 w-4" /> XLSX
      </Button>
      
      <div className="w-px h-5 bg-[#e5e3dc] mx-2 hidden md:block" />

      {/* Group 9: Action */}
      <Button size="sm" className="h-8 bg-[#0d6e4e] hover:bg-[#0a5c40] text-white font-medium gap-1.5 shadow-sm">
        <ScanText className="h-4 w-4" /> Lancer OCR
      </Button>

    </div>
  );
}
