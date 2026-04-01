'use client';

import { motion } from 'framer-motion';
import { Sparkles, BarChart3, Brain } from 'lucide-react';

const features = [
  {
    icon: <Sparkles size={24} />,
    title: 'Auto Analysis',
    description: 'Automatic statistical analysis, correlation detection, and anomaly finding using scikit-learn',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Smart Charts',
    description: 'Auto-generated interactive visualizations tailored to your data types and patterns',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
  },
  {
    icon: <Brain size={24} />,
    title: 'AI Narrative',
    description: 'AI-powered written summary explaining your data insights in plain English',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20',
  },
];

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
          className={`bg-gray-900/50 border ${feature.borderColor} 
                     rounded-xl p-5 text-center hover:bg-gray-900 
                     transition-all duration-300 group cursor-default`}
        >
          <div className={`inline-flex p-2.5 rounded-lg ${feature.bgColor} mb-3 
                          group-hover:scale-110 transition-transform`}>
            <span className={feature.color}>{feature.icon}</span>
          </div>
          <h3 className="text-white font-semibold mb-1.5 text-sm">
            {feature.title}
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            {feature.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
}