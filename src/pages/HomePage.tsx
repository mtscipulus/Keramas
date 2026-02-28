import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Ticker } from '../components/Ticker';
import { ContentCard } from '../components/ContentCard';
import { ContentModal } from '../components/ContentModal';
import { SubmissionForm } from '../components/SubmissionForm';
import { ContentItem, Settings } from '../types';
import { PlusCircle, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface HomePageProps {
  onAdminClick: () => void;
  isAdmin: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({ onAdminClick, isAdmin }) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [settings, setSettings] = useState<Settings>({ header_title: 'Keramas', ticker_text: '' });
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmissionSuccess = () => {
    setShowSuccess(true);
    fetchData();
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contentRes, settingsRes] = await Promise.all([
        fetch('/api/content?status=approved'),
        fetch('/api/settings')
      ]);
      
      if (!contentRes.ok || !settingsRes.ok) {
        throw new Error('Gagal mengambil data dari server');
      }

      const contentData = await contentRes.json();
      const settingsData = await settingsRes.json();
      setContent(contentData);
      setSettings(settingsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const heroItem = content.find(item => item.is_highlight === 1) || content[0];
  const otherItems = content.filter(item => item.id !== heroItem?.id).slice(0, 4);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <Header 
        title={settings.header_title} 
        onAdminClick={onAdminClick} 
        isAdmin={isAdmin}
      />

      {/* Success Toast */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: showSuccess ? 1 : 0, y: showSuccess ? 0 : -20 }}
          className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500 backdrop-blur-md"
        >
          <div className="bg-white/20 p-1 rounded-full">
            <CheckCircle size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">Berhasil Terkirim!</span>
            <span className="text-xs text-emerald-50">Rubrik Anda sedang menunggu persetujuan admin.</span>
          </div>
        </motion.div>
      </div>

      <main className="flex-1 overflow-hidden p-6 relative">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-brand" size={48} />
          </div>
        ) : content.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <p className="text-xl font-serif italic">Belum ada konten yang tersedia.</p>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-full hover:bg-brand-dark transition-colors"
            >
              <PlusCircle size={20} />
              Kirim Rubrik Pertama
            </button>
          </div>
        ) : (
          <div className="h-full grid grid-cols-1 md:grid-cols-3 grid-rows-2 md:grid-rows-2 gap-6">
            {heroItem && (
              <ContentCard 
                item={heroItem} 
                onClick={setSelectedItem} 
                isHero 
              />
            )}
            
            {otherItems.map((item) => (
              <ContentCard 
                key={item.id} 
                item={item} 
                onClick={setSelectedItem} 
              />
            ))}

            {/* Floating Action Button for Submission */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="fixed bottom-20 right-8 z-20 flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-full shadow-lg hover:shadow-emerald-200 transition-all font-bold"
            >
              <PlusCircle size={20} />
              Kirim Rubrik
            </motion.button>
          </div>
        )}
      </main>

      <Ticker text={settings.ticker_text} />

      <ContentModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />

      {showForm && (
        <SubmissionForm 
          onClose={() => setShowForm(false)} 
          onSuccess={handleSubmissionSuccess}
        />
      )}
    </div>
  );
};
