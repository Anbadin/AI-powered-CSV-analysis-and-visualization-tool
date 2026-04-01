'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <div className="text-center mb-16 pt-12">
      
      {/* Premium Badge - Using your new grey for the background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 bg-[#2C2E39] 
                   border border-white/10 text-white 
                   px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-8 shadow-xl"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
        </span>
        Powered by AI & Machine Learning
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        /* CHANGED: text-[#2C2E39] applied here */
        className="text-6xl md:text-7xl font-black text-[#2C2E39] mb-6 leading-[1.1] tracking-tight"
      >
        Smart Data Story
        <br />
        <span className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          Generator
        </span>
      </motion.h1>

      {/* Subtitle - Using 70% opacity of your color for visual hierarchy */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-[#2C2E39]/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium"
      >
        Upload any CSV file and watch AI turn your raw data into 
        beautiful visualizations and insightful narratives — 
        <span className="text-fuchsia-600"> in seconds.</span>
      </motion.p>

    </div>
  );
}