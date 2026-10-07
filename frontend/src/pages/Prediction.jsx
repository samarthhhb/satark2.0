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
  Bot
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
          cardBg: 'bg-rose-50/50 border-rose-200 text-rose-900',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
          desc: 'High Risk District (anticipated burden > 33.0 offences). Heightened operational monitoring recommended.'
        };
      case 'medium':
        return {
          cardBg: 'bg-amber-50/50 border-amber-200 text-amber-900',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          desc: 'Medium Risk District. Routine vigilance and digital patrol protocols recommended.'
        };
      case 'low':
      default:
        return {
          cardBg: 'bg-emerald-50/50 border-emerald-200 text-emerald-900',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
          desc: 'Low Risk District. Baseline operational workload.'
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          District Cybercrime Forecaster
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Select target location and baseline year. SATARK retrieves the 31-variable district crime profile and generates next-year volume forecasts and risk classification via CatBoost.
        </p>
      </div>

      {/* Input Selection Form */}
      <div className="clean-card rounded-xl p-6 bg-white">
        {error && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePredict} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* State Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                State / UT
              </label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg clean-input appearance-none bg-white pr-8 font-medium"
                >
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-400" />
              </div>
            </div>

            {/* District Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                District
              </label>
              <div className="relative">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={loadingDistricts || districts.length === 0}
                  className="w-full px-3 py-2 text-xs rounded-lg clean-input appearance-none bg-white pr-8 font-medium disabled:opacity-50"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-400" />
              </div>
            </div>

            {/* Year Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Baseline Year
              </label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg clean-input appearance-none bg-white pr-8 font-medium"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y} (Predicts {parseInt(y) + 1})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>31 feature variables loaded automatically from district profile</span>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedDistrict}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Computing Prediction...</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5" />
                  <span>Generate Forecast</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* FORECAST RESULT CARD */}
      {result && (
        <div className="clean-card rounded-xl p-6 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Forecast Evaluation Report
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {result.district}, {result.state}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-md bg-slate-100 text-xs text-slate-600 font-medium">
                Baseline: <span className="font-semibold text-slate-900">{result.input_year}</span>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-slate-900 text-xs text-white font-medium">
                Target Year: <span className="font-semibold">{result.forecast_year}</span>
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Predicted Burden */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Predicted Cybercrime Volume
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {result.predicted_total}
                  </span>
                  <span className="text-xs text-slate-500">estimated offences</span>
                </div>
              </div>

              {result.current_total !== undefined && (
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span>Baseline ({result.input_year}): <strong className="text-slate-700">{result.current_total}</strong></span>
                  <span className="font-medium text-slate-600">
                    YoY: {((result.predicted_total - result.current_total) / Math.max(1, result.current_total) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            {/* Predicted Risk Level */}
            {(() => {
              const badge = getRiskBadge(result.risk_level);
              return (
                <div className={`p-5 rounded-xl border ${badge.cardBg} space-y-2 flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        Risk Tier Rating
                      </span>
                      {badge.icon}
                    </div>

                    <div className="mt-2">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${badge.badgeBg}`}>
                        {result.risk_level} Risk
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-600">
                    {badge.desc}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Top Contributing Crime Vectors */}
          {result.top_crime_breakdown && result.top_crime_breakdown.length > 0 && (
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <PieIcon className="w-3.5 h-3.5 text-slate-600" />
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Top Crime Factors in Baseline Profile
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                {result.top_crime_breakdown.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <p className="text-[10px] text-slate-500 truncate" title={item.category}>
                      {item.category}
                    </p>
                    <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                      {item.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Record saved to database</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onOpenAssistant && onOpenAssistant(result)}
                className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Consult Assistant</span>
              </button>
              <button
                onClick={() => navigate('/history')}
                className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors"
              >
                View History
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
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
