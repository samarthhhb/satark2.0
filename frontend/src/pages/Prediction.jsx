import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2,
  PieChart as PieIcon,
  HelpCircle,
  Bot,
  ChevronDown,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { predictionAPI } from '../api/client';

export default function Prediction({ onForecastGenerated, onOpenAssistant }) {
  const navigate = useNavigate();

  // State selection
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [years, setYears] = useState([2021, 2022, 2023, 2024]);

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedYear, setSelectedYear] = useState('2021');

  const [loading, setLoading] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Initial load: Fetch states
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const stateList = await predictionAPI.getStates();
        setStates(stateList);
        if (stateList.length > 0) {
          const defaultState = stateList.includes('Maharashtra') ? 'Maharashtra' : stateList[0];
          setSelectedState(defaultState);
        }
      } catch (err) {
        setError('Failed to fetch states from backend.');
      }
    };
    fetchStates();
  }, []);

  // When state changes, fetch districts
  useEffect(() => {
    if (!selectedState) return;

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const districtList = await predictionAPI.getDistricts(selectedState);
        setDistricts(districtList);
        if (districtList.length > 0) {
          const defaultDist = districtList.includes('Pune') ? 'Pune' : districtList[0];
          setSelectedDistrict(defaultDist);
        } else {
          setSelectedDistrict('');
        }
      } catch (err) {
        setError(`Failed to fetch districts for ${selectedState}`);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [selectedState]);

  // When district changes, fetch years
  useEffect(() => {
    if (!selectedState || !selectedDistrict) return;

    const fetchYears = async () => {
      try {
        const yrList = await predictionAPI.getYears(selectedState, selectedDistrict);
        if (yrList && yrList.length > 0) {
          setYears(yrList);
          if (!yrList.includes(parseInt(selectedYear))) {
            setSelectedYear(String(yrList[yrList.length - 1]));
          }
        }
      } catch (err) {
        // Fallback default years
      }
    };

    fetchYears();
  }, [selectedState, selectedDistrict]);

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!selectedState || !selectedDistrict || !selectedYear) {
      setError('Please select state, district, and year.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const pred = await predictionAPI.predict(selectedState, selectedDistrict, selectedYear);
      setResult(pred);
      if (onForecastGenerated) {
        onForecastGenerated(pred);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return {
          cardBg: 'bg-rose-50/70 border-rose-200 text-rose-900',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: <ShieldAlert className="w-6 h-6 text-rose-600" />,
          desc: 'High Risk District (anticipated burden > 33.0 offences). Heightened cyber patrol & operational monitoring recommended.'
        };
      case 'medium':
        return {
          cardBg: 'bg-amber-50/70 border-amber-200 text-amber-900',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          desc: 'Medium Risk District. Routine cyber vigilance and targeted awareness protocols recommended.'
        };
      case 'low':
      default:
        return {
          cardBg: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
          desc: 'Low Risk District. Baseline operational cyber workload.'
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              District Cybercrime Forecaster
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Select target location and baseline year. SATARK queries the 31-variable district crime profile and generates next-year volume forecasts and risk classification.
          </p>
        </div>
      </div>

      {/* Input Selection Card */}
      <div className="satark-card p-6 sm:p-8 bg-white relative overflow-hidden">
        <div className="absolute right-6 top-6 text-slate-200/60 text-3xl font-light select-none pointer-events-none">+</div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handlePredict} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* State Select */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                State / Union Territory
              </label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl satark-input appearance-none bg-white pr-9 font-semibold text-slate-900 cursor-pointer"
                >
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* District Select */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                District Region
              </label>
              <div className="relative">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={loadingDistricts || districts.length === 0}
                  className="w-full px-4 py-3 text-sm rounded-xl satark-input appearance-none bg-white pr-9 font-semibold text-slate-900 cursor-pointer disabled:opacity-50"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Year Select */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Baseline Year
              </label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl satark-input appearance-none bg-white pr-9 font-semibold text-slate-900 cursor-pointer"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y} → Predicts Year {parseInt(y) + 1}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-500" />
              <span>Auto-loads 31 district crime vector features from cloud database</span>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedDistrict}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 transform active:scale-98"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Running CatBoost Engine...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Generate Forecast</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* FORECAST RESULT CARD */}
      {result && (
        <div className="satark-card p-6 sm:p-8 bg-white space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Evaluation Output
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {result.district}, {result.state}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-sm text-slate-700 font-medium border border-slate-200/60">
                Baseline: <span className="font-bold text-slate-900">{result.input_year}</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-sm text-white font-bold shadow-xs">
                Target Year: <span>{result.forecast_year}</span>
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Predicted Burden */}
            <div className="p-6 sm:p-7 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-blue-50/30 space-y-3 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Predicted Cybercrime Volume
                </span>
                <div className="mt-3 flex items-baseline gap-2.5">
                  <span className="text-5xl sm:text-6xl font-extrabold text-slate-900 font-sans tracking-tight">
                    {result.predicted_total}
                  </span>
                  <span className="text-sm text-slate-500 font-medium">forecasted offences</span>
                </div>
              </div>

              {result.current_total !== undefined && (
                <div className="text-sm text-slate-600 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span>Baseline ({result.input_year}): <strong className="text-slate-800 font-bold">{result.current_total}</strong></span>
                  <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                    YoY: {((result.predicted_total - result.current_total) / Math.max(1, result.current_total) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            {/* Predicted Risk Level */}
            {(() => {
              const badge = getRiskBadge(result.risk_level);
              return (
                <div className={`p-6 sm:p-7 rounded-2xl border ${badge.cardBg} space-y-3 flex flex-col justify-between shadow-xs`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Risk Tier Rating
                      </span>
                      <div className="p-2.5 rounded-xl bg-white/80 backdrop-blur-xs shadow-2xs">
                        {badge.icon}
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <span className={`inline-block px-3.5 py-1.5 rounded-xl text-sm font-extrabold uppercase tracking-wider border shadow-2xs ${badge.badgeBg}`}>
                        {result.risk_level} Risk
                      </span>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-600">
                    {badge.desc}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Top Contributing Crime Vectors */}
          {result.top_crime_breakdown && result.top_crime_breakdown.length > 0 && (
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Top Incident Categories in District Baseline Profile
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                {result.top_crime_breakdown.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                    <p className="text-xs text-slate-500 font-medium truncate" title={item.category}>
                      {item.category}
                    </p>
                    <p className="text-base font-extrabold text-slate-900 font-sans mt-1">
                      {item.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>Record logged into audit store</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => onOpenAssistant && onOpenAssistant(result)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Bot className="w-4 h-4 text-blue-600" />
                <span>CyberGuard Analysis</span>
              </button>
              <button
                onClick={() => navigate('/history')}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold shadow-xs transition-colors"
              >
                View History
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-xs transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
