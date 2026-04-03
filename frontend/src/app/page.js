import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FileUpload from '@/components/FileUpload';
import FeatureCards from '@/components/FeatureCards';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFDF2]">
      
      <div className="fixed inset-0 bg-gradient-to-b from-fuchsia-500/5 via-transparent to-transparent pointer-events-none" />
      
      <Navbar />

      <main className="relative max-w-4xl mx-auto px-6 py-16">
        <Hero />
        <FileUpload />
        <FeatureCards />
      </main>

      <Footer />
      
    </div>
  );
}