'use client';

import { FileSpreadsheet, X, Rows3, Columns3, HardDrive, Rocket } from 'lucide-react';

export default function FilePreview({ preview, onRemove, onAnalyze }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      
      {/* ===== FILE INFO HEADER ===== */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex justify-between items-start">
          
          <div className="flex items-center gap-4">
            <div className="bg-green-500/10 p-3 rounded-xl">
              <FileSpreadsheet size={24} className="text-green-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">
                {preview.fileName}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1 text-gray-400 text-sm">
                  <HardDrive size={14} />
                  {preview.fileSize}
                </span>
                <span className="flex items-center gap-1 text-gray-400 text-sm">
                  <Rows3 size={14} />
                  {preview.totalRows.toLocaleString()} rows
                </span>
                <span className="flex items-center gap-1 text-gray-400 text-sm">
                  <Columns3 size={14} />
                  {preview.totalColumns} columns
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onRemove}
            className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 
                       transition-all p-2 rounded-lg"
            title="Remove file"
          >
            <X size={18} />
          </button>

        </div>
      </div>

      {/* ===== DATA PREVIEW TABLE ===== */}
      <div className="p-6">
        <p className="text-gray-400 text-sm mb-3 font-medium">
          📋 Data Preview 
          <span className="text-gray-600">
            {' '}(showing first {Math.min(5, preview.sampleRows.length)} of {preview.totalRows.toLocaleString()} rows)
          </span>
        </p>
        
        <div className="overflow-x-auto table-container rounded-lg border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="px-3 py-2.5 text-left text-gray-500 font-medium text-xs border-b border-gray-800">
                  #
                </th>
                {preview.headers.map((header, i) => (
                  <th
                    key={i}
                    className="px-3 py-2.5 text-left text-blue-400 
                               font-semibold text-xs border-b border-gray-800
                               whitespace-nowrap"
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
                  className="hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-3 py-2 text-gray-600 border-b border-gray-800/50 text-xs">
                    {i + 1}
                  </td>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-3 py-2 text-gray-300 border-b 
                                 border-gray-800/50 whitespace-nowrap max-w-48 truncate"
                    >
                      {cell || <span className="text-gray-600 italic">empty</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ANALYZE BUTTON ===== */}
      <div className="p-6 pt-0">
        <button
          onClick={onAnalyze}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 
                     hover:from-blue-500 hover:to-cyan-500 
                     text-white font-semibold py-3.5 px-6 
                     rounded-xl transition-all duration-200
                     hover:shadow-lg hover:shadow-blue-500/25
                     active:scale-[0.98]
                     flex items-center justify-center gap-2"
        >
          <Rocket size={18} />
          Analyze This Data
        </button>
        <p className="text-center text-gray-600 text-xs mt-2">
          AI will analyze your data and generate insights automatically
        </p>
      </div>

    </div>
  );
}