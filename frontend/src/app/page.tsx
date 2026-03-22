'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { io } from 'socket.io-client';
import Link from 'next/link';
import {
  Smartphone, Tv2, Shirt, Home as HomeIcon, Dumbbell, BookOpen, Gamepad2, Sparkles,
  TrendingDown, TrendingUp, Flame, Clock, Star, Zap, ChevronRight, Tag
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  currentPrice: number;
  stock: number;
  imageUrl: string;
  views: number;
  category: string;
  seller: { name: string };
}

const CATEGORIES = [
  { label: 'Smartphones', icon: Smartphone, color: 'from-blue-500 to-indigo-600' },
  { label: 'TVs', icon: Tv2, color: 'from-purple-500 to-violet-700' },
  { label: 'Laptops', icon: Zap, color: 'from-pink-500 to-rose-600' },
  { label: 'Fashion', icon: Shirt, color: 'from-amber-500 to-orange-600' },
  { label: 'Home Appliances', icon: HomeIcon, color: 'from-emerald-500 to-teal-600' },
  { label: 'Gaming', icon: Gamepad2, color: 'from-red-500 to-rose-700' },
  { label: 'Sports', icon: Dumbbell, color: 'from-cyan-500 to-sky-600' },
  { label: 'Books', icon: BookOpen, color: 'from-lime-500 to-green-600' },
  { label: 'Skincare', icon: Sparkles, color: 'from-fuchsia-500 to-pink-600' },
];

// Map navbar high-level categories to the actual DB category values
const CATEGORY_MAP: Record<string, string[]> = {
  'Electronics': ['Smartphones', 'TVs', 'Laptops', 'Audio', 'Tablets', 'Cameras', 'Storage', 'Wearables', 'Accessories'],
  'Fashion': ['Footwear', "Men's Fashion", 'Eyewear', 'Watches', "Women's Fashion", 'Bags'],
  'Home & Kitchen': ['Kitchen Appliances', 'Home Appliances', 'Home Decor', 'Kitchen'],
  'Sports': ['Sports', 'Fitness'],
  'Books': ['Books', 'Stationery'],
  'Gaming': ['Gaming'],
  'Beauty': ['Skincare', 'Hair Care'],
};

const formatINR = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const discount = (base: number, current: number) =>
  Math.round(((base - current) / base) * 100);

function ProductCard({ product }: { product: Product }) {
  const disc = discount(product.basePrice, product.currentPrice);
  const isDown = product.currentPrice < product.basePrice;
  const isUp = product.currentPrice > product.basePrice;
  const isHot = product.views > 300;

  return (
    <Link href={`/product/${product.id}`} className="group bg-[#17172a] rounded-2xl border border-white/[0.07] overflow-hidden hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.12)] transition-all duration-300 flex flex-col cursor-pointer">
      
      {/* Image */}
      <div className="relative h-52 bg-[#0f0f1e] overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-700 text-4xl">📦</div>
        )}
        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isHot && (
            <span className="flex items-center gap-1 text-xs font-bold bg-rose-600 text-white px-2.5 py-1 rounded-full shadow-lg">
              <Flame className="w-3 h-3" /> Hot
            </span>
          )}
          {isDown && disc > 0 && (
            <span className="text-xs font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-lg">
              -{disc}%
            </span>
          )}
          {isUp && (
            <span className="text-xs font-bold bg-amber-600 text-white px-2.5 py-1 rounded-full shadow-lg">
              +{Math.abs(disc)}%
            </span>
          )}
        </div>
        {/* AI live badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur text-xs text-violet-300 px-2 py-1 rounded-full border border-violet-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          AI Live
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Category + Rating */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">{product.category}</span>
          <div className="flex items-center gap-0.5 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs text-neutral-400">{(3.5 + Math.random() * 1.5).toFixed(1)}</span>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-auto space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-white">{formatINR(product.currentPrice)}</span>
            {product.currentPrice !== product.basePrice && (
              <span className="text-sm text-neutral-600 line-through">{formatINR(product.basePrice)}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              {isDown ? (
                <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
              ) : isUp ? (
                <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {isDown ? 'Price dropped by AI' : isUp ? 'High demand surge' : 'Stable price'}
            </div>
            <span className="text-xs text-neutral-600">{product.stock} left</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function HomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [priceChanges, setPriceChanges] = useState<Set<number>>(new Set());

  const searchParams = useSearchParams();
  const router = useRouter();
  const urlCategory = searchParams.get('category');
  const urlSearch = searchParams.get('search');

  useEffect(() => {
    api.get('/products').then(res => { setProducts(res.data); setLoading(false); }).catch(() => setLoading(false));
    const socket = io('http://localhost:5000');
    socket.on('price_updated', (data: { productId: number; newPrice: number }) => {
      setProducts(prev => prev.map(p => p.id === data.productId ? { ...p, currentPrice: data.newPrice } : p));
      setPriceChanges(prev => new Set([...prev, data.productId]));
      setTimeout(() => setPriceChanges(prev => { const n = new Set(prev); n.delete(data.productId); return n; }), 3000);
    });
    return () => { socket.disconnect(); };
  }, []);

  // Sync pill state with URL
  useEffect(() => {
    if (urlCategory) {
      // Check if urlCategory matches a CATEGORIES label (pill) or a CATEGORY_MAP key (navbar)
      const pillMatch = CATEGORIES.find(c => c.label === urlCategory);
      if (pillMatch) {
        setActiveCategory(urlCategory);
      } else {
        // It's a navbar high-level category; set it as active for display
        setActiveCategory(urlCategory);
      }
    } else if (!urlSearch) {
      setActiveCategory(null);
    }
  }, [urlCategory, urlSearch]);

  const filtered = useMemo(() => {
    let result = products;

    // URL search filter
    if (urlSearch) {
      const q = urlSearch.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
      return result;
    }

    // URL / pill category filter
    const cat = urlCategory || activeCategory;
    if (!cat) return result;

    // Special navbar categories
    if (cat === "Today's Deals") {
      return result.filter(p => p.currentPrice < p.basePrice);
    }
    if (cat === 'New Arrivals') {
      return result.slice(-8);
    }
    if (cat === 'Trending') {
      return [...result].sort((a, b) => b.views - a.views).slice(0, 12);
    }

    // Check CATEGORY_MAP (high-level navbar groups)
    const mapped = CATEGORY_MAP[cat];
    if (mapped) {
      return result.filter(p => mapped.includes(p.category));
    }

    // Direct match (individual pill categories like "Smartphones", "Gaming", etc.)
    return result.filter(p => p.category === cat);
  }, [products, activeCategory, urlCategory, urlSearch]);

  const hotDeals = useMemo(() => products.filter(p => p.currentPrice < p.basePrice).slice(0, 4), [products]);

  const handlePillClick = (cat: string | null) => {
    if (cat) {
      router.push(`/?category=${encodeURIComponent(cat)}`);
    } else {
      router.push('/');
    }
    setActiveCategory(cat);
  };

  const displayTitle = urlSearch
    ? `Search: "${urlSearch}"`
    : activeCategory || 'All Products';

  return (
    <div className="min-h-screen">
      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0d0d20] via-[#130d2e] to-[#0d1520]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-0 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-4 py-2 rounded-full">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Powered by ARIMA + ML Forecasting Engine
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-200 to-neutral-500">
              Prices that<br />think for you
            </h1>
            <p className="text-lg text-neutral-400 max-w-lg leading-relaxed">
              India&apos;s first AI marketplace where prices adjust in real-time based on demand, supply, and market conditions. Never overpay again.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="#products" className="px-7 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all duration-200 shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)]">
                Shop Now
              </Link>
              <a href="#" className="px-7 py-3.5 border border-white/10 text-neutral-300 hover:text-white hover:border-white/20 font-semibold rounded-xl transition-all duration-200">
                How AI Pricing Works →
              </a>
            </div>
            <div className="flex items-center gap-8 pt-2 justify-center lg:justify-start text-sm">
              {[['32+', 'Products'], ['₹0', 'Hidden Fees'], ['1min', 'Price Updates']].map(([v, l]) => (
                <div key={l} className="text-center">
                  <div className="text-2xl font-black text-violet-400">{v}</div>
                  <div className="text-neutral-500 text-xs">{l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Hero Floating Card */}
          <div className="flex-shrink-0 relative">
            <div className="w-72 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center gap-2 text-xs text-violet-400 font-medium"><Zap className="w-3.5 h-3.5" /> Live AI Price Update</div>
              <div className="space-y-3">
                {products.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-2.5 bg-white/[0.04] rounded-xl">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                      <div className="text-xs text-violet-400 font-bold">{formatINR(p.currentPrice)}</div>
                    </div>
                    {p.currentPrice < p.basePrice && <TrendingDown className="flex-shrink-0 w-4 h-4 text-emerald-400" />}
                  </div>
                ))}
              </div>
              <div className="text-center text-xs text-neutral-600">Prices last updated: just now</div>
            </div>
            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)]">
              <span className="text-white font-black text-lg leading-none">AI</span>
              <span className="text-violet-200 text-[9px] font-bold uppercase tracking-widest">Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY PILLS */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => handlePillClick(null)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${!activeCategory && !urlSearch ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/30' : 'border-white/10 text-neutral-400 hover:border-white/20 hover:text-white'}`}
          >
            All
          </button>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = activeCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => handlePillClick(active ? null : cat.label)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${active ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/30' : 'border-white/10 text-neutral-400 hover:border-white/20 hover:text-white'}`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* SHOP BY CATEGORY GRID */}
      <section className="max-w-7xl mx-auto px-6 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">Shop by Category</h2>
          <button className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors">See all <ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.label}
                onClick={() => handlePillClick(cat.label)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-white/[0.07] hover:border-violet-500/40 bg-[#17172a] hover:bg-[#1e1e35] transition-all duration-200 group text-center"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-neutral-400 group-hover:text-white font-medium leading-tight">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* HOT DEALS BANNER */}
      {hotDeals.length > 0 && !activeCategory && !urlSearch && (
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-900/50 via-[#1a0f25] to-violet-900/50 border border-rose-500/20 p-6">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(239,68,68,0.12),transparent_60%)]" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-5">
                <Flame className="w-6 h-6 text-rose-400" />
                <h2 className="text-2xl font-black text-white">🔥 Hot Deals — AI Price Drops</h2>
                <div className="ml-auto flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" /> Limited Time
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hotDeals.map(p => (
                  <Link href={`/product/${p.id}`} key={p.id} className="bg-black/30 border border-white/5 rounded-2xl p-4 hover:border-rose-500/30 transition-all duration-200 group space-y-3">
                    <div className="h-32 rounded-xl overflow-hidden">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white line-clamp-2 leading-snug">{p.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-black text-emerald-400">{formatINR(p.currentPrice)}</span>
                        <span className="text-xs bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold">-{discount(p.basePrice, p.currentPrice)}%</span>
                      </div>
                      <p className="text-xs text-neutral-600 line-through">{formatINR(p.basePrice)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MAIN PRODUCT GRID */}
      <section id="products" className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white">
              {displayTitle}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">{filtered.length} products — prices updating live via AI</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            Real-Time AI Pricing Active
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#17172a] rounded-2xl h-80 animate-pulse border border-white/5" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-neutral-600">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No products in this category yet.</p>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(p => (
              <div key={p.id} className={priceChanges.has(p.id) ? 'ring-2 ring-violet-500 rounded-2xl' : ''}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-neutral-500">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
