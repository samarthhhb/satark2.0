import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Prediction from './pages/Prediction';
import History from './pages/History';
import About from './pages/About';
import AIAssistant from './components/AIAssistant';

export default function App() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(() => localStorage.getItem('satark_user_name'));
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [activeForecastContext, setActiveForecastContext] = useState(null);

  useEffect(() => {
    const handleStorage = () => {
      setUserName(localStorage.getItem('satark_user_name'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleNameSuccess = (userData) => {
    setUserName(userData.name);
    navigate('/');
  };

  const handleSwitchUser = () => {
    localStorage.removeItem('satark_user_name');
    setUserName(null);
    navigate('/login');
  };

  if (!userName) {
    return (
      <Routes>
        <Route path="/login" element={<Login onAuthSuccess={handleNameSuccess} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const currentUser = { name: userName };

  return (
    <div className="min-h-screen flex bg-[#f6f8fc] text-slate-900 selection:bg-blue-600 selection:text-white relative overflow-x-hidden font-sans">
      {/* Background Decorative Presentation Elements (+ crosses & gradient orbs) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] bg-sky-200/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-[36rem] h-[36rem] bg-indigo-100/30 rounded-full blur-3xl" />

        {/* Floating cross/plus accents */}
        <div className="absolute top-24 right-16 text-blue-200/40 text-4xl font-light select-none">+</div>
        <div className="absolute top-96 left-72 text-blue-200/30 text-3xl font-light select-none">+</div>
        <div className="absolute bottom-40 right-28 text-sky-200/40 text-5xl font-light select-none">+</div>
      </div>

      {/* Left Hand Navigation Toolbar - Always Visible */}
      <Sidebar 
        user={currentUser} 
        onLogout={handleSwitchUser} 
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />
      
      {/* Main Content Canvas with Left Margin for Fixed Toolbar */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen ml-16 sm:ml-64">
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<Dashboard user={currentUser} />} />
            <Route 
              path="/predict" 
              element={
                <Prediction 
                  onForecastGenerated={(forecast) => {
                    setActiveForecastContext(forecast);
                  }} 
                  onOpenAssistant={(forecast) => {
                    setActiveForecastContext(forecast);
                    setIsAssistantOpen(true);
                  }}
                />
              } 
            />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Page Footer */}
        <footer className="border-t border-slate-200/70 py-4 bg-white/60 backdrop-blur-xs text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">SATARK 2.0</span>
              <span>•</span>
              <span>Cybercrime Forecasting &amp; Risk Intelligence</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Symbiosis Institute of Technology • Cloud Computing &amp; Machine Learning
            </div>
          </div>
        </footer>
      </div>

      {/* Scoped AI Threat Intelligence Assistant */}
      <AIAssistant
        activeContext={activeForecastContext}
        isOpen={isAssistantOpen}
        setIsOpen={setIsAssistantOpen}
      />
    </div>
  );
}
