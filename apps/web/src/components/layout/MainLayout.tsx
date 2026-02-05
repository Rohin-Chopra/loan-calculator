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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors flex flex-col">
      <Header title={headerTitle} subtitle={headerSubtitle} />
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
