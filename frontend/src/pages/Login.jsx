import React, { useState } from 'react';
import { ArrowRight, User, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login({ onAuthSuccess }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    localStorage.setItem('satark_user_name', cleanName);
    onAuthSuccess({ name: cleanName });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-sky-50">
      {/* Background Decorative Slide Elements */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-20 text-blue-200/50 text-5xl font-light select-none pointer-events-none">+</div>
      <div className="absolute bottom-20 left-20 text-sky-200/50 text-4xl font-light select-none pointer-events-none">+</div>

      <div className="w-full max-w-md relative z-10">
        <div className="satark-card p-8 bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl">
          <div className="mb-7 text-center">
            <Logo size="lg" className="mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              SATARK 2.0
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Cybercrime Forecasting &amp; Risk Assessment Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Analyst Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl satark-input font-medium text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all transform active:scale-98"
            >
              <span>Access Intelligence Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Cloud &amp; ML Architecture Session</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Enter analyst identity to log evaluations &amp; audit records
        </p>
      </div>
    </div>
  );
}
