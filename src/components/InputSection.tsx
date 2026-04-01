import React, { useState, useRef } from 'react';
import { FileText, Link as LinkIcon, Youtube, Image as ImageIcon, Upload, X, Zap, Loader2 } from 'lucide-react';
import { SummaryMode, OutputFormat, TonePreference } from '../types';
import { cn } from '../lib/utils';
import { performOCR, getYouTubeTranscript } from '../services/geminiService';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';
import PdfAnnotator from './PdfAnnotator';

// Set worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface InputSectionProps {
  onSummarize: (content: string, options: any) => void;
  isSummarizing: boolean;
}

export default function InputSection({ onSummarize, isSummarizing }: InputSectionProps) {
  const [inputType, setInputType] = useState<'text' | 'pdf' | 'url' | 'youtube' | 'image'>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showAnnotator, setShowAnnotator] = useState(false);
  const [annotations, setAnnotations] = useState<any[]>([]);

  // Options
  const [mode, setMode] = useState<SummaryMode>('quick');
  const [format, setFormat] = useState<OutputFormat>('bullet');
  const [tone, setTone] = useState<TonePreference>('simple');
  const [length, setLength] = useState(50);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessingFile(true);

    try {
      if (selectedFile.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const typedarray = new Uint8Array(event.target?.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
          }
          setText(fullText);
          setIsProcessingFile(false);
          toast.success('PDF processed successfully!');
        };
        reader.readAsArrayBuffer(selectedFile);
      } else if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          const extractedText = await performOCR(base64);
          setText(extractedText);
          setIsProcessingFile(false);
          toast.success('Image OCR complete!');
        };
        reader.readAsDataURL(selectedFile);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setText(event.target?.result as string);
          setIsProcessingFile(false);
        };
        reader.readAsText(selectedFile);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to process file.');
      setIsProcessingFile(false);
    }
  };

  const handleSummarize = async () => {
    let finalContent = text;
    
    if (inputType === 'youtube' && url) {
      setIsProcessingFile(true);
      try {
        finalContent = await getYouTubeTranscript(url);
        setText(finalContent);
      } catch (error) {
        toast.error('Failed to get YouTube transcript.');
        setIsProcessingFile(false);
        return;
      }
      setIsProcessingFile(false);
    } else if (inputType === 'url' && url) {
      finalContent = `Please summarize the content from this URL: ${url}`;
    }

    if (!finalContent.trim()) {
      toast.error('Please provide some content to summarize.');
      return;
    }

    onSummarize(finalContent, { mode, format, tone, length, annotations });
  };

  const modes: { id: SummaryMode; label: string; icon: string }[] = [
    { id: 'quick', label: 'Quick', icon: '⚡' },
    { id: 'detailed', label: 'Detailed', icon: '📚' },
    { id: 'exam', label: 'Exam', icon: '🎓' },
    { id: 'eli10', label: 'ELI10', icon: '👶' },
    { id: 'professional', label: 'Pro', icon: '💼' },
    { id: 'critical', label: 'Critical', icon: '🧐' },
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Input Type Selector */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: 'text', icon: FileText, label: 'Text' },
          { id: 'pdf', icon: Upload, label: 'PDF/File' },
          { id: 'url', icon: LinkIcon, label: 'URL' },
          { id: 'youtube', icon: Youtube, label: 'YouTube' },
          { id: 'image', icon: ImageIcon, label: 'Image' },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setInputType(type.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              inputType === type.id ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <type.icon size={16} />
            <span className="hidden sm:inline">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex-1 flex flex-col gap-4">
        {(inputType === 'url' || inputType === 'youtube') && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">
              {inputType === 'url' ? 'Article URL' : 'YouTube Video URL'}
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        )}

        {(inputType === 'pdf' || inputType === 'image') && !text && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-brand-400 hover:bg-brand-50/50 transition-all cursor-pointer group"
          >
            <div className="p-4 bg-brand-100 text-brand-600 rounded-full group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-700">Click to upload or drag & drop</p>
              <p className="text-sm text-slate-500">{inputType === 'pdf' ? 'PDF Document' : 'Image (OCR)'}</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept={inputType === 'pdf' ? '.pdf' : 'image/*'} 
            />
          </div>
        )}

        {inputType === 'pdf' && text && !showAnnotator && (
          <div className="flex flex-col items-center justify-center gap-4 p-8 border border-slate-200 rounded-2xl bg-slate-50">
            <div className="p-3 bg-brand-100 text-brand-600 rounded-full">
              <FileText size={32} />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800">{file?.name}</p>
              <p className="text-sm text-slate-500">Text extracted successfully.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowAnnotator(true)}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all"
              >
                Annotate & Prioritize
              </button>
              <button 
                onClick={() => {setText(''); setFile(null);}}
                className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
              >
                Change File
              </button>
            </div>
          </div>
        )}

        {showAnnotator && file && (
          <div className="flex-1 flex flex-col gap-4 min-h-[400px]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Annotate PDF</h3>
              <button 
                onClick={() => setShowAnnotator(false)}
                className="text-sm font-bold text-brand-600 hover:underline"
              >
                Back to Text View
              </button>
            </div>
            <div className="flex-1 border border-slate-200 rounded-2xl overflow-hidden">
              <PdfAnnotator file={file} onAnnotationsChange={setAnnotations} />
            </div>
          </div>
        )}

        {(text || inputType === 'text') && !showAnnotator && (inputType !== 'pdf' || !text) && (
          <div className="flex-1 flex flex-col gap-2 relative">
            <label className="text-sm font-semibold text-slate-700 flex justify-between">
              Content to Summarize
              {text && (
                <button onClick={() => {setText(''); setFile(null);}} className="text-red-500 hover:text-red-600 flex items-center gap-1">
                  <X size={14} /> Clear
                </button>
              )}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your content here..."
              className="flex-1 w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none font-sans leading-relaxed"
            />
            {isProcessingFile && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-brand-600" size={32} />
                  <p className="text-sm font-medium text-slate-700">Processing content...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Options Panel */}
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mode</label>
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            >
              {modes.map(m => <option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Format</label>
            <select 
              value={format} 
              onChange={(e) => setFormat(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="bullet">Bullet Points</option>
              <option value="paragraph">Paragraph</option>
              <option value="structured">Structured</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tone</label>
            <select 
              value={tone} 
              onChange={(e) => setTone(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="simple">Simple</option>
              <option value="academic">Academic</option>
              <option value="friendly">Friendly</option>
              <option value="technical">Technical</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Summary Length</span>
            <span className="text-brand-600">{length < 33 ? 'Concise' : length < 66 ? 'Balanced' : 'Detailed'}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={length} 
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
        </div>

        <button
          onClick={handleSummarize}
          disabled={isSummarizing || isProcessingFile}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isSummarizing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>AI is thinking...</span>
            </>
          ) : (
            <>
              <Zap size={20} />
              <span>Generate Smart Summary</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
