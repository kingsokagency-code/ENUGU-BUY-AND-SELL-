import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'Enugu Buy & Sell — Powered by KINGSOK',
  description: 'Find what you need. Sell what you have. Trusted hyperlocal campus marketplace in Enugu.',
  keywords: ['Enugu', 'student marketplace', 'buy sell', 'shops', 'hyperlocal', 'UNEC', 'UNN'],
  openGraph: {
    title: 'Enugu Buy & Sell — Powered by KINGSOK',
    description: 'Discover local shops, products, and direct seller chat in Enugu.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#087443',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-[#FAFAF8] text-[#111111] font-sans selection:bg-[#087443] selection:text-white flex flex-col">
        <Navbar />
        <main className="flex-1 pb-20 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

