import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
}

export function MainLayout({ children, headerTitle, headerSubtitle }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors flex flex-col">
      <Header title={headerTitle} subtitle={headerSubtitle} />
      <main className="container mx-auto px-4 py-6 max-w-6xl flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
