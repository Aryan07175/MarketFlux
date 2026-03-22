'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { io } from 'socket.io-client';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  ShoppingCart, TrendingUp, TrendingDown, Zap, Clock, ShieldCheck, Star,
  Package, Truck, RotateCcw, ArrowLeft, Activity, Flame
} from 'lucide-react';

const formatINR = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export default function ProductDetails() {
  const params = useParams();
  const id = params.id;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [qty, setQty] = useState(1);

  const fetchProduct = () => {
    api.get(`/products/${id}`)
      .then(res => { setProduct(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) return;
    fetchProduct();
    const socket = io('http://localhost:5000');
    socket.on('price_updated', (data: any) => {
      if (data.productId === Number(id)) fetchProduct();
    });
    socket.on('product_updated', (data: any) => {
      if (data.productId === Number(id)) {
        setProduct((prev: any) => ({ ...prev, stock: data.stock, currentPrice: data.currentPrice }));
      }
    });
    return () => { socket.disconnect(); };
  }, [id]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleBuy = async () => {
    setPurchasing(true);
    try {
      let token = localStorage.getItem('token');
      if (!token) {
        const r = await api.post('/auth/login', { email: 'buyer@pricepulse.ai', password: 'password123' });
        localStorage.setItem('token', r.data.token);
      }
      await api.post('/orders', { productId: Number(id), quantity: qty });
      showToast(`🎉 Purchased ${qty} × ${product.name}! The AI engine is watching demand...`, 'success');
      fetchProduct();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Purchase failed.', 'error');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return (
    <div className="h-[70vh] flex items-center justify-center">
      <Zap className="w-10 h-10 text-violet-500 animate-pulse" />
    </div>
  );

  if (!product) return (
    <div className="text-center py-20 text-rose-400">Product not found.</div>
  );

  const chartData = product.priceHistory?.map((h: any) => ({
    time: new Date(h.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    price: h.price,
  })) ?? [];

  const disc = Math.round(((product.basePrice - product.currentPrice) / product.basePrice) * 100);
  const isDown = product.currentPrice < product.basePrice;
  const isHot = product.views > 300;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-6 z-50 max-w-sm px-5 py-4 rounded-2xl shadow-2xl flex items-start gap-3 border text-sm font-medium ${
          toast.type === 'success' ? 'bg-emerald-950 border-emerald-500/30 text-emerald-300' : 'bg-rose-950 border-rose-500/30 text-rose-300'
        }`}>
          <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
          {toast.msg}
        </div>
      )}

      {/* Breadcrumb */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-violet-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Main Image */}
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.07] bg-[#111122] aspect-square group">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="flex items-center justify-center h-full text-6xl">📦</div>
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isHot && <span className="flex items-center gap-1 text-xs font-bold bg-rose-600 text-white px-3 py-1 rounded-full"><Flame className="w-3 h-3" /> Hot Item</span>}
              {isDown && disc > 0 && <span className="text-xs font-bold bg-emerald-600 text-white px-3 py-1 rounded-full">-{disc}% OFF</span>}
            </div>
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-xs text-violet-300 px-3 py-1.5 rounded-full border border-violet-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              AI Pricing Active
            </div>
          </div>

          {/* Price History Chart */}
          <div className="bg-[#17172a] border border-white/[0.07] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-400" />
                AI Price Trend
              </h3>
              <span className="text-xs text-neutral-500 bg-white/5 px-3 py-1 rounded-full">ARIMA Model</span>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff07" />
                  <XAxis dataKey="time" stroke="#3f3f5f" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={['dataMin - 500', 'dataMax + 500']} stroke="#3f3f5f" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#0d0d14', border: '1px solid #2d2d50', borderRadius: '12px', color: '#e5e5e5' }}
                    formatter={(v: any) => [formatINR(v), 'Price']}
                  />
                  <Area type="monotone" dataKey="price" stroke="#7c3aed" strokeWidth={2.5} fill="url(#pGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Clock className="w-3.5 h-3.5" />
              Prices are recalculated every minute based on demand & stock levels
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">{product.category}</span>
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(4)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                <Star className="w-3.5 h-3.5" />
                <span className="text-xs text-neutral-400 ml-1">4.2 (2,847 ratings)</span>
              </div>
            </div>
            <h1 className="text-3xl font-black text-white leading-tight">{product.name}</h1>
            <p className="text-neutral-400 leading-relaxed">{product.description}</p>
          </div>

          {/* Price Card */}
          <div className="bg-[#17172a] border border-white/[0.07] rounded-3xl p-7 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-52 h-52 bg-violet-600/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="space-y-1">
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-white">{formatINR(product.currentPrice)}</span>
                {isDown && disc > 0 && (
                  <span className="text-sm text-emerald-400 font-bold bg-emerald-900/40 px-2.5 py-1 rounded-xl mb-1">Save {disc}%</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                {product.currentPrice !== product.basePrice && (
                  <span className="text-neutral-600 line-through">MRP: {formatINR(product.basePrice)}</span>
                )}
                <span className="flex items-center gap-1 text-violet-400 text-xs">
                  {isDown ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  {isDown ? 'AI reduced price due to low demand' : 'High demand — price surged'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                <div className="text-neutral-500 mb-1">Stock Left</div>
                <div className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-violet-400" />
                  {product.stock} Units
                </div>
              </div>
              <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                <div className="text-neutral-500 mb-1">Market Demand</div>
                <div className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-violet-400" />
                  {isHot ? '🔥 Very High' : 'Normal'}
                </div>
              </div>
            </div>

            {/* Qty + Buy */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-400">Qty:</span>
                <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl p-1">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg hover:bg-white/10 transition-colors font-bold text-white flex items-center justify-center">-</button>
                  <span className="w-8 text-center font-bold text-white">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-8 h-8 rounded-lg hover:bg-white/10 transition-colors font-bold text-white flex items-center justify-center">+</button>
                </div>
                <span className="text-sm text-neutral-500">Total: <span className="text-white font-bold">{formatINR(product.currentPrice * qty)}</span></span>
              </div>

              <button
                onClick={handleBuy}
                disabled={purchasing || product.stock === 0}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-extrabold text-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <ShoppingCart className="w-5 h-5" />
                {purchasing ? 'Placing Order...' : product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 text-xs text-center text-neutral-400">
            {[
              { icon: Truck, label: 'Free Delivery', sub: 'Orders above ₹499' },
              { icon: RotateCcw, label: '7-Day Returns', sub: 'No questions asked' },
              { icon: ShieldCheck, label: 'Secure Payment', sub: 'Encrypted checkout' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-[#17172a] border border-white/[0.07] rounded-2xl p-3 space-y-1.5">
                <Icon className="w-5 h-5 mx-auto text-violet-400" />
                <div className="font-semibold text-neutral-300">{label}</div>
                <div className="text-neutral-600">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
