import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Check, X, Info, AlertCircle, Bookmark, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface Annotation {
  id: string;
  text: string;
  type: 'prioritize' | 'exclude';
  pageNumber: number;
}

interface PdfAnnotatorProps {
  file: File;
  onAnnotationsChange: (annotations: Annotation[]) => void;
}

export default function PdfAnnotator({ file, onAnnotationsChange }: PdfAnnotatorProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const loadedPdf = await loadingTask.promise;
      setPdf(loadedPdf);
      setNumPages(loadedPdf.numPages);
      setLoading(false);
    };
    loadPdf();
  }, [file]);

  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) return;

    const text = selection.toString().trim();
    // We don't easily get page number from browser selection across canvases, 
    // but for the prompt logic, the text itself is enough.
    // In a full implementation, we'd find which page container the selection is in.
    
    // Show a temporary tooltip or just add to a list
    // For this demo, we'll use a simple "Add" UI
  };

  const addAnnotation = (type: 'prioritize' | 'exclude') => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) return;

    const newAnnotation: Annotation = {
      id: Math.random().toString(36).substr(2, 9),
      text: selection.toString().trim(),
      type,
      pageNumber: 1, // Simplified
    };

    const updated = [...annotations, newAnnotation];
    setAnnotations(updated);
    onAnnotationsChange(updated);
    selection.removeAllRanges();
  };

  const removeAnnotation = (id: string) => {
    const updated = annotations.filter(a => a.id !== id);
    setAnnotations(updated);
    onAnnotationsChange(updated);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Info size={16} className="text-brand-500" />
          <span>Select text in the PDF to prioritize or exclude</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => addAnnotation('prioritize')}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors"
          >
            <Bookmark size={14} /> Prioritize
          </button>
          <button 
            onClick={() => addAnnotation('exclude')}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
          >
            <X size={14} /> Exclude
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* PDF Viewer */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto bg-slate-200 rounded-xl p-4 space-y-4 relative"
          onMouseUp={handleSelection}
        >
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            Array.from({ length: numPages }, (_, i) => (
              <PdfPage key={i} pdf={pdf!} pageNumber={i + 1} />
            ))
          )}
        </div>

        {/* Annotations List */}
        <div className="w-64 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selections ({annotations.length})</h4>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {annotations.map(ann => (
              <div 
                key={ann.id} 
                className={cn(
                  "p-3 rounded-xl border text-xs relative group",
                  ann.type === 'prioritize' ? "bg-green-50 border-green-100 text-green-800" : "bg-red-50 border-red-100 text-red-800"
                )}
              >
                <div className="flex items-center gap-1 mb-1 font-bold uppercase text-[10px]">
                  {ann.type === 'prioritize' ? <Bookmark size={10} /> : <X size={10} />}
                  {ann.type}
                </div>
                <p className="line-clamp-3 italic">"{ann.text}"</p>
                <button 
                  onClick={() => removeAnnotation(ann.id)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {annotations.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs italic">
                No regions selected yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PdfPage({ pdf, pageNumber }: { pdf: pdfjsLib.PDFDocumentProxy; pageNumber: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const renderPage = async () => {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };

      await page.render(renderContext).promise;

      // Render text layer for selection
      if (textLayerRef.current) {
        textLayerRef.current.innerHTML = '';
        textLayerRef.current.style.height = `${viewport.height}px`;
        textLayerRef.current.style.width = `${viewport.width}px`;
        
        const textContent = await page.getTextContent();
        
        // In pdfjs-dist v5+, TextLayer is a class
        const textLayer = new (pdfjsLib as any).TextLayer({
          textContentSource: textContent,
          container: textLayerRef.current,
          viewport: viewport,
        });
        await textLayer.render();
      }
      setRendered(true);
    };
    renderPage();
  }, [pdf, pageNumber]);

  return (
    <div className="relative mx-auto bg-white shadow-lg rounded-sm overflow-hidden" style={{ width: 'fit-content' }}>
      <canvas ref={canvasRef} />
      <div 
        ref={textLayerRef} 
        className="textLayer absolute inset-0 opacity-20 selection:bg-brand-500/30" 
        style={{ pointerEvents: 'auto' }}
      />
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-[10px] rounded backdrop-blur-sm">
        Page {pageNumber}
      </div>
    </div>
  );
}
