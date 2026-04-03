'use client';

import { Bot, ShieldUser, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-20 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Left */}
          <div className="text-center md:text-left">
            <p className="text-gray-500 flex flex-wrap justify-center gap-2">
              Built with ❤️ by ANANT BAGLA
            </p>
            <p className="text-gray-600 text-xs mt-1">
              © {new Date().getFullYear()} SafiNia
            </p>
          </div>

          {/* Right - Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Anbadin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors p-2 
                         hover:bg-gray-800 rounded-lg"
            >
              <Bot size={18} />
            </a>
            <a
              href="https://www.linkedin.com/in/anant-bagla-6b2154342/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-400 transition-colors p-2 
                         hover:bg-gray-800 rounded-lg"
            >
              <ShieldUser size={18} />
            </a>
            <a
              href="mailto:anantbagla0606@gmail.com"
              className="text-gray-500 hover:text-fuchsia-400 transition-colors p-2 
                         hover:bg-gray-800 rounded-lg"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {['Next.js', 'React', 'Tailwind CSS', 'Python', 'FastAPI', 'pandas', 'scikit-learn', 'Gemini AI', 'Recharts'].map((tech) => (
            <span
              key={tech}
              className="text-[10px] text-gray-500 border border-gray-800 
                         px-2 py-1 rounded-full uppercase tracking-wider"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}