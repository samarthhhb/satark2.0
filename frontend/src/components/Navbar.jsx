import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  History, 
  Users, 
  Bot,
  Sparkles,
  LogOut,
  ChevronDown
} from 'lucide-react';
import Logo from './Logo';

export default function Navbar({ user, onLogout, onOpenAssistant }) {
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/10'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_10px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand - Modern Logo & System Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none" 
            onClick={() => navigate('/')}
          >
            <Logo size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  SATARK
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-blue-50 border border-blue-200/60 text-[10px] font-bold text-blue-700">
                  2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Cloud Cybercrime Intelligence
              </p>
            </div>
          </div>

          {/* Navigation Pill Links (matching Dashboard UI reference) */}
          <nav className="flex items-center bg-slate-50/90 p-1 rounded-2xl border border-slate-200/60 shadow-inner">
            <NavLink to="/" end className={navLinkClass}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </NavLink>
            <NavLink to="/predict" className={navLinkClass}>
              <Compass className="w-3.5 h-3.5" />
              <span>Forecasting</span>
            </NavLink>
            <NavLink to="/history" className={navLinkClass}>
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              <Users className="w-3.5 h-3.5" />
              <span>About</span>
            </NavLink>
          </nav>

          {/* Right actions: AI Assistant trigger + User profile badge */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenAssistant}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200/80 text-xs font-semibold transition-all shadow-xs"
              title="Open CyberGuard Threat Intelligence"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>CyberGuard</span>
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center">
              <button
                onClick={onLogout}
                title="Click to switch user"
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs text-xs text-slate-700 transition-all group"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                  {user?.name ? user.name[0].toUpperCase() : 'A'}
                </div>
                <span className="font-semibold text-slate-800 truncate max-w-[100px]">
                  {user?.name || 'Analyst'}
                </span>
                <LogOut className="w-3 h-3 text-slate-400 group-hover:text-rose-500 transition-colors ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
