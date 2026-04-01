'use client';

import { BarChart3, Bot } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800/50 px-6 py-4 backdrop-blur-sm bg-gray-950/80 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-fuchsia-600 p-1.5 rounded-lg">
            <BarChart3 size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Safi<span className="text-fuchsia-400">Nia</span>
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm hidden sm:block">
            AI-Powered Data Analysis
          </span>
          <a
            href="https://github.com/Anbadin/AI-powered-CSV-analysis-and-visualization-tool"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-400 
                       hover:text-white transition-colors text-sm
                       border border-gray-800 px-3 py-1.5 rounded-lg
                       hover:border-gray-600"
          >
            <Bot size={16} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>

      </div>
    </nav>
  );
}