import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'StockSense — Inventory Management System',
  description: 'Know your stock. Move smarter.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="relative min-h-screen text-[#141414] bg-[#E6E6E6] antialiased selection:bg-[#1C1C1C] selection:text-white">
        <div className="canvas-ambient-circle-1" aria-hidden="true" />
        <div className="canvas-ambient-circle-2" aria-hidden="true" />
        <div className="relative z-10 min-h-screen flex flex-col">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}
