import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Compass, 
  MapPin, 
  ArrowUpRight,
  RefreshCw,
  BarChart3,
  PieChart as PieIcon,
  Map as MapIcon,
  Search,
  ChevronRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { dashboardAPI } from '../api/client';
import IndiaMap from '../components/IndiaMap';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stateViewMode, setStateViewMode] = useState('map');
  const [timeFilter, setTimeFilter] = useState('Month');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (err) {
      setError('Unable to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const RISK_COLORS = {
    'Low': '#10b981',
    'Medium': '#f59e0b',
    'High': '#f43f5e',
    'Low Risk': '#10b981',
    'Medium Risk': '#f59e0b',
    'High Risk': '#f43f5e'
  };

  const trendData = stats?.recent_predictions
    ? [...stats.recent_predictions]
        .reverse()
        .map((p, idx) => ({
          name: `${p.district} ('${String(p.forecast_year).slice(-2)})`,
          district: p.district,
          year: p.forecast_year,
          burden: p.predicted_total,
          risk: p.risk_level,
          idx: idx + 1
        }))
    : [];

  const totalCalculated = (stats?.high_risk || 0) + (stats?.medium_risk || 0) + (stats?.low_risk || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
      {/* Top Bar: Overview Header + Search + Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Overview
            </h1>
          </div>
          <p className="text-[13px] text-slate-500 mt-0.5">
            District cybercrime volume forecasts, risk classification, and spatial trends.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div 
            onClick={() => navigate('/history')}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-blue-400 transition-colors text-[13px] text-slate-400 min-w-[200px]"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search records...</span>
          </div>

          <button
            onClick={fetchStats}
            title="Refresh statistics"
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          
          <button
            onClick={() => navigate('/predict')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] shadow-md shadow-blue-500/20 transition-all transform active:scale-98"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>New Prediction</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Predictions */}
        <div className="satark-card-interactive p-4 sm:p-5 bg-white relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                Total Evaluations
              </span>
            </div>
            <div className="flex items-end gap-0.5 h-3.5 opacity-70">
              <span className="w-1 bg-blue-200 h-2 rounded-xs" />
              <span className="w-1 bg-blue-300 h-3 rounded-xs" />
              <span className="w-1 bg-blue-400 h-1.5 rounded-xs" />
              <span className="w-1 bg-blue-600 h-3.5 rounded-xs" />
            </div>
          </div>

          <div className="mt-3.5 flex items-baseline justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {loading ? '...' : stats?.total_predictions || 0}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
                <span>↑ Model Synced</span>
                <span className="text-slate-400 font-normal">• 31 features</span>
              </div>
            </div>
          </div>
        </div>

        {/* High Risk Tier */}
        <div className="satark-card-interactive p-4 sm:p-5 bg-white relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-rose-50 text-rose-600">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                High Risk Tier
              </span>
            </div>
            <div className="flex items-end gap-0.5 h-3.5 opacity-70">
              <span className="w-1 bg-rose-200 h-1 rounded-xs" />
              <span className="w-1 bg-rose-300 h-2 rounded-xs" />
              <span className="w-1 bg-rose-500 h-3.5 rounded-xs" />
            </div>
          </div>

          <div className="mt-3.5 flex items-baseline justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight font-sans">
                {loading ? '...' : stats?.high_risk || 0}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 mt-0.5">
                <span>Burden &gt; 33.0</span>
                <span className="text-slate-400 font-normal">• High threat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Medium Risk Tier */}
        <div className="satark-card-interactive p-4 sm:p-5 bg-white relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                Medium Risk Tier
              </span>
            </div>
            <div className="flex items-end gap-0.5 h-3.5 opacity-70">
              <span className="w-1 bg-amber-200 h-2 rounded-xs" />
              <span className="w-1 bg-amber-400 h-3.5 rounded-xs" />
              <span className="w-1 bg-amber-500 h-2 rounded-xs" />
            </div>
          </div>

          <div className="mt-3.5 flex items-baseline justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight font-sans">
                {loading ? '...' : stats?.medium_risk || 0}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 mt-0.5">
                <span>Burden 10 – 33</span>
                <span className="text-slate-400 font-normal">• Moderate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Low Risk Tier */}
        <div className="satark-card-interactive p-4 sm:p-5 bg-white relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                Low Risk Tier
              </span>
            </div>
            <div className="flex items-end gap-0.5 h-3.5 opacity-70">
              <span className="w-1 bg-emerald-200 h-1.5 rounded-xs" />
              <span className="w-1 bg-emerald-400 h-3.5 rounded-xs" />
              <span className="w-1 bg-emerald-300 h-2 rounded-xs" />
            </div>
          </div>

          <div className="mt-3.5 flex items-baseline justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight font-sans">
                {loading ? '...' : stats?.low_risk || 0}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
                <span>Burden &lt; 10.0</span>
                <span className="text-slate-400 font-normal">• Baseline</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Chart 1: Forecasted Cybercrime Burden Trend */}
        <div className="satark-card p-5 sm:p-6 lg:col-span-2 bg-white flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Forecast Trajectory
              </span>
              <h2 className="text-base font-extrabold text-slate-900 mt-0.5 flex items-baseline gap-2">
                <span>Recent District Predictions</span>
                {trendData.length > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Active Pipeline
                  </span>
                )}
              </h2>
            </div>

            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 self-start sm:self-auto">
              {['Recent', 'District', 'Summary'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTimeFilter(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    timeFilter === tab
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="h-60 sm:h-68 w-full flex items-center justify-center">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="satarkBlueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                      borderColor: '#e2e8f0', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      boxShadow: '0 10px 25px -4px rgba(0,0,0,0.1)',
                      padding: '8px 12px'
                    }}
                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    labelStyle={{ color: '#64748b', fontWeight: '600', marginBottom: '3px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="burden"
                    name="Offence Volume"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#satarkBlueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs py-10">
                <TrendingUp className="w-7 h-7 mx-auto text-slate-300 mb-2" />
                <span>Perform evaluations to view projection trajectories.</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Threat Classification Donut */}
        <div className="satark-card p-5 sm:p-6 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Risk Distribution
              </span>
              <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                Threat Classification
              </h2>
            </div>
            <div className="p-1.5 rounded-xl bg-slate-50 text-slate-500">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="h-48 relative flex items-center justify-center">
            {stats && stats.total_predictions > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.risk_distribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={4}
                    >
                      {stats.risk_distribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color || RISK_COLORS[entry.name] || '#2563eb'} 
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderColor: '#e2e8f0', 
                        borderRadius: '10px', 
                        fontSize: '11px', 
                        boxShadow: '0 8px 20px -4px rgba(0,0,0,0.08)' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-extrabold text-slate-900 font-sans">
                    {stats.total_predictions}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Districts
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 text-xs py-7">
                No prediction data logged yet.
              </div>
            )}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            {stats?.risk_distribution ? (
              stats.risk_distribution.map((item, idx) => {
                const total = totalCalculated || 1;
                const pct = Math.round((item.value / total) * 100);
                return (
                  <div key={idx} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: item.color || RISK_COLORS[item.name] || '#2563eb' }}
                      />
                      <span className="text-slate-700 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">{pct}%</span>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-xs text-slate-400">Loading breakdown...</div>
            )}
          </div>
        </div>
      </div>

      {/* Spatial Distribution (India Map / Bar Chart) & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* State-Level Distribution (2 Columns) */}
        <div className="satark-card p-5 sm:p-6 lg:col-span-2 bg-white flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Geographic Analytics
              </span>
              <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                State-Level Distribution
              </h2>
            </div>

            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setStateViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  stateViewMode === 'map'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map Chart</span>
              </button>
              <button
                onClick={() => setStateViewMode('bar')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  stateViewMode === 'bar'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Bar Chart</span>
              </button>
            </div>
          </div>

          <div className="min-h-[320px] flex items-center justify-center">
            {stateViewMode === 'map' ? (
              <IndiaMap
                stateBreakdown={stats?.state_breakdown || []}
                onSelectState={(stateName) => navigate(`/predict`)}
              />
            ) : (
              stats?.state_breakdown && stats.state_breakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.state_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="state" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderColor: '#e2e8f0', 
                        borderRadius: '10px', 
                        fontSize: '11px', 
                        boxShadow: '0 8px 20px -4px rgba(0,0,0,0.08)' 
                      }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="avg_burden" name="Avg Predicted Burden" fill="#2563eb" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="predictions_count" name="Evaluations Count" fill="#94a3b8" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-400 text-xs py-10">
                  Comparative statistics will appear after evaluating multiple districts.
                </div>
              )
            )}
          </div>
        </div>

        {/* Recent Forecasts Card */}
        <div className="satark-card p-5 sm:p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Audit Feed
                </span>
                <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Recent Activity
                </h2>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {stats?.recent_predictions && stats.recent_predictions.length > 0 ? (
                stats.recent_predictions.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-[13px] font-bold text-slate-900">
                          {item.district}, {item.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span>Forecast: {item.forecast_year}</span>
                        <span>•</span>
                        <span className="font-mono font-semibold text-slate-800">{item.predicted_total} cases</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                        item.risk_level === 'High'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : item.risk_level === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {item.risk_level}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 text-xs py-8">
                  No recent activity logged.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => navigate('/predict')}
              className="w-full py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Evaluate New District</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
