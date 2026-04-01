'use client';

import { motion } from 'framer-motion';
import { Sparkles, BarChart3, Brain } from 'lucide-react';

const features = [
  {
    icon: <Sparkles size={28} />,
    title: 'Auto Analysis',
    description: 'Automatic statistical analysis, correlation detection, and anomaly finding using scikit-learn',
    borderColor: 'border-fuchsia-500/40',
  },
  {
    icon: <BarChart3 size={28} />,
    title: 'Smart Charts',
    description: 'Auto-generated interactive visualizations tailored to your data types and patterns',
    borderColor: 'border-pink-500/40',
  },
  {
    icon: <Brain size={28} />,
    title: 'AI Narrative',
    description: 'AI-powered written summary explaining your data insights in plain English',
    borderColor: 'border-purple-500/40',
  },
];

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className={`bg-[#2C2E39] border ${feature.borderColor} 
                     rounded-[2rem] p-8 text-center shadow-2xl
                     hover:border-white transition-all duration-300 group cursor-default`}
        >
          {/* Cream Icon Box - Matches the Upload box icon style */}
          <div className="inline-flex p-5 rounded-2xl bg-[#FFFDF2] mb-6 
                          shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)]
                          group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <span className="text-fuchsia-600">{feature.icon}</span>
          </div>

          <h3 className="text-white font-black mb-3 text-lg tracking-tight uppercase">
            {feature.title}
          </h3>

          <p className="text-gray-400 text-sm leading-relaxed font-medium">
            {feature.description}
          </p>

          {/* Bottom Accent Line - subtle glow on hover */}
          <div className="mt-6 w-12 h-1 bg-fuchsia-500/20 mx-auto rounded-full 
                          group-hover:w-20 group-hover:bg-fuchsia-500 transition-all duration-500" />
        </motion.div>
      ))}
    </div>
  );
}