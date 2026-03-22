import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PricePulse AI | Smart Shopping, Smarter Prices',
  description: 'India\'s #1 AI-powered dynamic pricing marketplace. Real-time price predictions on 10,000+ products.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0d0d14] text-neutral-100 min-h-screen`}>
        <Navbar />
        {children}
        {/* Footer */}
        <footer className="border-t border-white/5 bg-black/40 mt-20">
          <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm text-neutral-500">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="font-black text-2xl text-white tracking-tight">PricePulse<span className="text-violet-500">AI</span></div>
              <p className="leading-relaxed">India&apos;s smartest marketplace. AI-driven dynamic pricing designed to save you money.</p>
            </div>
            {[
              { head: 'Shop', links: ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports'] },
              { head: 'Company', links: ['About Us', 'Blog', 'Press Kit', 'Careers', 'Contact'] },
              { head: 'Support', links: ['Help Center', 'Returns', 'Shipping Info', 'Seller Hub', 'Privacy Policy'] },
            ].map(col => (
              <div key={col.head} className="space-y-3">
                <div className="font-bold text-neutral-300">{col.head}</div>
                {col.links.map(l => (
                  <div key={l} className="hover:text-white cursor-pointer transition-colors">{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 text-center py-5 text-xs text-neutral-600">
            © 2026 PricePulse AI. All rights reserved. Prices are AI-generated and may change dynamically.
          </div>
        </footer>
      </body>
    </html>
  );
}
