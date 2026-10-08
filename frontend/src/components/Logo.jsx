import React from 'react';

export default function Logo({ size = "md", className = "" }) {
  const dimensions = {
    xs: { img: "w-6 h-6", container: "w-7 h-7 rounded-lg" },
    sm: { img: "w-9 h-auto max-h-8", container: "w-10 h-10 rounded-xl p-1" },
    md: { img: "w-13 h-auto max-h-11", container: "w-14 h-14 rounded-2xl p-1.5" },
    lg: { img: "w-18 h-auto max-h-14", container: "w-20 h-20 rounded-2xl p-2" },
    xl: { img: "w-26 h-auto max-h-20", container: "w-28 h-28 rounded-3xl p-3" }
  };

  const dim = dimensions[size] || dimensions.md;

  return (
    <div className={`relative flex items-center justify-center bg-white border border-slate-200/90 shadow-xs shrink-0 transition-transform group-hover:scale-105 ${dim.container} ${className}`}>
      <img
        src="/logo.png"
        alt="SATARK Logo"
        className={`object-contain ${dim.img}`}
        loading="eager"
      />
    </div>
  );
}
