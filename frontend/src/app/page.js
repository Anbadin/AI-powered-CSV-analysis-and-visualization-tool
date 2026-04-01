import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FileUpload from '@/components/FileUpload';
import FeatureCards from '@/components/FeatureCards';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      
      {/* Background gradient effect */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-6 py-16">
        <Hero />
        <FileUpload />
        <FeatureCards />

        {/* Footer */}
        <div className="text-center mt-16 text-gray-600 text-sm">
          <p>Built with Next.js, Python, scikit-learn & AI</p>
        </div>
      </main>
      
    </div>
  );
}