'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, RefreshCw, Sparkles } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://safinia-api.onrender.com';

export default function NarrativeCard({ analysis }) {
  const [narrative, setNarrative] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNarrative = async () => {
    if (!analysis) return;
    setIsLoading(true);
    setError('');
    setNarrative('');

    try {
      const response = await fetch(`${API_URL}/narrative`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate narrative');
      }

      const data = await response.json();
      setNarrative(data.narrative);
    } catch (err) {
      setError(err.message || 'Failed to generate AI narrative');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (analysis) fetchNarrative();
  }, [analysis]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#2C2E39] border border-fuchsia-500/20 rounded-[2rem] p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#FFFDF2] p-2.5 rounded-xl shadow-md">
            <Brain size={18} className="text-fuchsia-600" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base tracking-tight">AI Data Story</h3>
            <p className="text-fuchsia-500/60 text-[9px] font-bold uppercase tracking-[0.2em]">Synthesized via Gemini</p>
          </div>
        </div>
        
        {!isLoading && (
          <button
            onClick={fetchNarrative}
            className="text-gray-500 hover:text-fuchsia-400 transition-all p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      <div className="relative">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-10 justify-center bg-black/10 rounded-xl border border-white/5">
            <Loader2 size={20} className="text-fuchsia-500 animate-spin" />
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Drafting Narrative...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/5 border border-red-500/20 text-red-400/80 px-4 py-3 rounded-xl text-[11px] font-medium flex items-center gap-2">
            <Sparkles size={12} className="opacity-40" />
            {error}
          </div>
        )}

        {narrative && !isLoading && (
          <div className="prose prose-invert max-w-none">
            <div className="bg-black/20 border border-white/5 p-5 rounded-xl">
              {narrative.split('\n').map((paragraph, i) => {
                if (paragraph.trim() === '') return null;
                const formattedText = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-fuchsia-400 font-bold">$1</strong>');
                return (
                  <p key={i} className="text-gray-400 text-[12px] leading-relaxed mb-3 last:mb-0"
                    dangerouslySetInnerHTML={{ __html: formattedText }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}