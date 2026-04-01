import React from 'react';
import { SummaryResult } from '../types';
import ReactMarkdown from 'react-markdown';
import { Copy, Download, Share2, Sparkles, HelpCircle, Lightbulb, Key, MessageSquare, Save, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface OutputSectionProps {
  result: SummaryResult | null;
  isSummarizing: boolean;
  onSave?: () => void;
  isSaved?: boolean;
}

export default function OutputSection({ result, isSummarizing, onSave, isSaved }: OutputSectionProps) {
  const handleCopy = () => {
    if (!result) return;
    const text = `
TL;DR: ${result.tldr}

Key Points:
${result.keyPoints.map(p => `- ${p}`).join('\n')}

Keywords: ${result.keywords.join(', ')}
    `;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleDownload = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('OmniSummarize AI - Summary', 20, 20);
    
    doc.setFontSize(12);
    doc.text('TL;DR', 20, 35);
    const splitTldr = doc.splitTextToSize(result.tldr, 170);
    doc.text(splitTldr, 20, 45);

    doc.text('Key Points', 20, 70);
    let y = 80;
    result.keyPoints.forEach(point => {
      const splitPoint = doc.splitTextToSize(`• ${point}`, 170);
      doc.text(splitPoint, 20, y);
      y += (splitPoint.length * 7);
    });

    doc.save('summary.pdf');
    toast.success('Downloaded as PDF!');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (isSummarizing) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 p-12 text-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-500 animate-pulse" size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800">OmniSummarize is analyzing...</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Extracting key insights, detecting context, and crafting your perfect summary.</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 bg-brand-500 rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
        <div className="p-4 bg-slate-50 rounded-full">
          <MessageSquare size={48} />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-slate-500">Your summary will appear here</p>
          <p className="text-sm">Upload a file or paste text to get started</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full gap-6 overflow-y-auto pr-2"
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md py-2 z-10 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-brand-100 text-brand-700 text-xs font-bold rounded-full uppercase tracking-wider">
            {result.contentType || 'General'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all" title="Copy">
            <Copy size={18} />
          </button>
          <button onClick={handleDownload} className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all" title="Download PDF">
            <Download size={18} />
          </button>
          <button onClick={onSave} disabled={isSaved} className={cn("p-2 rounded-lg transition-all", isSaved ? "text-green-500 bg-green-50" : "text-slate-500 hover:text-brand-600 hover:bg-brand-50")} title="Save to Library">
            <Save size={18} />
          </button>
        </div>
      </div>

      {/* TL;DR Section */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
          <Zap size={16} className="text-amber-500" />
          TL;DR Summary
        </h3>
        <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl text-slate-800 font-medium leading-relaxed">
          {result.tldr}
        </div>
      </section>

      {/* Key Points */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
          <Key size={16} className="text-brand-500" />
          Key Insights
        </h3>
        <ul className="grid gap-3">
          {result.keyPoints.map((point, i) => (
            <motion.li 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <p className="text-slate-700 leading-relaxed">{point}</p>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* Keywords */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
          <Lightbulb size={16} className="text-purple-500" />
          Keywords
        </h3>
        <div className="flex flex-wrap gap-2">
          {result.keywords.map((word, i) => (
            <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg border border-purple-100">
              #{word}
            </span>
          ))}
        </div>
      </section>

      {/* Simplified Explanation */}
      {result.simplifiedExplanation && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <HelpCircle size={16} className="text-green-500" />
            Simplified Explanation
          </h3>
          <div className="p-5 bg-green-50 border border-green-100 rounded-2xl text-slate-700 italic leading-relaxed">
            "{result.simplifiedExplanation}"
          </div>
        </section>
      )}

      {/* Exam Questions */}
      {result.questions && result.questions.length > 0 && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <HelpCircle size={16} className="text-red-500" />
            Revision Questions
          </h3>
          <div className="grid gap-4">
            {result.questions.map((q, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800 mb-2">Q: {q.question}</p>
                <details className="group">
                  <summary className="text-sm text-brand-600 font-semibold cursor-pointer list-none flex items-center gap-1">
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                    Show Answer
                  </summary>
                  <p className="mt-2 text-slate-600 text-sm p-3 bg-white rounded-lg border border-slate-100">
                    {q.answer}
                  </p>
                </details>
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
