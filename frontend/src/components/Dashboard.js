'use client';

import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, AlertTriangle, GitBranch, Info } from 'lucide-react';

export default function Dashboard({ analysis }) {
  if (!analysis) return null;

  const { correlations, anomalies, trends, basic_info, column_stats } = analysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* ===== HEADER ===== */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">📊 Analysis Complete</h2>
        <p className="text-blue-100">
          Analyzed {basic_info.total_rows} rows × {basic_info.total_columns} columns
        </p>
      </div>

      {/* ===== ML INSIGHTS GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Correlations Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch size={20} className="text-purple-400" />
            <h3 className="font-semibold text-white">Correlations</h3>
          </div>
          {correlations.pairs.length > 0 ? (
            <div className="space-y-2">
              {correlations.pairs.slice(0, 3).map((pair, i) => (
                <div key={i} className="text-sm text-gray-300 bg-gray-800/50 p-2 rounded-lg">
                  <span className={pair.direction === 'positive' ? 'text-green-400' : 'text-red-400'}>
                    {pair.direction === 'positive' ? '↑' : '↓'}
                  </span>
                  {' '}{pair.col1} ↔ {pair.col2}
                  <span className="text-gray-500 ml-1">({pair.correlation})</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No strong correlations found</p>
          )}
        </div>

        {/* Anomalies Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} className="text-yellow-400" />
            <h3 className="font-semibold text-white">Anomalies</h3>
          </div>
          <div className="text-3xl font-bold text-yellow-400 mb-1">
            {anomalies.count}
          </div>
          <p className="text-gray-400 text-sm">
            {anomalies.percentage}% of data flagged as unusual
          </p>
          {anomalies.rows.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              First anomaly at row #{anomalies.rows[0].row_index}
            </p>
          )}
        </div>

        {/* Trends Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} className="text-green-400" />
            <h3 className="font-semibold text-white">Trends</h3>
          </div>
          {trends.length > 0 ? (
            <div className="space-y-2">
              {trends.slice(0, 2).map((trend, i) => (
                <div key={i} className="text-sm text-gray-300 bg-gray-800/50 p-2 rounded-lg">
                  <span className="mr-1">{trend.emoji}</span>
                  {trend.value_column} {trend.direction}
                  <span className="text-gray-500 ml-1">(R²={trend.r_squared})</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No clear time trends detected</p>
          )}
        </div>
      </div>

      {/* ===== CHARTS SECTION ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend Line Chart */}
        {trends.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 lg:col-span-2">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              📈 Trend Visualization
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prepareTrendData(trends[0], column_stats)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" tick={{fontSize: 12}} />
                  <YAxis stroke="#9CA3AF" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#1F2937', border: 'none', borderRadius: '8px'}}
                    labelStyle={{color: '#F3F4F6'}}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{r: 4, fill: '#3B82F6'}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {trends[0].insight}
            </p>
          </div>
        )}

        {/* Column Distribution Bar Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">📊 Data Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prepareDistributionData(column_stats)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{fontSize: 11}} />
                <YAxis stroke="#9CA3AF" tick={{fontSize: 11}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#1F2937', border: 'none', borderRadius: '8px'}}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                  {prepareDistributionData(column_stats).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8B5CF6' : '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Correlation Scatter */}
        {correlations.pairs.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">🔗 Correlation View</h3>
            <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
              <div className="text-center">
                <GitBranch size={32} className="mx-auto mb-2 text-purple-400" />
                <p>Strongest pair:</p>
                <p className="text-white font-medium mt-1">
                  {correlations.pairs[0].col1} ↔ {correlations.pairs[0].col2}
                </p>
                <p className="text-gray-400 mt-1">
                  r = {correlations.pairs[0].correlation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== ANOMALY TABLE ===== */}
      {anomalies.rows.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            ⚠️ Detected Anomalies
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 px-3 text-gray-400">Row</th>
                  {Object.keys(anomalies.rows[0].data).slice(0, 5).map((key, i) => (
                    <th key={i} className="text-left py-2 px-3 text-gray-400">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {anomalies.rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-3 text-yellow-400 font-medium">#{row.row_index}</td>
                    {Object.values(row.data).slice(0, 5).map((val, j) => (
                      <td key={j} className="py-2 px-3 text-gray-300">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-500 text-xs mt-3">
            Showing {anomalies.rows.length} of {anomalies.count} anomalies
          </p>
        </div>
      )}
    </motion.div>
  );
}

// Helper: Prepare trend data for chart
function prepareTrendData(trend, column_stats) {
  // Simplified: Just show a visual representation
  // In production, you'd pass actual time-series data
  return [
    { date: 'Start', value: 100 },
    { date: 'Mid', value: trend.direction === 'upward' ? 150 : 50 },
    { date: 'End', value: trend.direction === 'upward' ? 200 : 20 },
  ];
}

// Helper: Prepare distribution data
function prepareDistributionData(column_stats) {
  return Object.entries(column_stats).slice(0, 6).map(([name, stats]) => ({
    name: name.length > 10 ? name.substring(0, 10) + '...' : name,
    count: stats.unique_count || 0,
  }));
}