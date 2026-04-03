'use client';
import StatsOverview from './StatsOverview';
import ColumnBadges from './ColumnBadges';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ScatterChart, Scatter, PieChart, Pie, Legend
} from 'recharts';
import { TrendingUp, AlertTriangle, GitBranch, DollarSign, Package, Star } from 'lucide-react';
import NarrativeCard from './NarrativeCard';

// Fuchsia color palette for charts
const COLORS = ['#D946EF', '#EC4899', '#A855F7', '#8B5CF6', '#F472B6', '#C084FC', '#E879F9', '#F0ABFC'];
const CREAM = '#FFFDF2';

// Custom tooltip style (SafiNia Theme)
const tooltipStyle = {
  backgroundColor: '#1a1b23',
  border: '1px solid rgba(217, 70, 239, 0.2)',
  borderRadius: '10px',
  padding: '10px 14px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
};

// Formatters preserved exactly from your code
const formatNumber = (num) => {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
};

const formatPlain = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div style={tooltipStyle}>
      <p className="text-white font-semibold text-sm mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color || '#D946EF' }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard({ analysis }) {
  if (!analysis) return null;

  const { correlations, anomalies, trends, basic_info, chart_data } = analysis;

  return (
    <motion.div
      id="dashboard-content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
            {/* ===== HEADER ===== */}
      <div className="bg-gradient-to-r from-fuchsia-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">📊 Analysis Complete</h2>
            <p className="text-fuchsia-100 text-sm">
              Powered by scikit-learn & Gemini AI
            </p>
          </div>
        </div>
      </div>

      {/* ===== STATS OVERVIEW ===== */}
      <StatsOverview basicInfo={basic_info} columnTypes={analysis.column_types} />

      {/* ===== COLUMN BADGES ===== */}
      <ColumnBadges columnTypes={analysis.column_types} />
      
      {/* ===== ML INSIGHTS STRIP ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Correlations */}
        <div className="bg-[#2C2E39] border border-white/5 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#FFFDF2] p-1.5 rounded-lg shadow-sm">
              <GitBranch size={16} className="text-fuchsia-600" />
            </div>
            <h3 className="font-bold text-white uppercase tracking-widest text-[10px]">Correlations</h3>
          </div>
          {correlations.pairs.length > 0 ? (
            <div className="space-y-2">
              {correlations.pairs.slice(0, 3).map((pair, i) => (
                <div key={i} className="text-xs text-gray-300 bg-black/20 p-2 rounded-lg border border-white/5">
                  <span className={pair.direction === 'positive' ? 'text-green-400' : 'text-red-400'}>
                    {pair.direction === 'positive' ? '↑' : '↓'}
                  </span>
                  {' '}{pair.col1} ↔ {pair.col2}
                  <span className="text-fuchsia-500/50 ml-1 font-mono">({pair.correlation})</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-xs italic">No strong correlations</p>}
        </div>

        {/* Anomalies */}
        <div className="bg-[#2C2E39] border border-fuchsia-500/30 rounded-xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#FFFDF2] p-1.5 rounded-lg shadow-sm">
              <AlertTriangle size={16} className="text-fuchsia-600" />
            </div>
            <h3 className="font-bold text-white uppercase tracking-widest text-[10px]">Anomalies</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{anomalies.count}</div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{anomalies.percentage}% flagged unusual</p>
        </div>

        {/* Trends */}
        <div className="bg-[#2C2E39] border border-white/5 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#FFFDF2] p-1.5 rounded-lg shadow-sm">
              <TrendingUp size={16} className="text-fuchsia-600" />
            </div>
            <h3 className="font-bold text-white uppercase tracking-widest text-[10px]">Trends</h3>
          </div>
          {trends.length > 0 ? (
            <div className="space-y-2">
              {trends.slice(0, 2).map((trend, i) => (
                <div key={i} className="text-xs text-gray-300 bg-black/20 p-2 rounded-lg border border-white/5">
                  {trend.emoji} {trend.value_column} {trend.direction}
                  <span className="text-fuchsia-500/50 ml-1 font-mono">(R²={trend.r_squared})</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-xs italic">No clear trends</p>}
        </div>
      </div>

      <NarrativeCard />

      {/* ===== CHARTS SECTION ===== */}
      {chart_data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue by Item */}
          {chart_data.revenue_by_item && (
            <ChartCard title={chart_data.revenue_by_item.title} subtitle={chart_data.revenue_by_item.subtitle} fullWidth>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chart_data.revenue_by_item.data} margin={{ bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#4b5563" tick={{ fontSize: 10, fill: '#D946EF', fontWeight: 600 }} angle={-35} textAnchor="end" height={70} />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 10,fill: '#D946EF' }} tickFormatter={formatNumber} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload) return null;
                    const data = payload[0]?.payload;
                    return (
                      <div style={tooltipStyle}>
                        <p className="text-white font-bold text-sm mb-2">{label}</p>
                        <p className="text-fuchsia-400 text-xs">💰 Revenue: ${data?.revenue?.toLocaleString()}</p>
                        <p className="text-pink-400 text-xs">🏷️ Avg Price: ${data?.price?.toLocaleString()}</p>
                        <p className="text-purple-400 text-xs">📦 Units: {data?.quantity?.toLocaleString()}</p>
                      </div>
                    );
                  }} />
                  <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                    {chart_data.revenue_by_item.data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Units Sold by Item */}
          {chart_data.units_by_item && (
            <ChartCard title={chart_data.units_by_item.title}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chart_data.units_by_item.data} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" stroke="#4b5563" tick={{ fontSize: 10,fill: '#D946EF' }} />
                  <YAxis dataKey="name" type="category" stroke="#4b5563" tick={{ fontSize: 10, fill: '#D946EF', fontWeight: 600 }} width={80} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload) return null;
                    return (
                      <div style={tooltipStyle}>
                        <p className="text-white font-bold text-xs mb-1">{label}</p>
                        <p className="text-fuchsia-400 text-sm font-bold">📦 Units Sold: {payload[0]?.value?.toLocaleString()}</p>
                      </div>
                    );
                  }} />
                  <Bar dataKey="value" name="Units" radius={[0, 6, 6, 0]}>
                    {chart_data.units_by_item.data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Category Breakdown */}
          {chart_data.category_breakdown && (
            <ChartCard title={chart_data.category_breakdown.title}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chart_data.category_breakdown.data}>
                  <XAxis dataKey="name" stroke="#4b5563" tick={{ fontSize: 11, fill: '#D946EF', fontWeight: 600 }} />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 10 ,fill: '#D946EF' }} tickFormatter={formatNumber} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload) return null;
                    const data = payload[0]?.payload;
                    return (
                      <div style={tooltipStyle}>
                        <p className="text-white font-bold text-xs uppercase mb-2">{label}</p>
                        <p className="text-fuchsia-400 text-sm font-bold">💰 Revenue: ${data?.revenue?.toLocaleString()}</p>
                        <p className="text-purple-400 text-xs">📦 Total Units: {data?.totalUnits?.toLocaleString()}</p>
                      </div>
                    );
                  }} />
                  <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                    {chart_data.category_breakdown.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Time Series */}
          {chart_data && Object.entries(chart_data)
            .filter(([_, val]) => val.type === 'timeseries')
            .slice(0, 2)
            .map(([key, chartInfo]) => (
              <ChartCard key={key} title={chartInfo.title} fullWidth>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartInfo.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="date" stroke="#4b5563" tick={{ fontSize: 10, fill: '#D946EF', fontWeight: 600 }} />
                    <YAxis stroke="#4b5563" tick={{ fontSize: 10,fill: '#D946EF'  }} />
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0]?.payload;
                      return (
                        <div style={tooltipStyle}>
                          <p className="text-gray-500 text-[10px] font-bold mb-1">{data?.fullDate}</p>
                          <p className="text-fuchsia-400 font-bold text-sm">{chartInfo.y_label}: {data?.value?.toLocaleString()}</p>
                        </div>
                      );
                    }} />
                    <Line type="monotone" dataKey="value" stroke="#D946EF" strokeWidth={3} dot={{ r: 4, fill: '#FFFDF2', stroke: '#D946EF', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            ))}

          {/* Scatter Plot */}
          {chart_data.scatter && (
            <ChartCard title={chart_data.scatter.title}>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart margin={{ bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                  <XAxis dataKey="x" name={chart_data.scatter.x_label} stroke="#4b5563" tick={{ fontSize: 10, fill: '#D946EF', fontWeight: 600 }} />
                  <YAxis dataKey="y" name={chart_data.scatter.y_label} stroke="#4b5563" tick={{ fontSize: 10,fill: '#D946EF'  }} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0]?.payload;
                    return (
                      <div style={tooltipStyle}>
                        {data?.name && <p className="text-white font-bold text-xs mb-2 uppercase">{data.name}</p>}
                        <p className="text-fuchsia-400 text-xs">{chart_data.scatter.x_label}: {data?.x?.toLocaleString()}</p>
                        <p className="text-pink-400 text-xs">{chart_data.scatter.y_label}: {data?.y?.toLocaleString()}</p>
                      </div>
                    );
                  }} />
                  <Scatter data={chart_data.scatter.data}>
                    {chart_data.scatter.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Distribution Histogram */}
          {chart_data && Object.entries(chart_data)
            .filter(([_, val]) => val.type === 'distribution')
            .slice(0, 2)
            .map(([key, chartInfo]) => (
              <ChartCard key={key} title={chartInfo.title} subtitle={`Mean: ${chartInfo.stats?.mean} | Median: ${chartInfo.stats?.median}`}>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartInfo.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="range" stroke="#4b5563" tick={{ fontSize: 9, fill: '#D946EF', fontWeight: 600 }} angle={-20} textAnchor="end" />
                    <YAxis stroke="#4b5563" tick={{ fontSize: 10 ,fill: '#D946EF' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                      {chartInfo.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            ))}

          {/* Rating Distribution */}
          {chart_data.rating_distribution && (
            <ChartCard title={chart_data.rating_distribution.title} subtitle={`Avg Rating: ⭐ ${chart_data.rating_distribution.avg_rating}`}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chart_data.rating_distribution.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="rating" stroke="#4b5563" tick={{ fontSize: 11, fill: '#D946EF', fontWeight: 600 }} />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 10 ,fill: '#D946EF' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Count" radius={[6, 6, 0, 0]}>
                    {chart_data.rating_distribution.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

        </div>
      )}

      {/* ===== NUMERICAL SUMMARY TABLE ===== */}
      {chart_data?.summary_table && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
            📋 Numerical Summary
          </h3>
          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-700">
                    Column
                  </th>
                  <th className="text-center py-3 px-4 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-700">
                    Min
                  </th>
                  <th className="text-center py-3 px-4 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-700">
                    Max
                  </th>
                  <th className="text-center py-3 px-4 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-700">
                    Mean
                  </th>
                  <th className="text-center py-3 px-4 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-700">
                    Median
                  </th>
                  <th className="text-center py-3 px-4 text-fuchsia-400 text-xs font-bold uppercase tracking-wider border-b border-gray-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {chart_data.summary_table.data.map((row, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 text-white font-bold text-sm uppercase">
                      {row.column}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm text-center font-mono">
                      {row.min.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm text-center font-mono">
                      {row.max.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm text-center font-mono">
                      {row.mean.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm text-center font-mono">
                      {row.median.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-fuchsia-400 font-bold text-sm text-center font-mono">
                      {row.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== DETECTED ANOMALIES TABLE ===== */}
      {anomalies.rows.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
            ⚠️ Detected Anomalies
            <span className="text-xs bg-fuchsia-500/10 text-fuchsia-400 px-2 py-0.5 rounded-full border border-fuchsia-500/20 normal-case tracking-normal">
              {anomalies.count} found
            </span>
          </h3>

          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="text-left py-3 px-4 text-fuchsia-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-700">
                    Row
                  </th>
                  {Object.keys(anomalies.rows[0].data).slice(0, 7).map((key, i) => (
                    <th 
                      key={i} 
                      className="text-center py-3 px-4 text-fuchsia-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-700"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {anomalies.rows.map((row, i) => (
                  <tr 
                    key={i} 
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="text-fuchsia-400/70 font-mono font-bold text-sm">
                        #{row.row_index}
                      </span>
                    </td>
                    {Object.values(row.data).slice(0, 7).map((val, j) => (
                      <td 
                        key={j} 
                        className="py-3 px-4 text-gray-300 text-sm text-center"
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-gray-600 text-xs mt-4">
            Detected by Isolation Forest ML model · Showing {anomalies.rows.length} of {anomalies.count} anomalies
          </p>
        </div>
      )}

    </motion.div>
  );
}


// ─── REUSABLE CHART CARD WRAPPER ───
function ChartCard({ title, subtitle, icon, fullWidth, children }) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl p-5 
                    hover:border-gray-700 transition-colors
                    ${fullWidth ? 'lg:col-span-2' : ''}`}>
      <div className="mb-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          {icon && <span className="text-fuchsia-400">{icon}</span>}
          {title}
        </h3>
        {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}