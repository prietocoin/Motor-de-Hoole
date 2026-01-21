import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BarChart2,
  Wallet,
  User,
  TrendingUp,
  RefreshCw,
  Bell,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface MarketData {
  precio_bcv: string;
  precio_usdt: string;
  brecha_porcentaje: string;
  id?: string;
  timestamp?: string;
}

export default function App() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/precio-actual');
      let result;

      if (!response.ok) {
        const altResponse = await fetch('/api/market-data');
        if (!altResponse.ok) throw new Error("API Offline");
        result = await altResponse.json();
      } else {
        result = await response.json();
      }

      const d = Array.isArray(result) ? result[0] : (result.analisis || result);

      if (!d || (!d.precio_bcv && !d.precio_usdt)) {
        console.warn("Datos inválidos:", result);
        return;
      }

      setLastId(d.id || JSON.stringify(d));
      setData({
        precio_bcv: String(d.precio_bcv || '0.00'),
        precio_usdt: String(d.precio_usdt || '0.00'),
        brecha_porcentaje: String(d.brecha_porcentaje || '0%').replace('%', ''),
        timestamp: new Date().toLocaleTimeString()
      });
      setLoading(false);
    } catch (err) {
      console.error("Fallo de conexión:", err);
      setLoading(false);
    }
  }, [lastId]);

  useEffect(() => {
    if (hasInteracted) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [hasInteracted, fetchData]);

  if (!hasInteracted) {
    return (
      <div className="h-screen flex items-center justify-center p-6 bg-[#121418]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-12 max-w-md text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(226,176,83,0.1)]">
              <ShieldCheck size={40} className="text-[#e2b053]" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Hoole <span className="gold-text">Premium</span></h1>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed uppercase tracking-[0.2em] font-medium">Terminal de Monitoreo V3.0</p>
          <button
            onClick={() => setHasInteracted(true)}
            className="w-full py-5 bg-gradient-to-r from-[#e2b053] to-[#ffb347] text-black font-bold text-lg rounded-2xl shadow-[0_10px_20px_rgba(226,176,83,0.3)] hover:scale-[1.02] transition-transform"
          >
            INICIAR MONITOR
          </button>
        </motion.div>
      </div>
    );
  }

  const gapValue = parseFloat(data?.brecha_porcentaje.replace(',', '.') || '0');
  const dashOffset = 440 - (440 * Math.min(gapValue, 25) / 25);

  return (
    <div className="h-screen flex flex-col bg-[#121418] relative overflow-hidden">
      <header className="pt-8 px-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white">Hoole: <span className="gold-text">Gap Monitor</span></span>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchData} className="p-2 bg-white/5 rounded-full border border-white/10 text-white/60">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="p-2 bg-white/5 rounded-full border border-white/10 text-white/60">
            <Bell size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 space-y-8 z-10 overflow-y-auto pb-24">
        <div className="relative flex items-center justify-center mt-4">
          <svg width="240" height="240" viewBox="0 0 160 160" className="transform -rotate-90">
            <circle className="gauge-background" cx="80" cy="80" r="70" />
            <motion.circle
              initial={{ strokeDashoffset: 440 }}
              animate={{ strokeDashoffset: dashOffset }}
              className="gauge-fill"
              cx="80" cy="80" r="70"
              strokeDasharray="440"
            />
          </svg>
          <div className="absolute text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={data?.brecha_porcentaje}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col"
              >
                <span className="text-5xl font-extrabold gold-text tracking-tighter">
                  {data?.brecha_porcentaje || '--'}%
                </span>
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em] mt-1">THE GAP</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-4">
          <div className="glass-panel p-5 space-y-3 relative overflow-hidden group">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#e2b053]/10 rounded-lg text-[#e2b053]">
                  <TrendingUp size={14} />
                </div>
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">USDT Binance</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white/40 font-medium">Bs.</span>
              <span className="text-2xl font-bold gold-text tracking-tighter">
                {data?.precio_usdt || '---'}
              </span>
            </div>
            <svg viewBox="0 0 100 30" className="w-full h-8 opacity-40">
              <path className="sparkline-path" d="M0,25 Q15,5 30,20 T60,10 T100,22" />
            </svg>
          </div>

          <div className="glass-panel p-5 space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg text-white/60">
                  <Home size={14} />
                </div>
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Official BCV</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white/40 font-medium">Bs.</span>
              <span className="text-2xl font-bold text-white tracking-tighter">
                {data?.precio_bcv || '---'}
              </span>
            </div>
            <svg viewBox="0 0 100 30" className="w-full h-8 opacity-20">
              <path className="sparkline-path" stroke="white" d="M0,5 Q20,25 40,15 T70,20 T100,8" />
            </svg>
          </div>
        </div>

        <div className="w-full glass-panel p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">24H GAP TREND</span>
            <ChevronRight size={14} className="text-white/20" />
          </div>
          <div className="h-24 w-full relative">
            <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d49a" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path className="area-gradient" d="M0,100 L0,60 Q50,20 100,50 T200,30 T300,70 T400,40 L400,100 Z" />
              <path className="sparkline-path" d="M0,60 Q50,20 100,50 T200,30 T300,70 T400,40" strokeWidth="3" />
            </svg>
            <div className="flex justify-between mt-2 text-[8px] font-black text-white/20 tracking-tighter uppercase px-1">
              <span>08:00</span><span>09:00</span><span>12:00</span><span>18:00</span><span>04:00</span>
            </div>
          </div>
        </div>
      </main>

      <nav className="nav-bar fixed bottom-0 left-0 right-0 h-20 flex justify-around items-center px-6 z-20">
        <div className="nav-item flex flex-col items-center gap-1">
          <Home size={22} /><span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
        </div>
        <div className="nav-item active flex flex-col items-center gap-1">
          <BarChart2 size={24} /><span className="text-[9px] font-bold uppercase tracking-widest">Monitor</span>
        </div>
        <div className="nav-item flex flex-col items-center gap-1">
          <Wallet size={22} /><span className="text-[9px] font-bold uppercase tracking-widest">Wallet</span>
        </div>
        <div className="nav-item flex flex-col items-center gap-1">
          <User size={22} /><span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
        </div>
      </nav>
    </div>
  );
}
