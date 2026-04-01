'use client';

// Change "Github" to "Terminal" (or "LayoutGrid")
import { BarChart3, Terminal } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800/50 px-6 py-4 backdrop-blur-sm bg-gray-950/80 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <BarChart3 size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Data<span className="text-blue-400">Story</span>
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm hidden sm:block font-mono">
            AI-Powered Analysis
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-400 
                       hover:text-white transition-colors text-sm
                       border border-gray-800 px-3 py-1.5 rounded-lg
                       hover:border-gray-600 bg-gray-900/50"
          >
            {/* Use the Terminal icon here instead of Github */}
            <Terminal size={18} />
            <span className="hidden sm:inline">Source Code</span>
          </a>
        </div>

      </div>
    </nav>
  );
}