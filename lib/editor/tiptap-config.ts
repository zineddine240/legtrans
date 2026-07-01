import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
export const getTiptapExtensions = (): any[] => {
  return [
    StarterKit as any,
    Underline as any,
    TextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right", "justify"],
    }) as any,
    Placeholder.configure({
      placeholder: ({ editor }) => {
        const isRTL = editor.view.dom.dir === "rtl" || editor.view.dom.dir === "";
        return isRTL ? "ابدأ بكتابة الترجمة هنا..." 
                     : "Commencez à taper la traduction ici...";
      },
    }) as any,
    CharacterCount as any,
  ];
};
