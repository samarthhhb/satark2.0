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
  AlertTriangle 
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Prediction History & Audit Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log of previously generated forecasts, model estimates, and risk categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            title="Refresh"
            className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-900' : ''}`} />
          </button>

          <button
            onClick={exportCSV}
            disabled={filteredPredictions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium shadow-sm transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => navigate('/predict')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-sm transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>New Forecast</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="clean-card rounded-xl p-3.5 bg-white flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search district or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg clean-input"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* State Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="clean-input rounded-lg px-2.5 py-1.5 text-xs"
            >
              {uniqueStates.map((st) => (
                <option key={st} value={st}>
                  {st === 'ALL' ? 'All States' : st}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="clean-input rounded-lg px-2.5 py-1.5 text-xs"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="clean-card rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-5">State</th>
                <th className="py-3 px-5">District</th>
                <th className="py-3 px-4 text-center">Baseline Year</th>
                <th className="py-3 px-4 text-center">Forecast Year</th>
                <th className="py-3 px-5 text-right">Predicted Total</th>
                <th className="py-3 px-5 text-center">Risk Level</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPredictions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    No prediction records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredPredictions.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-5 font-medium text-slate-900">{row.state}</td>
                    <td className="py-3 px-5 font-semibold text-slate-900">
                      {row.district}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 font-mono">
                      {row.input_year}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-900">
                      {row.forecast_year}
                    </td>
                    <td className="py-3 px-5 text-right font-mono font-bold text-slate-900">
                      {row.predicted_total}
                    </td>
                    <td className="py-3 px-5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.risk_level === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : row.risk_level === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {row.risk_level === 'High' && <ShieldAlert className="w-3 h-3 text-rose-600" />}
                        {row.risk_level === 'Medium' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {row.risk_level === 'Low' && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                        <span>{row.risk_level}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(row.id)}
                        disabled={deletingId === row.id}
                        title="Delete entry"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
