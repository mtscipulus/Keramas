import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, ArrowLeft, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (email === 'admin@mtscipulus.sch.id' && password === '@Musabiq90') {
        onLogin();
      } else {
        setError('Email atau password salah.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="h-full flex items-center justify-center bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-8 bg-emerald-50 border-b border-emerald-100 text-center">
          <div className="w-16 h-16 bg-brand text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 rotate-3">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">Akses Admin</h2>
          <p className="text-gray-500 text-sm mt-1">Masuk untuk mengelola majalah Keramas</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Email</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mtscipulus.sch.id"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Masuk Sekarang'}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </button>
        </form>
      </motion.div>
    </div>
  );
};
