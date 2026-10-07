import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
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
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-slate-900 selection:text-white">
      <Navbar 
        user={currentUser} 
        onLogout={handleSwitchUser} 
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />
      
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

      {/* Scoped AI Threat Intelligence Assistant */}
      <AIAssistant
        activeContext={activeForecastContext}
        isOpen={isAssistantOpen}
        setIsOpen={setIsAssistantOpen}
      />

      <footer className="border-t border-slate-200 py-4 bg-white text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center">
          <span>SATARK 2.0 • Cybercrime Forecasting & Risk Assessment</span>
        </div>
      </footer>
    </div>
  );
}
