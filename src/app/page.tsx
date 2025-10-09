import { HomeContent } from '@/components/home/HomeContent';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container">
        <HomeContent />
      </main>
      <Footer />
    </div>
  );
}
