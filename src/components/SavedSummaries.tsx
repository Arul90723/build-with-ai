import React, { useState, useEffect } from 'react';
import { db, collection, query, where, orderBy, onSnapshot, deleteDoc, doc, auth } from '../firebase';
import { SummaryRecord } from '../types';
import { Trash2, Calendar, Tag, FileText, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface SavedSummariesProps {
  onSelect: (summary: SummaryRecord) => void;
}

export default function SavedSummaries({ onSelect }: SavedSummariesProps) {
  const [summaries, setSummaries] = useState<SummaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!auth.currentUser) {
      setSummaries([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'summaries'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SummaryRecord[];
      setSummaries(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this summary?')) return;
    try {
      await deleteDoc(doc(db, 'summaries', id));
      toast.success('Summary deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const filtered = summaries.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.summaryResult.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="p-8 text-center text-slate-400">Loading library...</div>;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Your Library</h2>
        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">
          {summaries.length} Items
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search summaries or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((s) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => onSelect(s)}
              className="group p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-brand-300 hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
                  {s.title}
                </h3>
                <button 
                  onClick={(e) => handleDelete(s.id!, e)}
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                {s.summaryResult.tldr}
              </p>

              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 bg-brand-50 text-brand-600 text-[10px] font-bold rounded-md uppercase">
                  {s.mode}
                </span>
                {s.summaryResult.keywords.slice(0, 2).map((k, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-medium rounded-md">
                    #{k}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <FileText className="mx-auto mb-2 opacity-20" size={32} />
            <p className="text-sm">No summaries found</p>
          </div>
        )}
      </div>
    </div>
  );
}
