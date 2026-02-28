import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Settings as SettingsIcon, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Star, 
  ArrowLeft,
  Save,
  Clock,
  LogOut
} from 'lucide-react';
import { ContentItem, Settings, Category } from '../types';
import { motion } from 'motion/react';

interface AdminPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBack, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'categories'>('content');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [settings, setSettings] = useState<Settings>({ header_title: '', ticker_text: '' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [contentRes, settingsRes, categoriesRes] = await Promise.all([
        fetch('/api/content?status=all'),
        fetch('/api/settings'),
        fetch('/api/categories')
      ]);

      if (!contentRes.ok || !settingsRes.ok || !categoriesRes.ok) {
        throw new Error('Gagal mengambil data admin');
      }

      setContent(await contentRes.json());
      setSettings(await settingsRes.json());
      setCategories(await categoriesRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    await fetch(`/api/content/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchAdminData();
  };

  const handleSetHighlight = async (id: number) => {
    await fetch(`/api/content/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_highlight: 1 }),
    });
    fetchAdminData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus konten ini?')) return;
    await fetch(`/api/content/${id}`, { method: 'DELETE' });
    fetchAdminData();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pengaturan');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden relative">
      {/* Success Notification */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: showSuccess ? 1 : 0, y: showSuccess ? 0 : -20 }}
          className="bg-brand text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-brand-dark"
        >
          <CheckCircle size={20} />
          <span className="font-bold">Pengaturan Berhasil Disimpan!</span>
        </motion.div>
      </div>

      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="text-brand" size={24} />
            <h1 className="text-xl font-bold text-gray-900">Panel Admin Keramas</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-brand text-xs font-bold rounded-full border border-emerald-100">
          <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
          ADMIN AKTIF
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'content' ? 'bg-brand text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText size={20} />
              <span className="font-medium">Manajemen Konten</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'settings' ? 'bg-brand text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SettingsIcon size={20} />
              <span className="font-medium">Pengaturan</span>
            </button>

            <div className="pt-4 mt-4 border-t border-gray-100">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
              >
                <LogOut size={20} />
                <span>Keluar</span>
              </button>
            </div>
          </nav>
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
              <p className="font-bold mb-1">Status Sistem</p>
              <p>Versi 1.0.0</p>
              <p>Database: SQLite</p>
            </div>
          </div>
        </aside>

        {/* Main Admin Content */}
        <main className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Daftar Rubrik</h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-xs font-bold rounded-full border border-yellow-100">
                    {content.filter(c => c.status === 'pending').length} Menunggu
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">
                    {content.filter(c => c.status === 'approved').length} Disetujui
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Konten</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Penulis</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {content.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center overflow-hidden">
                              {item.cover_url ? (
                                <img src={item.cover_url} className="w-full h-full object-cover" />
                              ) : (
                                <FileText className="text-brand" size={20} />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 line-clamp-1">{item.title}</p>
                              <p className="text-xs text-gray-500">{item.category_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-700">{item.author_name}</p>
                          <p className="text-xs text-gray-400">{item.author_email || '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.status !== 'approved' && (
                              <button 
                                onClick={() => handleUpdateStatus(item.id, 'approved')}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Setujui"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                            {item.status !== 'rejected' && (
                              <button 
                                onClick={() => handleUpdateStatus(item.id, 'rejected')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Tolak"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleSetHighlight(item.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                item.is_highlight ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title="Jadikan Highlight"
                            >
                              <Star size={18} fill={item.is_highlight ? 'currentColor' : 'none'} />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">Pengaturan Majalah</h2>
              
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Nama Aplikasi (Header)</label>
                    <input
                      type="text"
                      value={settings.header_title}
                      onChange={(e) => setSettings({ ...settings, header_title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Teks Ticker (Footer)</label>
                    <textarea
                      rows={3}
                      value={settings.ticker_text}
                      onChange={(e) => setSettings({ ...settings, ticker_text: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-200"
                >
                  <Save size={20} />
                  Simpan Perubahan
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
