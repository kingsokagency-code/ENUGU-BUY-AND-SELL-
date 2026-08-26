import type { Metadata, Viewport } from 'next';
import './globals.css';

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
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#087443',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased w-full max-w-full overflow-x-hidden">
      <body className="min-h-full bg-[#FAFAF8] text-[#111111] font-sans selection:bg-[#087443] selection:text-white flex flex-col w-full max-w-full overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
