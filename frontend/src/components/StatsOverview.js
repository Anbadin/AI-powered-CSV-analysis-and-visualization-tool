'use client';

import { motion } from 'framer-motion';
import { Database, Columns3, AlertCircle, Copy, Clock } from 'lucide-react';

export default function StatsOverview({ basicInfo, columnTypes }) {
  const numNumerical = Object.values(columnTypes).filter(t => t === 'numerical').length;
  const numCategorical = Object.values(columnTypes).filter(t => t === 'categorical').length;
  const numDatetime = Object.values(columnTypes).filter(t => t === 'datetime').length;

  const stats = [
    {
      label: 'Total Rows',
      value: basicInfo.total_rows.toLocaleString(),
      icon: <Database size={16} />,
      color: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500/10',
    },
    {
      label: 'Columns',
      value: `${numNumerical}N · ${numCategorical}C · ${numDatetime}D`,
      icon: <Columns3 size={16} />,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      tooltip: `${numNumerical} Numerical, ${numCategorical} Categorical, ${numDatetime} Datetime`,
    },
    {
      label: 'Missing',
      value: `${basicInfo.missing_percentage}%`,
      icon: <AlertCircle size={16} />,
      color: basicInfo.missing_percentage > 5 ? 'text-red-400' : 'text-green-400',
      bg: basicInfo.missing_percentage > 5 ? 'bg-red-500/10' : 'bg-green-500/10',
    },
    {
      label: 'Duplicates',
      value: basicInfo.duplicate_rows.toLocaleString(),
      icon: <Copy size={16} />,
      color: basicInfo.duplicate_rows > 0 ? 'text-yellow-400' : 'text-green-400',
      bg: basicInfo.duplicate_rows > 0 ? 'bg-yellow-500/10' : 'bg-green-500/10',
    },
    {
      label: 'Memory',
      value: basicInfo.memory_usage,
      icon: <Clock size={16} />,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center
                     hover:border-gray-700 transition-colors"
          title={stat.tooltip || ''}
        >
          <div className={`inline-flex p-1.5 rounded-lg ${stat.bg} mb-2`}>
            <span className={stat.color}>{stat.icon}</span>
          </div>
          <p className="text-white font-bold text-lg">{stat.value}</p>
          <p className="text-gray-500 text-[10px] uppercase tracking-wider">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}