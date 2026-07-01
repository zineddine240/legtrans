import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata = {
  title: "Workspace | LegTrans DZ",
  description: "Espace de travail pour les traducteurs assermentés",
};

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-screen w-full bg-[var(--color-background)] text-[var(--color-foreground)] overflow-hidden font-sans">
        {children}
      </div>
    </TooltipProvider>
  );
}
