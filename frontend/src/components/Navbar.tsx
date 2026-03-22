'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Bell, ChevronDown, Menu, X, Zap, MapPin, User } from 'lucide-react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Sports', 'Books', 'Gaming', 'Beauty'];

  const handleCategoryClick = (cat: string) => {
    router.push(`/?category=${encodeURIComponent(cat)}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-violet-700 text-white text-xs px-4 py-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> AI Pricing Active — Prices update every minute based on demand!</span>
        <span className="hidden md:flex items-center gap-3"><a href="#" className="hover:underline">Sell on PricePulse</a><a href="#" className="hover:underline">Download App</a></span>
      </div>

      {/* Main Navbar */}
      <div className="bg-[#13131f] border-b border-white/[0.06] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-4">
          
          {/* Logo */}
          <a href="/" className="flex-shrink-0 flex items-center gap-2 mr-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-4.5 h-4.5 text-white fill-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-white hidden sm:block">
              Price<span className="text-violet-400">Pulse</span>
            </span>
          </a>

          {/* Location */}
          <button className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors flex-shrink-0 border border-white/10 px-3 py-1.5 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-violet-400" />
            Deliver to <span className="font-semibold text-neutral-200 ml-1">India</span>
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center bg-[#1e1e30] border border-white/10 rounded-xl overflow-hidden focus-within:border-violet-500 transition-colors duration-200">
            <select className="bg-transparent text-neutral-400 text-sm px-3 py-2.5 border-r border-white/10 outline-none cursor-pointer hidden md:block">
              <option>All</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands and categories..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-neutral-600 text-neutral-100"
            />
            <button type="submit" className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 transition-colors">
              <Search className="w-5 h-5 text-white" />
            </button>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="hidden md:flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-xs text-neutral-300 gap-0.5">
              <User className="w-5 h-5" />
              <span>Account</span>
            </button>
            <button className="hidden md:flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-xs text-neutral-300 gap-0.5 relative">
              <Bell className="w-5 h-5" />
              <span>Alerts</span>
              <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-xs text-neutral-300 gap-0.5 relative">
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
            </button>
          </div>
        </div>

        {/* Category Nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 hidden md:flex items-center h-10 gap-1 text-xs font-medium text-neutral-400">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-white/5 hover:text-white transition-colors"
          >
            <Menu className="w-4 h-4" /> All Categories
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          {["Today's Deals", 'New Arrivals', 'Trending', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className="px-3 py-1.5 rounded-md hover:bg-white/5 hover:text-white transition-colors whitespace-nowrap"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
