'use client';

import { FileSpreadsheet, X, Rows3, Columns3, HardDrive, Rocket, Eye } from 'lucide-react';

export default function FilePreview({ preview, onRemove, onAnalyze }) {
  return (
    /* THE MAIN CARD: Switched to #2C2E39 and added subtle Fuchsia border */
    <div className="bg-[#2C2E39] border border-fuchsia-500/30 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-fuchsia-500/10">
      
      {/* ===== FILE INFO HEADER ===== */}
      <div className="p-8 border-b border-white/5 bg-black/10">
        <div className="flex justify-between items-start">
          
          <div className="flex items-center gap-5">
            {/* Signature Cream Icon Box with Fuchsia Icon */}
            <div className="bg-[#FFFDF2] p-4 rounded-2xl shadow-lg transition-transform hover:rotate-3">
              <FileSpreadsheet size={28} className="text-fuchsia-600" />
            </div>
            
            <div>
              <p className="text-white font-bold text-xl tracking-tight">
                {preview.fileName}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <HardDrive size={14} className="text-fuchsia-500" />
                  {preview.fileSize}
                </span>
                <span className="h-1 w-1 rounded-full bg-fuchsia-500/40"></span>
                <span className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <Rows3 size={14} className="text-fuchsia-500" />
                  {preview.totalRows.toLocaleString()} rows
                </span>
                <span className="h-1 w-1 rounded-full bg-fuchsia-500/40"></span>
                <span className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <Columns3 size={14} className="text-fuchsia-500" />
                  {preview.totalColumns} columns
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onRemove}
            className="text-gray-500 hover:text-white hover:bg-white/5 
                       transition-all p-3 rounded-xl border border-white/5"
            title="Remove file"
          >
            <X size={20} />
          </button>

        </div>
      </div>

      {/* ===== DATA PREVIEW TABLE ===== */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-5">
            <p className="text-fuchsia-400 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Eye size={16} />
              Data Snapshot
            </p>
            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
              First {Math.min(5, preview.sampleRows.length)} Records
            </span>
          </div>
          
          {/* Removed 'min-w' constraints to prevent forced horizontal scrolling */}
          <div className="overflow-x-hidden rounded-2xl border border-white/5 bg-black/20">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-white/5">
                  {/* Index column centered */}
                  <th className="px-2 py-4 text-center text-gray-500 font-bold text-[10px] uppercase tracking-widest border-b border-white/5 w-10">
                    #
                  </th>
                  {preview.headers.map((header, i) => (
                    <th
                      key={i}
                      /* CHANGED: text-center, reduced font size, and tighter padding */
                      className="px-2 py-4 text-center text-fuchsia-400 
                                font-black text-[10px] uppercase tracking-wider border-b border-white/5
                                whitespace-normal leading-tight"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.sampleRows.map((row, i) => (
                  <tr 
                    key={i} 
                    className="hover:bg-fuchsia-500/5 transition-colors group"
                  >
                    {/* Row Number centered */}
                    <td className="px-2 py-3 text-center text-gray-600 border-b border-white/5 text-[9px] font-mono">
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        /* CHANGED: text-center, text-xs (smaller), and px-2 (tighter) */
                        className="px-2 py-3 text-center text-gray-300 border-b 
                                  border-white/5 text-[11px] leading-relaxed
                                  group-hover:text-white transition-colors"
                      >
                        {cell || <span className="text-white/5 italic text-[9px]">null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      {/* ===== ANALYZE BUTTON ===== */}
      <div className="p-8 pt-0">
        <button
          onClick={onAnalyze}
          className="w-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 
                     hover:from-fuchsia-500 hover:to-pink-500
                     text-white font-black py-5 px-6 
                     rounded-2xl transition-all duration-300
                     shadow-[0_0_30px_-10px_rgba(217,70,239,0.4)]
                     hover:shadow-[0_0_40px_-5px_rgba(217,70,239,0.5)]
                     active:scale-[0.98]
                     flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
        >
          <Rocket size={20} className="animate-pulse" />
          Analyze This Data
        </button>
        <p className="text-center text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-4">
          AI will analyze patterns & generate insights automatically
        </p>
      </div>

    </div>
  );
}