import React, { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  const [view, setView] = useState<'home' | 'login' | 'admin'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAdminAccess = () => {
    if (isAuthenticated) {
      setView('admin');
    } else {
      setView('login');
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setView('admin');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('home');
  };

  return (
    <div className="h-full">
      {view === 'home' && (
        <HomePage 
          onAdminClick={handleAdminAccess} 
          isAdmin={isAuthenticated}
        />
      )}
      
      {view === 'login' && (
        <LoginPage 
          onLogin={handleLoginSuccess} 
          onBack={() => setView('home')} 
        />
      )}

      {view === 'admin' && isAuthenticated && (
        <AdminPage onBack={() => setView('home')} onLogout={handleLogout} />
      )}
    </div>
  );
}
