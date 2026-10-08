import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Compass, 
  RefreshCw, 
  MapPin, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { predictionAPI } from '../api/client';

export default function History() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await predictionAPI.getPredictions();
      setPredictions(data);
    } catch (err) {
      console.error('Failed to load predictions history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this prediction record?')) return;
    setDeletingId(id);
    try {
      await predictionAPI.deletePrediction(id);
      setPredictions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete prediction record.');
    } finally {
      setDeletingId(null);
    }
  };

  const exportCSV = () => {
    if (predictions.length === 0) return;
    const headers = ['ID,State,District,Input Year,Forecast Year,Predicted Burden,Risk Level,Created At'];
    const rows = filteredPredictions.map((p) =>
      [
        p.id,
        `"${p.state}"`,
        `"${p.district}"`,
        p.input_year,
        p.forecast_year,
        p.predicted_total,
        p.risk_level,
        `"${p.created_at}"`
      ].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `satark_prediction_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueStates = ['ALL', ...new Set(predictions.map((p) => p.state))];

  const filteredPredictions = predictions.filter((p) => {
    const matchesSearch =
      p.district.toLowerCase().includes(search.toLowerCase()) ||
      p.state.toLowerCase().includes(search.toLowerCase());
    const matchesRisk =
      selectedRisk === 'ALL' || p.risk_level?.toLowerCase() === selectedRisk.toLowerCase();
    const matchesState = selectedState === 'ALL' || p.state === selectedState;
    return matchesSearch && matchesRisk && matchesState;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Audit Records &amp; History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Historical log of district cybercrime forecasts, risk ratings, and model evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchHistory}
            title="Refresh"
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={exportCSV}
            disabled={filteredPredictions.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-sm font-bold shadow-xs transition-all disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => navigate('/predict')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>New Forecast</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="satark-card p-4 bg-white flex flex-col md:flex-row gap-3.5 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-88">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search district or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl satark-input font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* State Filter */}
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="satark-input rounded-xl pl-3.5 pr-9 py-2.5 text-sm font-semibold appearance-none bg-white cursor-pointer text-slate-700"
            >
              {uniqueStates.map((st) => (
                <option key={st} value={st}>
                  {st === 'ALL' ? 'All States' : st}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          {/* Risk Filter */}
          <div className="relative">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="satark-input rounded-xl pl-3.5 pr-9 py-2.5 text-sm font-semibold appearance-none bg-white cursor-pointer text-slate-700"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="satark-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold text-xs">
              <tr>
                <th className="py-4 px-6">State</th>
                <th className="py-4 px-6">District</th>
                <th className="py-4 px-4 text-center">Baseline Year</th>
                <th className="py-4 px-4 text-center">Forecast Year</th>
                <th className="py-4 px-6 text-right">Predicted Volume</th>
                <th className="py-4 px-6 text-center">Risk Tier</th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2.5">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-medium">Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPredictions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400 text-sm">
                    No prediction records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredPredictions.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">{row.state}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {row.district}
                    </td>
                    <td className="py-4 px-4 text-center text-slate-500 font-sans">
                      {row.input_year}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-900 font-sans">
                      {row.forecast_year}
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-slate-900 font-sans">
                      {row.predicted_total}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                          row.risk_level === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : row.risk_level === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {row.risk_level === 'High' && <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />}
                        {row.risk_level === 'Medium' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                        {row.risk_level === 'Low' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>{row.risk_level}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleDelete(row.id)}
                        disabled={deletingId === row.id}
                        title="Delete record"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
