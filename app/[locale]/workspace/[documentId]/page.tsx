"use client";

import { use, useState, useEffect } from "react";
import { WorkspaceShell } from "../components/workspace-shell";
import { DocumentTabs, TabId } from "@/components/workspace/document-tabs";
import { SourceViewer } from "@/components/workspace/source-viewer";
import { TranslationEditor } from "@/components/workspace/translation-editor";
import { Toaster } from "sonner";
import { FileUp, FileText } from "lucide-react";

export default function WorkspacePage({ 
  params 
}: { 
  params: Promise<{ documentId: string }> 
}) {
  const { documentId } = use(params);
  
  const [activeTab, setActiveTab] = useState<TabId>("translate");
  const [zoom, setZoom] = useState(100);
  const [sourceZoom, setSourceZoom] = useState(100);
  const [viewMode, setViewMode] = useState<"split" | "single" | "stacked">("split");

  // For testing Empty State vs Loaded State
  const [hasDocument, setHasDocument] = useState(false);

  useEffect(() => {
    const validTabs: TabId[] = ["source", "translate", "preview", "compare"];
    const hash = window.location.hash.replace("#", "") as TabId;
    
    if (validTabs.includes(hash)) {
      setActiveTab(hash);
    } else {
      window.history.replaceState(null, "", "#translate");
      setActiveTab("translate");
    }

    const handleHashChange = () => {
      const currentHash = window.location.hash.replace("#", "") as TabId;
      if (validTabs.includes(currentHash)) {
        setActiveTab(currentHash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const mockDocument = {
    fileUrl: "https://placehold.co/800x1200/faf8f3/1a1a1a?text=Document+Source",
    fileType: "image" as const,
  };

  return (
    <WorkspaceShell documentId={documentId}>
      <Toaster position="top-right" />
      <div className="flex flex-col h-full w-full bg-[#faf8f3]">
        <DocumentTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          zoom={zoom}
          onZoomChange={setZoom}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onFullscreenToggle={handleFullscreenToggle}
        />
        
        <div 
          className="flex-1 flex overflow-hidden w-full relative" 
          role="tabpanel" 
          id={`panel-${activeTab}`} 
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === "source" && (
            <div className="flex-1 flex items-center justify-center p-8 bg-[#faf8f3]">
              {hasDocument ? (
                <SourceViewer 
                  fileUrl={mockDocument.fileUrl} 
                  fileType={mockDocument.fileType} 
                  zoom={sourceZoom} 
                  onZoomChange={setSourceZoom} 
                />
              ) : (
                <EmptySourceState onUpload={() => setHasDocument(true)} />
              )}
            </div>
          )}

          {activeTab === "translate" && (
            <div className="flex w-full h-full">
              {viewMode === "split" ? (
                <>
                  <div className="flex-1 border-r border-[#e5e3dc] h-full overflow-hidden">
                    {hasDocument ? (
                      <SourceViewer 
                        fileUrl={mockDocument.fileUrl} 
                        fileType={mockDocument.fileType} 
                        zoom={sourceZoom} 
                        onZoomChange={setSourceZoom} 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full p-8 bg-[#faf8f3]">
                        <EmptySourceState onUpload={() => setHasDocument(true)} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 h-full overflow-auto bg-[#faf8f3] flex items-center justify-center p-4 lg:p-8 relative">
                     <div className="w-full max-w-[850px] h-full flex flex-col mx-auto shadow-sm bg-white">
                        {hasDocument ? (
                          <TranslationEditor initialContent="" />
                        ) : (
                          <EmptyEditorState />
                        )}
                     </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 h-full overflow-auto bg-[#faf8f3] p-4 lg:p-8 flex items-center justify-center relative">
                   <div className="w-full max-w-[850px] h-full flex flex-col mx-auto shadow-sm bg-white">
                     {hasDocument ? (
                       <TranslationEditor initialContent="" />
                     ) : (
                       <EmptyEditorState />
                     )}
                   </div>
                </div>
              )}
            </div>
          )}

          {(activeTab === "preview" || activeTab === "compare") && (
            <div className="flex-1 h-full overflow-auto p-8 flex items-center justify-center bg-[#faf8f3]">
              <div className="text-[#a8a8a8] text-sm italic">Vue non disponible</div>
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}

function EmptySourceState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="w-full max-w-sm flex flex-col items-center bg-white border border-dashed border-[#d4d4d4] rounded p-8 shadow-sm">
      <div className="h-12 w-12 bg-[#faf8f3] rounded-full flex items-center justify-center mb-4 text-[#0d6e4e]">
         <FileUp className="h-5 w-5" />
      </div>
      <h3 className="text-[#1a1a1a] text-[15px] font-semibold mb-1">Glissez votre document</h3>
      <p className="text-[#595959] text-[13px] mb-6">PDF, JPG, PNG, TIFF • Max 200 MB</p>
      <button 
        onClick={onUpload}
        className="h-9 px-4 rounded border border-[#0d6e4e] text-[#0d6e4e] font-medium text-[13px] hover:bg-[#0d6e4e]/5 transition-colors mb-8"
      >
        Parcourir les fichiers
      </button>
      
      <div className="w-full text-left">
        <h4 className="text-[11px] font-bold text-[#a8a8a8] uppercase tracking-wider mb-3">Documents récents</h4>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-[#faf8f3] border border-transparent hover:border-[#e5e3dc] cursor-pointer transition-colors group">
              <div className="h-8 w-8 rounded bg-[#f5f3ed] group-hover:bg-white flex items-center justify-center text-[#595959]">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#1a1a1a] truncate">Document_Projet_{i}.pdf</p>
                <p className="text-[11px] text-[#595959]">Il y a {i} jour(s)</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyEditorState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-md h-full w-full">
      <div className="h-10 w-10 rounded-full bg-[#f5f3ed] flex items-center justify-center mb-3 text-[#a8a8a8]">
        <FileText className="h-5 w-5" />
      </div>
      <h3 className="text-[#1a1a1a] text-[14px] font-medium mb-1">Aucun document ouvert</h3>
      <p className="text-[#a8a8a8] text-[13px] italic">Téléversez ou sélectionnez un document pour commencer</p>
    </div>
  );
}
