'use client';

import { motion } from 'framer-motion';
import { Hash, Tag, Calendar, FileText } from 'lucide-react';

const typeConfig = {
  numerical: { icon: <Hash size={12} />, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30' },
  numeric: { icon: <Hash size={12} />, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30' },
  categorical: { icon: <Tag size={12} />, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  datetime: { icon: <Calendar size={12} />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  text: { icon: <FileText size={12} />, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
  empty: { icon: <FileText size={12} />, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

export default function ColumnBadges({ columnTypes = {} }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-white font-semibold text-sm mb-3">🏷️ Detected Column Types</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(columnTypes || {}).map(([colName, colType], i) => {
          const config = typeConfig[colType] || typeConfig.text;
          return (
            <motion.div
              key={colName}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                         text-xs font-medium border
                         ${config.bg} ${config.border} ${config.color}`}
            >
              {config.icon}
              <span className="text-gray-300">{colName}</span>
              <span className={`${config.color} text-[10px]`}>({colType})</span>
            </motion.div>
          );
        })}
      </div>
      
      <div className="flex gap-4 mt-3 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><Hash size={10} className="text-fuchsia-400" /> Numerical</span>
        <span className="flex items-center gap-1"><Tag size={10} className="text-pink-400" /> Categorical</span>
        <span className="flex items-center gap-1"><Calendar size={10} className="text-purple-400" /> Datetime</span>
      </div>
    </div>
  );
}