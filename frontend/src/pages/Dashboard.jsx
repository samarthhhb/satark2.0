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
  Map as MapIcon
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
  const [stateViewMode, setStateViewMode] = useState('map'); // 'map' or 'bar'

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
          name: `${p.district} (${p.forecast_year})`,
          year: p.forecast_year,
          burden: p.predicted_total,
          risk: p.risk_level,
          idx: idx + 1
        }))
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Cybercrime Analytics Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            District crime volume forecasts and risk evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStats}
            title="Refresh statistics"
            className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-900' : ''}`} />
          </button>
          
          <button
            onClick={() => navigate('/predict')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-sm transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>New Prediction</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Predictions */}
        <div className="clean-card rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Predictions</span>
            <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {loading ? '...' : stats?.total_predictions || 0}
            </span>
            <span className="text-xs text-slate-400">runs</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Logged evaluations</p>
        </div>

        {/* High Risk */}
        <div className="clean-card rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">High Risk</span>
            <div className="p-1.5 rounded-md bg-rose-50 text-rose-600">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-rose-600 tracking-tight">
              {loading ? '...' : stats?.high_risk || 0}
            </span>
            <span className="text-xs text-slate-400">districts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Burden &gt; 33.0 offences</p>
        </div>

        {/* Medium Risk */}
        <div className="clean-card rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Medium Risk</span>
            <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-amber-600 tracking-tight">
              {loading ? '...' : stats?.medium_risk || 0}
            </span>
            <span className="text-xs text-slate-400">districts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Moderate threat tier</p>
        </div>

        {/* Low Risk */}
        <div className="clean-card rounded-xl p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Low Risk</span>
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-600 tracking-tight">
              {loading ? '...' : stats?.low_risk || 0}
            </span>
            <span className="text-xs text-slate-400">districts</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Standard baseline load</p>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Risk Distribution */}
        <div className="clean-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Risk Classification</h2>
              <p className="text-[11px] text-slate-500">Categorized threat proportion</p>
            </div>
            <div className="p-1.5 rounded-md bg-slate-50 text-slate-500">
              <PieIcon className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="h-56 flex items-center justify-center">
            {stats && stats.total_predictions > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.risk_distribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {stats.risk_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || RISK_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: '#0f172a' }}
                  />
                  <Legend verticalAlign="bottom" height={32} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs py-8">
                No prediction data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Cybercrime Forecast Burden Trend */}
        <div className="clean-card rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Forecasted Cybercrime Volume</h2>
              <p className="text-[11px] text-slate-500">Next-year predicted offences by district</p>
            </div>
            <div className="p-1.5 rounded-md bg-slate-50 text-slate-500">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="h-56 flex items-center justify-center">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cleanBurdenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="burden"
                    name="Predicted Offences"
                    stroke="#0f172a"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#cleanBurdenGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs py-8">
                Perform evaluations to view projection trajectories.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* State Breakdown & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* State-Level Comparison (Map Chart / Bar Chart) */}
        <div className="clean-card rounded-xl p-5 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">State-Level Distribution</h2>
              <p className="text-[11px] text-slate-500">Geographic distribution of predictions across India</p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setStateViewMode('map')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  stateViewMode === 'map'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3 h-3" />
                <span>Map Chart</span>
              </button>
              <button
                onClick={() => setStateViewMode('bar')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  stateViewMode === 'bar'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3 h-3" />
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.state_breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="state" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="avg_burden" name="Avg Predicted Burden" fill="#0f172a" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="predictions_count" name="Evaluations Count" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-400 text-xs py-8">
                  Comparative statistics will appear after evaluating multiple districts.
                </div>
              )
            )}
          </div>
        </div>

        {/* Recent Forecasts List */}
        <div className="clean-card rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
              <button
                onClick={() => navigate('/history')}
                className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {stats?.recent_predictions && stats.recent_predictions.length > 0 ? (
                stats.recent_predictions.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-medium text-slate-900">
                          {item.district}, {item.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span>Year {item.forecast_year}</span>
                        <span>•</span>
                        <span className="font-mono font-medium">{item.predicted_total} cases</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
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
              className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors"
            >
              Run District Forecast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
