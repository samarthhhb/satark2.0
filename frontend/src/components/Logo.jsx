import React from 'react';

export default function Logo({ size = "md", className = "" }) {
  const dimensions = {
    sm: { container: "w-6 h-6 rounded-md", svg: "w-3.5 h-3.5" },
    md: { container: "w-7 h-7 rounded-lg", svg: "w-4 h-4" },
    lg: { container: "w-10 h-10 rounded-xl", svg: "w-5 h-5" },
    xl: { container: "w-12 h-12 rounded-2xl", svg: "w-6 h-6" }
  };

  const dim = dimensions[size] || dimensions.md;

  return (
    <div className={`bg-slate-900 flex items-center justify-center text-white shadow-xs ${dim.container} ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={dim.svg}
      >
        {/* Outer Shield Geometry */}
        <path
          d="M12 3.5L19.5 7V12.5C19.5 16.8 16.3 20.2 12 21.5C7.7 20.2 4.5 16.8 4.5 12.5V7L12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Center Radar / Focus Core */}
        <circle
          cx="12"
          cy="12"
          r="3"
          stroke="#38BDF8"
          strokeWidth="1.5"
        />
        {/* Crosshair Indicators */}
        <path
          d="M12 7.5V9M12 15V16.5M7.5 12H9M15 12H16.5"
          stroke="#38BDF8"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle
          cx="12"
          cy="12"
          r="0.8"
          fill="#38BDF8"
        />
      </svg>
    </div>
  );
}
