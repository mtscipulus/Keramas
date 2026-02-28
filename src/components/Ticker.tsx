import React from 'react';
import { motion } from 'motion/react';

interface TickerProps {
  text: string;
}

export const Ticker: React.FC<TickerProps> = ({ text }) => {
  return (
    <div className="bg-brand text-white py-2 overflow-hidden whitespace-nowrap border-t border-brand-dark relative">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-brand to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-brand to-transparent z-10" />
      
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="inline-block pl-[100%]"
      >
        <span className="text-sm font-medium tracking-wide uppercase px-4">
          {text} • {text} • {text} • {text}
        </span>
      </motion.div>
    </div>
  );
};
