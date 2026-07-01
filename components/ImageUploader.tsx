import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Loader2, Sparkles, Send, Edit3, SlidersHorizontal, RotateCcw, Eraser, Trash2, Table2, FileDown, Sheet, Copy, Brush, AlignLeft, AlignCenter, AlignRight, ChevronDown, Maximize, Minus, Plus } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getAccessTier, TIER_LIMITS } from "@/lib/trial";
import { Badge } from "@/components/ui/badge";
import {
  Sheet as SheetUI,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ImageUploaderProps {
  onTextExtracted: (text: string) => void;
}

const ImageUploader = ({ onTextExtracted }: ImageUploaderProps) => {
  const router = useRouter();
  const authContext = useAuth();
  const profile = authContext?.profile;
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // API Key state removed
  const [ocrResult, setOcrResult] = useState("");
  const [ocrMarkdown, setOcrMarkdown] = useState("");
  const [detectTables, setDetectTables] = useState(true);
  const [extractedTables, setExtractedTables] = useState<{ headers: string[]; rows: string[][] }[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [qualityScore, setQualityScore] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [showOcrPanel, setShowOcrPanel] = useState(false);
  const [contrast, setContrast] = useState(1.0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalImageData, setOriginalImageData] = useState<string | null>(null);
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [paths, setPaths] = useState<{ x: number, y: number, size: number }[][]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number, y: number, size: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showDataPanel, setShowDataPanel] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!imagePreview) return;
    e.stopPropagation();
    e.preventDefault();

    setZoom((prevZoom) => {
      const newZoom = Math.min(Math.max(prevZoom - e.deltaY * 0.001, 1), 5);
      return newZoom;
    });
  }, [imagePreview]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDraggingImage(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDraggingImage && zoom > 1) {
      e.preventDefault();
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDraggingImage, zoom, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingImage(false);
  }, []);

  const handleResetZoom = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const getCanvasMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas || !imageRef.current) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Coordinates relative to the canvas element
    const x = (clientX - rect.left);
    const y = (clientY - rect.top);

    // Now rotate/scale back based on zoom and pan
    // x_actual = (x_canvas - pan_x) / zoom
    const actualX = (x - pan.x) / zoom;
    const actualY = (y - pan.y) / zoom;

    return { x: actualX, y: actualY };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEraserMode || isProcessing) return;
    setIsDrawing(true);
    const pos = getCanvasMousePos(e);
    setCurrentPath([{ ...pos, size: brushSize / zoom }]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isEraserMode || isProcessing) return;
    const pos = getCanvasMousePos(e);
    setCurrentPath(prev => [...prev, { ...pos, size: brushSize / zoom }]);
  };

  const stopDrawing = () => {
    if (currentPath.length > 0) {
      setPaths(prev => [...prev, currentPath]);
    }
    setCurrentPath([]);
    setIsDrawing(false);
  };

  // Render paths on drawing canvas
  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imageRef.current) return;

    // Set canvas dimensions to match display dimensions of the image container
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000'; // Black redaction

    const allPaths = [...paths];
    if (currentPath.length > 0) allPaths.push(currentPath);

    allPaths.forEach(path => {
      if (path.length < 1) return;
      ctx.beginPath();
      
      // Apply transforms for visualization
      const p0 = path[0];
      ctx.moveTo(p0.x * zoom + pan.x, p0.y * zoom + pan.y);
      ctx.lineWidth = p0.size * zoom;

      path.forEach(point => {
        ctx.lineTo(point.x * zoom + pan.x, point.y * zoom + pan.y);
      });
      ctx.stroke();
    });
  }, [paths, currentPath, zoom, pan, imagePreview]);

  // Apply contrast to image using Canvas API with manual pixel manipulation
  const applyContrastToImage = useCallback((imageData: string, contrastValue: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Get image data for pixel manipulation
        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageDataObj.data;

        // Apply contrast formula: newValue = (value - 128) * contrast + 128
        const factor = (259 * (contrastValue * 255 - 128)) / (255 * (259 - contrastValue * 255 + 128));

        for (let i = 0; i < data.length; i += 4) {
          // Red
          data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
          // Green
          data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
          // Blue
          data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
          // Alpha stays the same
        }

        // Put the modified data back
        ctx.putImageData(imageDataObj, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.onerror = reject;
      img.src = imageData;
    });
  }, []);

  // Update preview when contrast changes
  useEffect(() => {
    if (originalImageData && contrast !== 1.0) {
      applyContrastToImage(originalImageData, contrast)
        .then(adjustedImage => setImagePreview(adjustedImage))
        .catch(err => console.error('Failed to apply contrast:', err));
    } else if (originalImageData && contrast === 1.0) {
      setImagePreview(originalImageData);
    }
  }, [contrast, originalImageData, applyContrastToImage]);

  // Reset contrast to default
  const resetContrast = useCallback(() => {
    setContrast(1.0);
  }, []);



  // Load image for preview only (no OCR)
  const loadImage = useCallback((file: File) => {
    setUploadedFile(file);
    setOcrResult("");
    setShowOcrPanel(false);

    // Create image preview and store original
    const previewReader = new FileReader();
    previewReader.onload = () => {
      const dataUrl = previewReader.result as string;
      setOriginalImageData(dataUrl);
      setImagePreview(dataUrl);
      setContrast(1.0); // Reset contrast for new image
      setPaths([]); // Clear previous redactions
    };
    previewReader.readAsDataURL(file);
  }, []);

  // Download helpers
  const downloadDocx = useCallback(async () => {
    if (!ocrMarkdown && extractedTables.length === 0) return;
    setIsExporting(true);
    try {
      const res = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: ocrMarkdown, tables: extractedTables, title: "LegTrans DZ — Document" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "legtrans-export.docx"; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "تم التحميل ✓", description: "تم حفظ الملف بصيغة Word" });
    } catch (e) {
      toast({ title: "خطأ", description: "فشل تحميل ملف Word", variant: "destructive" });
    } finally { setIsExporting(false); }
  }, [ocrMarkdown, extractedTables, toast]);

  const downloadXlsx = useCallback(async () => {
    if (extractedTables.length === 0) return;

    const userTier = profile ? getAccessTier(profile) : 'free';
    const limits = TIER_LIMITS[userTier];
    if (limits && !limits.exportFormat?.includes('xlsx')) {
      toast({
        title: "Fonctionnalité Premium",
        description: "L'export Excel est réservé aux forfaits d'essai et premium. Veuillez passer à un forfait supérieur.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      const res = await fetch("/api/export-xlsx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tables: extractedTables, title: "LegTrans DZ" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "legtrans-tables.xlsx"; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "تم التحميل ✓", description: "تم حفظ الجداول بصيغة Excel" });
    } catch (e) {
      toast({ title: "خطأ", description: "فشل تحميل ملف Excel", variant: "destructive" });
    } finally { setIsExporting(false); }
  }, [extractedTables, toast, profile]);

  // Run OCR via /api/ocr
  const runOCR = useCallback(async () => {
    if (!uploadedFile) {
      toast({ title: "لا توجد صورة", description: "الرجاء رفع صورة أولاً", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    setOcrResult("");
    setExtractedTables([]);

    try {
      let finalImageBlob: Blob;
      if (paths.length === 0 && contrast === 1.0) {
        finalImageBlob = uploadedFile;
      } else {
        finalImageBlob = await new Promise<Blob>((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          const timeout = setTimeout(() => reject(new Error('Timeout')), 10000);
          img.onload = () => {
            clearTimeout(timeout);
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas error'));
            ctx.drawImage(img, 0, 0);
            const scaleX = img.width / (imageRef.current?.clientWidth || img.width);
            const scaleY = img.height / (imageRef.current?.clientHeight || img.height);
            if (paths.length > 0) {
              ctx.fillStyle = '#000'; ctx.strokeStyle = '#000';
              ctx.lineJoin = 'round'; ctx.lineCap = 'round';
              paths.forEach(path => {
                if (!path.length) return;
                ctx.beginPath();
                ctx.lineWidth = path[0].size * scaleX;
                ctx.moveTo(path[0].x * scaleX, path[0].y * scaleY);
                path.forEach(p => ctx.lineTo(p.x * scaleX, p.y * scaleY));
                ctx.stroke();
              });
            }
            canvas.toBlob(b => b ? resolve(b) : reject(new Error('Blob failed')), 'image/jpeg', 0.9);
          };
          img.onerror = () => { clearTimeout(timeout); reject(new Error('Load failed')); };
          img.src = URL.createObjectURL(uploadedFile);
        });
      }

      const userTier = profile ? getAccessTier(profile) : 'free';
      const ocrMode = (userTier === 'plus' || userTier === 'admin') ? 'accurate' : 'fast';

      const formData = new FormData();
      formData.append("image", finalImageBlob, uploadedFile.name || "document.jpg");
      formData.append("mode", ocrMode);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);

      const response = await fetch("/api/ocr", { method: "POST", body: formData, signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error('Detailed OCR Error:', err);
        throw new Error(err.error || `Erreur serveur: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Échec OCR");
      }

      // Direct result (server polls internally)
      let text = data.markdown || data.text || "";

      setOcrResult(text);
      setOcrMarkdown(data.markdown || text);
      setPageCount(data.page_count || data.pageCount || 1);
      setQualityScore(data.parse_quality_score || 0);

      if (detectTables && data.tables?.length > 0) {
        setExtractedTables(data.tables);
        setShowDataPanel(true);
        toast({
          title: "تم اكتشاف جداول ✓",
          description: `تم العثور على ${data.tables.length} جدول في الوثيقة`,
        });
      }

      setShowOcrPanel(true);
      toast({ title: "تم استخراج النص بنجاح ✓", description: "يمكنك تعديل النص قبل إرساله للترجمة" });

    } catch (error: unknown) {
      console.error("OCR error:", error);
      toast({
        title: "فشل الاستخراج / Échec OCR",
        description: error instanceof Error ? error.message : "تعذر الاتصال بالخادم",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFile, paths, contrast, detectTables, toast, profile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      loadImage(file);
    } else {
      toast({
        title: "ملف غير صالح",
        description: "الرجاء رفع صورة (JPG, PNG) أو ملف PDF",
        variant: "destructive",
      });
    }
  }, [loadImage, toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImage(file);
    }
  }, [loadImage]);

  const clearFile = useCallback(() => {
    setUploadedFile(null);
    setImagePreview(null);
    setOriginalImageData(null);
    setOcrResult("");
    setShowOcrPanel(false);
    setContrast(1.0);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setPaths([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#faf8f3] overflow-hidden animate-in fade-in duration-700">
      
      {/* Premium Toolbar Area - Bright Institutional */}
      <div className="h-14 bg-white flex items-center justify-between px-6 z-30 shadow-sm border-b border-border">
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-md">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white hover:text-primary"><RotateCcw className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-50 hover:bg-white hover:text-primary"><RotateCcw className="w-4 h-4 scale-x-[-1]" /></Button>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-bold hover:text-primary">B</Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs italic hover:text-primary">I</Button>
            <div className="flex items-center gap-1.5 ml-2 bg-secondary/30 px-2 py-1 rounded border border-border">
              <span className="text-[10px] font-mono text-primary-dark">15px</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={downloadDocx}
              disabled={isExporting || !ocrResult}
              className="h-9 gap-2 text-primary hover:bg-primary/5 text-xs font-bold"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              DOCX
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={downloadXlsx}
              disabled={isExporting || extractedTables.length === 0}
              className="h-9 gap-2 text-primary hover:bg-primary/5 text-xs font-bold"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sheet className="w-4 h-4" />}
              XLSX
            </Button>
            
            {extractedTables.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDataPanel(true)}
                className="h-9 gap-2 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 animate-pulse text-xs font-bold"
              >
                <Table2 className="w-4 h-4" />
                DONNÉES ({extractedTables.length})
              </Button>
            )}
          </div>

          <div className="h-6 w-px bg-border mx-1" />
          
          <Button onClick={runOCR} disabled={isProcessing || !uploadedFile} className="btn-primary h-9 gap-2 px-6 text-xs tracking-widest uppercase">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isProcessing ? "Traitement..." : "Lancer OCR"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Slim White Sidebar */}
        <div className="w-16 bg-white border-r border-border flex flex-col items-center py-6 gap-6 overflow-y-auto hidden md:flex shrink-0">
          {imagePreview ? (
             <div className="w-10 h-14 rounded border border-primary/50 shadow-sm bg-muted overflow-hidden cursor-pointer hover:border-primary transition-all">
                <img src={imagePreview} className="w-full h-full object-cover opacity-90" />
                <div className="text-[8px] text-center bg-primary text-white py-0.5 font-bold">PAGE 1</div>
             </div>
          ) : (
            <div className="w-10 h-14 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground/30 text-[8px] font-bold">
              PAGE 1
            </div>
          )}
          <div className="w-10 h-14 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground/10 text-[12px] hover:bg-secondary/50 cursor-pointer">
            +
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[42%_1fr] overflow-hidden bg-[#e5e7eb]">
          
          {/* Image Viewer Panel */}
          <div className="relative flex flex-col overflow-hidden border-r border-border/50 bg-[#d1d5db]/30">
            <div 
              className="flex-1 overflow-hidden relative flex items-center justify-center p-8"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {imagePreview ? (
                <div className="relative shadow-2xl border border-black/10 bg-white group">
                  <img
                    ref={imageRef}
                    src={imagePreview}
                    alt="Scan"
                    className="max-w-none transition-transform duration-75 ease-linear"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      cursor: isEraserMode ? "crosshair" : (zoom > 1 ? (isDraggingImage ? "grabbing" : "grab") : "default"),
                      width: "auto",
                      height: "75vh"
                    }}
                    draggable={false}
                  />
                  
                  {/* Floating Action Bar */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border border-border opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="h-8 w-8 rounded-full"><Minus className="w-4 h-4" /></Button>
                    <span className="text-xs font-bold w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.min(z + 0.2, 5))} className="h-8 w-8 rounded-full"><Plus className="w-4 h-4" /></Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button variant="ghost" size="sm" onClick={handleResetZoom} className="h-8 w-8 rounded-full"><Maximize className="w-4 h-4" /></Button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-3/4 h-3/4 border-2 border-dashed border-muted-foreground/30 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-white/50 transition-colors cursor-pointer"
                >
                   <Upload className="w-12 h-12 text-muted-foreground/40" />
                   <div className="text-center">
                      <p className="font-bold text-muted-foreground">Déposez votre document ici</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">PDF, JPG ou PNG supportés</p>
                   </div>
                   <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
                </div>
              )}
            </div>
          </div>

          {/* Editor Panel - Paper Workstation */}
          <div className="relative flex flex-col overflow-hidden bg-[#f5f3ed]/50 p-4 lg:p-10">
            <div className="flex-1 bg-white paper-shadow rounded-sm mx-auto w-full max-w-[850px] flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-500 border border-border/50">
               <div className="bg-muted/5 px-8 py-3 border-b border-border/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground/60">
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Éditeur Professionnel v1.0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"><AlignLeft className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-primary bg-primary/5"><AlignCenter className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"><AlignRight className="w-4 h-4" /></Button>
                  </div>
               </div>
               <div className="flex-1 p-10 lg:p-20 overflow-auto custom-scrollbar">
                  {ocrResult ? (
                    <textarea
                      value={ocrResult}
                      onChange={(e) => { setOcrResult(e.target.value); setOcrMarkdown(e.target.value); }}
                      className="w-full h-full bg-transparent text-[#1e293b] resize-none focus:outline-none leading-[2.1] font-serif text-xl selection:bg-accent/20 placeholder:text-muted-foreground/30"
                      dir="auto"
                      style={{ minHeight: "900px" }}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                      <FileText className="w-24 h-24 mb-8 text-primary" />
                      <p className="text-3xl font-serif text-primary-dark">Document Vide</p>
                      <p className="max-w-xs mt-4 text-sm italic">Prêt pour l'extraction de haute précision.</p>
                    </div>
                  )}
               </div>

               {/* Action Bar for Translation */}
               {ocrResult && (
                 <div className="border-t border-border/50 p-6 flex items-center justify-center bg-muted/5">
                    <Button 
                      onClick={() => router.push(`/translate?text=${encodeURIComponent(ocrResult)}`)}
                      className="btn-gold h-12 px-10 gap-3 text-lg font-bold shadow-xl hover:scale-105 transition-all animate-in slide-in-from-bottom"
                    >
                      <Sparkles className="w-5 h-5" />
                      TRADUIRE CE DOCUMENT
                    </Button>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Side Data Panel (Sheet) */}
      <SheetUI open={showDataPanel} onOpenChange={setShowDataPanel}>
        <SheetContent className="w-full sm:max-w-[600px] p-0 flex flex-col gap-0 border-l border-border/50 shadow-2xl">
          <SheetHeader className="p-6 border-b border-border/50 bg-white/80 backdrop-blur sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                   <Table2 className="w-5 h-5" />
                </div>
                <div>
                  <SheetTitle className="text-xl font-serif font-bold text-primary-dark">Données Extraites</SheetTitle>
                  <SheetDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
                    Analyse de Structure & Tableaux
                  </SheetDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={downloadXlsx} className="h-9 gap-2 shadow-sm">
                <Sheet className="w-4 h-4 text-green-600" />
                Excel (.xlsx)
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-6 bg-[#f8f9fa]">
             <div className="space-y-8 pb-10">
                {extractedTables.map((tbl, ti) => (
                  <div key={ti} className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${ti * 100}ms` }}>
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-bold bg-white border-primary/20 text-primary">
                          TABLEAU {ti + 1}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium">{tbl.rows.length} lignes × {tbl.headers.length} colonnes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[10px] gap-1.5 hover:bg-white hover:shadow-sm transition-all"
                          onClick={() => {
                            const tableText = [tbl.headers.join("\t"), ...tbl.rows.map(r => r.join("\t"))].join("\n");
                            navigator.clipboard.writeText(tableText);
                            toast({ title: "Copié !", description: "Tableau prêt pour Excel." });
                          }}
                        >
                          <Copy className="w-3 h-3" /> Copier
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-white shadow-sm overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            {tbl.headers.map((h, hi) => (
                              <TableHead key={hi} className="h-9 text-[10px] font-bold uppercase tracking-wider text-primary-dark border-r border-border/30 last:border-0">
                                {h}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tbl.rows.map((row, ri) => (
                            <TableRow key={ri} className="hover:bg-primary/[0.02] transition-colors border-b border-border/30 last:border-0">
                              {row.map((cell, ci) => (
                                <TableCell key={ci} className="py-2.5 px-3 text-[11px] text-foreground/80 border-r border-border/30 last:border-0">
                                  {cell}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}

                {extractedTables.length === 0 && (
                   <div className="h-[400px] flex flex-col items-center justify-center text-center opacity-30">
                      <Table2 className="w-16 h-16 mb-4" />
                      <p className="text-lg font-serif">Aucune donnée structurée</p>
                      <p className="text-xs italic mt-1">Les tableaux détectés apparaîtront ici.</p>
                   </div>
                )}
             </div>
          </ScrollArea>
        </SheetContent>
      </SheetUI>

      {/* Modern Status Bar - Bright Institutional */}
      <div className="h-8 bg-white border-t border-border flex items-center justify-between px-6 text-[10px] text-muted-foreground font-medium">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary flex items-center justify-center overflow-hidden">
               <div className="w-full h-[92%] bg-primary/10" />
            </div>
            <span className="font-bold text-foreground">CONFIANCE OCR: <span className="text-primary">92%</span></span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-3">
             <span>MOTS: <span className="text-foreground/70">{ocrResult.split(/\s+/).filter(Boolean).length}</span></span>
             <span>CARACTÈRES: <span className="text-foreground/70">{ocrResult.length}</span></span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[9px] font-bold">SYSTÈME OPÉRATIONNEL</span>
           </div>
           <div className="h-4 w-px bg-border" />
           <span className="italic text-[9px]">v1.0.4-WORKBENCH</span>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
