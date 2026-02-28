import React from 'react';
import { ContentItem } from '../types';
import { motion } from 'motion/react';

interface ContentCardProps {
  item: ContentItem;
  onClick: (item: ContentItem) => void;
  isHero?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({ item, onClick, isHero }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onClick(item)}
      className={`cursor-pointer group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:shadow-md ${
        isHero ? 'col-span-1 md:col-span-2 row-span-2' : 'col-span-1'
      }`}
    >
      <div className={`relative ${isHero ? 'h-full min-h-[300px]' : 'aspect-[4/3]'}`}>
        {item.cover_url ? (
          <img
            src={item.cover_url}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full bg-emerald-50 flex items-center justify-center">
            <span className="text-emerald-200 font-serif text-4xl italic">{item.title[0]}</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <span className="inline-block px-2 py-1 mb-3 text-[10px] font-bold uppercase tracking-widest bg-brand rounded">
            {item.category_name}
          </span>
          <h3 className={`${isHero ? 'text-3xl' : 'text-xl'} font-serif font-bold leading-tight mb-2 group-hover:text-emerald-300 transition-colors`}>
            {item.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span className="font-medium">{item.author_name}</span>
            <span>•</span>
            <span>{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
