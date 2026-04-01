import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Sparkles, History, LayoutDashboard, Settings, Info, Menu, X, Github } from 'lucide-react';
import Auth from './components/Auth';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import SavedSummaries from './components/SavedSummaries';
import { SummaryResult, SummaryRecord, SummaryMode, OutputFormat, TonePreference } from './types';
import { summarizeContent } from './services/geminiService';
import { auth, db, collection, addDoc, serverTimestamp } from './firebase';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'summarize' | 'library'>('summarize');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [currentOptions, setCurrentOptions] = useState<any>(null);
  const [lastContent, setLastContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSummarize = async (content: string, options: any) => {
    setIsSummarizing(true);
    setResult(null);
    setIsSaved(false);
    setLastContent(content);
    setCurrentOptions(options);

    try {
      const summary = await summarizeContent(
        content,
        options.mode,
        options.format,
        options.tone,
        options.length,
        options.annotations
      );
      setResult(summary);
      toast.success('Summary generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate summary. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) {
      toast.error('Please sign in to save summaries.');
      return;
    }
    if (!result) return;

    try {
      const record: SummaryRecord = {
        userId: auth.currentUser.uid,
        title: result.tldr.slice(0, 50) + (result.tldr.length > 50 ? '...' : ''),
        originalContent: lastContent,
        summaryResult: result,
        mode: currentOptions.mode,
        format: currentOptions.format,
        tone: currentOptions.tone,
        createdAt: serverTimestamp(),
        tags: result.keywords
      };

      await addDoc(collection(db, 'summaries'), record);
      setIsSaved(true);
      toast.success('Saved to your library!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save summary.');
    }
  };

  const handleSelectFromLibrary = (summary: SummaryRecord) => {
    setResult(summary.summaryResult);
    setLastContent(summary.originalContent);
    setCurrentOptions({
      mode: summary.mode,
      format: summary.format,
      tone: summary.tone
    });
    setIsSaved(true);
    setActiveTab('summarize');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Toaster position="top-center" richColors />
      
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-200">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">OmniSummarize <span className="text-brand-600">AI</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Smart Context Platform</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('summarize')}
            className={cn(
              "text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'summarize' ? "text-brand-600" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            className={cn(
              "text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'library' ? "text-brand-600" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <History size={18} />
            My Library
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Auth />
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[60] bg-white p-6 flex flex-col gap-8"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => {setActiveTab('summarize'); setIsMobileMenuOpen(false);}}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl font-bold"
              >
                <LayoutDashboard /> Dashboard
              </button>
              <button 
                onClick={() => {setActiveTab('library'); setIsMobileMenuOpen(false);}}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl font-bold"
              >
                <History /> My Library
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        {activeTab === 'summarize' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[calc(100vh-160px)]">
            {/* Left Column: Input */}
            <div className="neo-card p-6 md:p-8 flex flex-col">
              <InputSection onSummarize={handleSummarize} isSummarizing={isSummarizing} />
            </div>

            {/* Right Column: Output */}
            <div className="neo-card p-6 md:p-8 flex flex-col bg-white/50">
              <OutputSection 
                result={result} 
                isSummarizing={isSummarizing} 
                onSave={handleSave}
                isSaved={isSaved}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto h-full min-h-[calc(100vh-160px)]">
            <div className="neo-card p-8 h-full">
              <SavedSummaries onSelect={handleSelectFromLibrary} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-slate-400 text-sm font-medium">
          © 2026 OmniSummarize AI. Built with Gemini 3.1 Pro.
        </div>
        <div className="flex items-center gap-6 text-slate-400">
          <a href="#" className="hover:text-brand-600 transition-colors"><Github size={20} /></a>
          <a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-brand-600 transition-colors">Privacy</a>
          <a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-brand-600 transition-colors">Terms</a>
          <a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-brand-600 transition-colors">API Docs</a>
        </div>
      </footer>
    </div>
  );
}
