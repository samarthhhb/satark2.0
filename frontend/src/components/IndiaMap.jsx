import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import INDIA_MAP_DATA from '../data/indiaMapData';

// Normalization helper to map any naming variation between dataset and cartography
function normalizeStateName(raw) {
  if (!raw) return '';
  const clean = raw.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, ' ').trim();
  
  if (clean.includes('dadra') || clean.includes('daman') || clean.includes('diu') || clean.includes('nagar haveli')) {
    return 'the dadra and nagar haveli and daman and diu';
  }
  if (clean === 'orissa') return 'odisha';
  if (clean === 'uttaranchal') return 'uttarakhand';
  if (clean === 'pondicherry') return 'puducherry';
  return clean;
}

export default function IndiaMap({ stateBreakdown = [], onSelectState }) {
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Map stateBreakdown array to lookup map by normalized state name
  const dataLookup = {};
  let maxBurden = 1;
  stateBreakdown.forEach((item) => {
    const key = normalizeStateName(item.state);
    dataLookup[key] = item;
    if (item.avg_burden && item.avg_burden > maxBurden) {
      maxBurden = item.avg_burden;
    }
  });

  const getStateFill = (stateName) => {
    const key = normalizeStateName(stateName);
    const data = dataLookup[key];
    if (!data || data.predictions_count === 0) {
      return '#f1f5f9'; // Clean light slate for states with no predictions
    }
    
    const burden = data.avg_burden;
    if (burden >= 33.0) {
      return '#f87171'; // High Risk (Red)
    } else if (burden >= 10.0) {
      return '#fbbf24'; // Medium Risk (Yellow / Amber)
    } else {
      return '#34d399'; // Low Risk (Green)
    }
  };

  const handleMouseMove = (e, state) => {
    const rect = e.currentTarget.closest('svg').getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setHoveredState(state);
  };

  const hoveredData = hoveredState ? dataLookup[normalizeStateName(hoveredState.name)] : null;

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2 select-none">
      <svg
        viewBox={INDIA_MAP_DATA.viewBox || '0 0 612 696'}
        className="w-full h-full max-h-[310px] drop-shadow-xs"
      >
        <g>
          {INDIA_MAP_DATA.locations.map((state) => {
            const isHovered = hoveredState?.id === state.id;
            const fill = getStateFill(state.name);

            return (
              <path
                key={state.id}
                d={state.path}
                fill={fill}
                stroke={isHovered ? '#1e3a8a' : '#cbd5e1'}
                strokeWidth={isHovered ? '2' : '0.75'}
                strokeLinejoin="round"
                className="transition-all duration-150 cursor-pointer hover:opacity-90"
                onMouseEnter={(e) => handleMouseMove(e, state)}
                onMouseMove={(e) => handleMouseMove(e, state)}
                onMouseLeave={() => setHoveredState(null)}
                onClick={() => onSelectState && onSelectState(state.name)}
              />
            );
          })}
        </g>
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredState && (
        <div
          style={{
            left: Math.min(Math.max(tooltipPos.x + 12, 10), 280),
            top: Math.max(10, tooltipPos.y - 45)
          }}
          className="absolute z-20 pointer-events-none bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-3 shadow-xl text-xs animate-in fade-in zoom-in-95 duration-100 min-w-[170px]"
        >
          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1.5 border-b border-slate-100 pb-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>{hoveredState.name}</span>
          </div>

          {hoveredData ? (
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Districts Evaluated:</span>
                <strong className="text-slate-900 font-sans">{hoveredData.predictions_count}</strong>
              </div>
              <div className="flex justify-between">
                <span>Avg Predicted Burden:</span>
                <strong className="text-slate-900 font-sans">{hoveredData.avg_burden}</strong>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                <span>Risk Status:</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  hoveredData.avg_burden >= 33.0 
                    ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                    : hoveredData.avg_burden >= 10.0 
                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {hoveredData.avg_burden >= 33.0 
                    ? 'High Risk' 
                    : hoveredData.avg_burden >= 10.0 
                    ? 'Medium Risk' 
                    : 'Low Risk'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">
              No evaluations yet. Click to forecast.
            </p>
          )}
        </div>
      )}

      {/* Modern Pill Legend */}
      <div className="absolute bottom-1 right-2 flex items-center gap-2.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 text-[10px] font-semibold text-slate-600 shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f87171] inline-block" />
          <span>High (&gt;33)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] inline-block" />
          <span>Medium (10–33)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] inline-block" />
          <span>Low (&lt;10)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f1f5f9] border border-slate-300 inline-block" />
          <span>No Data</span>
        </div>
      </div>
    </div>
  );
}
