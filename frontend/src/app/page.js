import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FileUpload from '@/components/FileUpload';
import FeatureCards from '@/components/FeatureCards';

export default function Home() {
  return (
    /* The main background is your premium cream */
    <div className="min-h-screen bg-[#FFFDF2] selection:bg-fuchsia-100">
      
      {/* Navbar sits at the very top */}
      <Navbar />

      {/* MAIN CONTENT 
          - Changed 'py-16' to 'pt-2 pb-20': 
            'pt-2' significantly reduces the gap below the Navbar.
          - Changed 'max-w-4xl' to 'max-w-6xl' to let your 
            Feature Cards and Upload box breathe better.
      */}
      <main className="relative max-w-6xl mx-auto px-6 pt-2 pb-20">
        
        <Hero />
        
        {/* Added a bit of negative margin or tight spacing here if needed, 
            but the components themselves now handle the internal layout. */}
        <div className="mt-4">
          <FileUpload />
        </div>

        <div className="mt-12">
          <FeatureCards />
        </div>

        {/* Updated Footer: Using your Cool Charcoal color with low opacity */}
        <footer className="text-center mt-24 border-t border-[#2C2E39]/5 pt-8">
          <p className="text-[#2C2E39]/40 text-xs font-bold uppercase tracking-[0.2em]">
            Built with Next.js • Python • scikit-learn • AI
          </p>
          <p className="text-[#2C2E39]/20 text-[10px] mt-2 font-medium">
            &copy; {new Date().getFullYear()} SafiNia Analytics. All rights reserved.
          </p>
        </footer>
      </main>
      
    </div>
  );
}