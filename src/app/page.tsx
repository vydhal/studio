import { HomeContent } from '@/components/home/HomeContent';
import { Header } from '@/components/shared/Header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HomeContent />
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            © {new Date().getFullYear()} Firebase School Central. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
