import React, { useState, useEffect } from 'react';
import { Clock, User, LogIn } from 'lucide-react';
import { format } from 'date-fns';

interface HeaderProps {
  title: string;
  onAdminClick: () => void;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, onAdminClick, isAdmin }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-serif font-bold tracking-tight text-brand italic">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-gray-500 font-mono text-sm bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <Clock size={16} className="text-brand" />
          <span>{format(time, 'HH:mm:ss')}</span>
        </div>
        
        <button 
          onClick={onAdminClick}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 border border-gray-200"
          title={isAdmin ? "Dashboard Admin" : "Login Admin"}
        >
          {isAdmin ? <User size={20} className="text-brand" /> : <LogIn size={20} />}
        </button>
      </div>
    </header>
  );
};
