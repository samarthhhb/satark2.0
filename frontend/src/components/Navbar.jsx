import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Compass, History, User, Users } from 'lucide-react';
import Logo from './Logo';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
      isActive
        ? 'bg-slate-900 text-white shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand - Clean SATARK logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <Logo size="md" />
            <span className="text-sm font-bold tracking-tight text-slate-900">
              SATARK
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
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

          {/* User Badge & Switch Option */}
          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              title="Click to switch user"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 transition-colors"
            >
              <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-[9px]">
                {user?.name ? user.name[0].toUpperCase() : <User className="w-2.5 h-2.5" />}
              </div>
              <span className="font-medium truncate max-w-[100px]">
                {user?.name || 'Analyst'}
              </span>
              <span className="text-[10px] text-slate-400">Switch</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
