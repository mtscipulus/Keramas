import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Calendar, Tag } from 'lucide-react';
import { ContentItem } from '../types';

interface ContentModalProps {
  item: ContentItem | null;
  onClose: () => void;
}

export const ContentModal: React.FC<ContentModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white w-full max-w-5xl h-full md:h-[90vh] md:rounded-3xl overflow-hidden shadow-2xl flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button Floating */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all border border-white/20 shadow-xl"
          >
            <X size={24} />
          </button>

          {/* Hero Section */}
          <div className="relative h-[40vh] md:h-[50vh] shrink-0 overflow-hidden">
            {item.cover_url ? (
              <motion.img
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                src={item.cover_url}
                alt={item.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-900">
                <span className="text-emerald-100/20 font-serif text-[15vw] italic select-none">{item.title[0]}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-[0.2em] bg-brand text-white rounded-full shadow-lg shadow-emerald-500/20">
                  {item.category_name}
                </span>
                <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight text-gray-900 drop-shadow-sm">
                  {item.title}
                </h2>
              </motion.div>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
            <div className="max-w-3xl mx-auto px-8 md:px-12 py-12">
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12 pb-8 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-brand border border-emerald-100">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Penulis</p>
                    <p className="font-bold text-gray-900">{item.author_name}</p>
                  </div>
                </div>
                
                <div className="hidden md:block w-px h-8 bg-gray-100" />

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-brand border border-emerald-100">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Diterbitkan</p>
                    <p className="font-bold text-gray-900">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="wysiwyg-content prose prose-emerald prose-lg max-w-none text-gray-700 leading-[1.8] font-sans"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />

              <div className="mt-20 pt-12 border-t border-gray-100 text-center">
                <p className="text-gray-400 italic font-serif text-lg mb-8">Terima kasih telah membaca rubrik ini.</p>
                <button
                  onClick={onClose}
                  className="px-12 py-4 bg-brand hover:bg-brand-dark text-white rounded-full font-bold transition-all shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95"
                >
                  Tutup Artikel
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
