'use client';

import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ScatterChart, Scatter, PieChart, Pie, Legend
} from 'recharts';
import { TrendingUp, AlertTriangle, GitBranch, DollarSign, Package, Star } from 'lucide-react';
import NarrativeCard from './narrativecard';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-6xl mx-auto pb-12"
    >
      {/* ===== HEADER ===== */}
      <div className="bg-[#2C2E39] border border-fuchsia-500/20 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-4">📊 Analysis Complete</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-2">
            <p className="text-fuchsia-100/50 text-[10px] font-bold uppercase tracking-wider">Rows</p>
            <p className="text-xl font-bold">{basic_info.total_rows.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-2">
            <p className="text-fuchsia-100/50 text-[10px] font-bold uppercase tracking-wider">Columns</p>
            <p className="text-xl font-bold">{basic_info.total_columns}</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-2">
            <p className="text-fuchsia-100/50 text-[10px] font-bold uppercase tracking-wider">Missing</p>
            <p className="text-xl font-bold">{basic_info.missing_percentage}%</p>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-2">
            <p className="text-fuchsia-100/50 text-[10px] font-bold uppercase tracking-wider">Duplicates</p>
            <p className="text-xl font-bold">{basic_info.duplicate_rows}</p>
          </div>
        </div>
      </div>

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
                  <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} tickFormatter={formatNumber} />
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
                  <XAxis type="number" stroke="#4b5563" tick={{ fontSize: 10 }} />
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
                  <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} tickFormatter={formatNumber} />
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
                    <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} />
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
                  <YAxis dataKey="y" name={chart_data.scatter.y_label} stroke="#4b5563" tick={{ fontSize: 10 }} />
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
                    <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} />
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
                  <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} />
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

      {/* ===== SUMMARY TABLE ===== */}
      {chart_data?.summary_table && (
        <div className="bg-[#2C2E39] border border-white/5 rounded-[2rem] p-6 shadow-xl">
          <h3 className="text-white font-bold uppercase tracking-widest text-[10px] mb-6">Numerical Summary</h3>
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/10">
            <table className="w-full text-sm border-collapse text-center">
              <thead>
                <tr className="bg-white/5">
                  <th className="py-3 px-4 text-gray-500 font-bold text-[9px] uppercase tracking-widest border-b border-white/5 text-left">Column</th>
                  <th className="py-3 px-4 text-gray-500 font-bold text-[9px] uppercase tracking-widest border-b border-white/5">Min</th>
                  <th className="py-3 px-4 text-gray-500 font-bold text-[9px] uppercase tracking-widest border-b border-white/5">Max</th>
                  <th className="py-3 px-4 text-fuchsia-400 font-bold text-[9px] uppercase tracking-widest border-b border-white/5">Total</th>
                </tr>
              </thead>
              <tbody>
                {chart_data.summary_table.data.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-fuchsia-500/5 transition-colors group">
                    <td className="py-3 px-4 text-white font-bold text-xs uppercase text-left">{row.column}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs font-mono">{row.min.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs font-mono">{row.max.toLocaleString()}</td>
                    <td className="py-3 px-4 text-fuchsia-400 font-bold text-xs font-mono">{row.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== ANOMALY TABLE ===== */}
      {anomalies.rows.length > 0 && (
        <div className="bg-[#2C2E39] border border-white/5 rounded-[2rem] p-6 shadow-xl">
          <h3 className="text-white font-bold uppercase tracking-widest text-[10px] mb-6">Detected Anomalies</h3>
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/10">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="py-3 px-4 text-gray-500 font-bold text-[9px] uppercase tracking-widest border-b border-white/5">Row</th>
                  {Object.keys(anomalies.rows[0].data).slice(0, 6).map((key, i) => (
                    <th key={i} className="py-3 px-4 text-fuchsia-400 font-bold text-[9px] uppercase tracking-widest border-b border-white/5">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {anomalies.rows.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-fuchsia-500/5 transition-colors group">
                    <td className="py-3 px-4 text-gray-600 font-mono text-[9px]">#{row.row_index}</td>
                    {Object.values(row.data).slice(0, 6).map((val, j) => (
                      <td key={j} className="py-3 px-4 text-gray-400 text-[11px] group-hover:text-white transition-colors">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── REUSABLE CHART CARD WRAPPER ───
function ChartCard({ title, subtitle, fullWidth, children }) {
  return (
    <div className={`bg-[#2C2E39] border border-white/5 rounded-[2rem] p-6 shadow-xl ${fullWidth ? 'lg:col-span-2' : ''}`}>
      <div className="mb-6">
        <h3 className="text-white font-bold uppercase tracking-widest text-[10px]">{title}</h3>
        {/* SUBTITLE: Now using CREAM color for Mean/Avg visibility */}
        {subtitle && (
          <p className="text-[#FFFDF2] text-[9px] font-black uppercase tracking-widest mt-1 opacity-90">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}