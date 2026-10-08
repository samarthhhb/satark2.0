import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  History, 
  Users, 
  LogOut, 
  ShieldCheck,
  Bot,
  Sparkles
} from 'lucide-react';
import Logo from './Logo';

export default function Sidebar({ user, onLogout, onOpenAssistant }) {
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3.5 px-3.5 sm:px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-150 group justify-center sm:justify-start ${
      isActive
        ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/15'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
    }`;

  return (
    <aside className="w-16 sm:w-64 h-screen fixed top-0 left-0 bottom-0 shrink-0 z-30 bg-white border-r border-slate-200/80 p-2.5 sm:p-5 select-none flex flex-col justify-between shadow-[1px_0_10px_rgba(0,0,0,0.02)] transition-all duration-200 overflow-y-auto">
      {/* Top Brand with Prominent Logo */}
      <div className="space-y-6 sm:space-y-7">
        <div 
          className="flex items-center gap-3.5 cursor-pointer group justify-center sm:justify-start px-0 sm:px-1 pt-1" 
          onClick={() => navigate('/')}
        >
          <Logo size="md" />
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                SATARK
              </span>
              <span className="px-2 py-0.2 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700">
                2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Cyber Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-1.5">
          <div className="hidden sm:block px-3 pb-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Navigation
          </div>

          <NavLink 
            to="/" 
            end 
            className={navLinkClass}
            title="Dashboard"
          >
            <LayoutDashboard className="w-5 h-5 shrink-0 text-slate-500 group-[.bg-slate-900]:text-white transition-colors" />
            <span className="hidden sm:inline">Dashboard</span>
          </NavLink>

          <NavLink 
            to="/predict" 
            className={navLinkClass}
            title="Forecasting"
          >
            <Compass className="w-5 h-5 shrink-0 text-slate-500 group-[.bg-slate-900]:text-white transition-colors" />
            <span className="hidden sm:inline">Forecasting</span>
          </NavLink>

          <NavLink 
            to="/history" 
            className={navLinkClass}
            title="Audit History"
          >
            <History className="w-5 h-5 shrink-0 text-slate-500 group-[.bg-slate-900]:text-white transition-colors" />
            <span className="hidden sm:inline">Audit History</span>
          </NavLink>

          <NavLink 
            to="/about" 
            className={navLinkClass}
            title="About & Team"
          >
            <Users className="w-5 h-5 shrink-0 text-slate-500 group-[.bg-slate-900]:text-white transition-colors" />
            <span className="hidden sm:inline">About &amp; Team</span>
          </NavLink>

          {/* CyberGuard AI Assistant Trigger Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenAssistant}
              className="w-full flex items-center gap-3 px-3 sm:px-3.5 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-900 border border-blue-200/80 transition-all duration-150 group justify-center sm:justify-between shadow-2xs cursor-pointer"
              title="Open CyberGuard (Status: Live)"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Bot className="w-5 h-5 shrink-0 text-blue-600 group-hover:scale-105 transition-transform" />
                <span className="hidden sm:inline font-bold text-slate-800">CyberGuard</span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>Live</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: System info & User Profile Pill */}
      <div className="space-y-3 sm:space-y-3.5 pt-3 sm:pt-4 border-t border-slate-100">
        <div className="hidden sm:flex px-3 items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>AWS Cloud RDS</span>
          </span>
          <span className="font-mono text-xs">v2.0</span>
        </div>

        {/* User Card Widget */}
        <div className="p-2 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.name || 'Analyst'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                Active Session
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Switch User / Logout"
            className="hidden sm:block p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
