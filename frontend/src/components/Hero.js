'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <div className="text-center mb-12">
      
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 bg-blue-500/10 
                   border border-blue-500/20 text-blue-400 
                   px-4 py-1.5 rounded-full text-sm mb-6"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        Powered by AI & Machine Learning
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
      >
        Smart Data Story
        <br />
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Generator
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
      >
        Upload any CSV file and watch AI turn your raw data into 
        beautiful visualizations and insightful narratives — 
        <span className="text-gray-300"> in seconds.</span>
      </motion.p>

    </div>
  );
}