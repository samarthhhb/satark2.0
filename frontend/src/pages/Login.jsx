import React, { useState } from 'react';
import { ArrowRight, User } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fafc]">
      <div className="w-full max-w-sm">
        <div className="clean-card rounded-xl p-7 bg-white">
          <div className="mb-6 text-center">
            <Logo size="lg" className="mx-auto mb-3" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Welcome to SATARK 2.0
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Cybercrime Forecasting & Risk Assessment Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samarth"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg clean-input font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span>Continue to Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-5">
          Enter your name to access forecasts and history
        </p>
      </div>
    </div>
  );
}
