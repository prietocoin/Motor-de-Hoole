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
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';

interface MarketData {
  precio_bcv: string;
  precio_usdt: string;
  brecha_porcentaje: string;
  id?: string;
  timestamp?: string;
  status?: string;
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
        timestamp: new Date().toLocaleTimeString(),
        status: d.status || 'estable'
      });
      setLoading(false);
    } catch (err) {
      console.error("Fallo de conexión:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasInteracted) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [hasInteracted, fetchData]);

  if (!hasInteracted) {
    return (
      <div className="h-screen flex items-center justify-center p-6 bg-[#050608]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass-panel p-12 max-w-sm w-full text-center border-white/10 rounded-[40px]"
        >
          <div className="relative flex justify-center mb-10">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-24 h-24 mx-auto border-t-2 border-[#e2b053]/20 rounded-full"
            />
            <div className="w-24 h-24 rounded-full bg-[#121415] flex items-center justify-center border border-[#e2b053]/30 shadow-[0_0_40px_rgba(226,176,83,0.15)] relative z-10">
              <ShieldCheck size={48} className="text-[#e2b053]" />
            </div>
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tighter uppercase italic">HOOLE <span className="gold-text">PRO</span></h1>
          <p className="text-white/40 text-[10px] mb-12 leading-relaxed uppercase tracking-[0.4em] font-bold">TERMINAL DE ALTO NIVEL V7.1</p>
          <button
            onClick={() => setHasInteracted(true)}
            className="w-full py-5 bg-gradient-to-br from-[#e2b053] to-[#ffb347] text-black font-black text-lg rounded-3xl shadow-[0_15px_35px_rgba(226,176,83,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest"
          >
            Sincronizar
          </button>
        </motion.div>
      </div>
    );
  }

  const gapValue = parseFloat(data?.brecha_porcentaje.replace(',', '.') || '0');
  const dashOffset = 440 - (440 * Math.min(gapValue, 25) / 25);

  return (
    <div className="h-screen flex flex-col bg-[#050608] relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#e2b053]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#ffb347]/5 blur-[120px] rounded-full" />

      {/* Header */}
      <header className="pt-10 px-8 flex justify-between items-center z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#e2b053]" />
            <span className="text-xl font-black tracking-tighter uppercase italic text-white flex items-center">
              HOOLE<span className="gold-text ml-1">MONITOR</span>
            </span>
          </div>
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-0.5 ml-6">FINTECH PREMIUM</span>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 text-white/40 hover:text-[#e2b053] transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 text-white/40">
            <Bell size={18} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 space-y-10 z-10 overflow-y-auto pb-32">
        {/* Central Gauge */}
        <div className="relative flex items-center justify-center pt-6">
          <svg width="220" height="220" viewBox="0 0 160 160" className="transform -rotate-90">
            <circle className="gauge-background" cx="80" cy="80" r="70" />
            <motion.circle
              initial={{ strokeDashoffset: 440 }}
              animate={{ strokeDashoffset: dashOffset }}
              className="gauge-fill"
              cx="80" cy="80" r="70"
              strokeDasharray="440"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={data?.brecha_porcentaje}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="flex items-baseline justify-center">
                  <span className="text-6xl font-black gold-text tracking-tighter">
                    {data?.brecha_porcentaje || '0.0'}
                  </span>
                  <span className="text-2xl font-bold text-[#e2b053] ml-1">%</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${data?.status === 'subiendo' ? 'bg-[#00d49a]' : data?.status === 'bajando' ? 'bg-[#ff4b4b]' : 'bg-white/20'} animate-pulse`} />
                  <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.4em]">EL GAP</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="w-full grid grid-cols-2 gap-4">
          {/* Card USDT */}
          <div className="glass-panel p-6 rounded-[32px] border-white/10 group cursor-pointer hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-[#e2b053]/10 rounded-xl text-[#e2b053]">
                <TrendingUp size={16} />
              </div>
              <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">USDT BINANCE</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/30 font-bold mb-1">Bs.</span>
              <span className="text-3xl font-black text-white tracking-tighter">
                {data?.precio_usdt || '0.00'}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 opacity-40">
              <svg viewBox="0 0 100 20" className="w-full h-5">
                <path className="sparkline-path" d="M0,15 Q15,5 30,12 T60,8 T100,14" />
              </svg>
            </div>
          </div>

          {/* Card BCV */}
          <div className="glass-panel p-6 rounded-[32px] border-white/10 group cursor-pointer hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white/5 rounded-xl text-white/60">
                <Home size={16} />
              </div>
              <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">OFICIAL BCV</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/30 font-bold mb-1">Bs.</span>
              <span className="text-3xl font-black text-white/80 tracking-tighter">
                {data?.precio_bcv || '0.00'}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 opacity-20">
              <svg viewBox="0 0 100 20" className="w-full h-5">
                <path className="sparkline-path" stroke="white" d="M0,5 Q20,15 40,8 T70,12 T100,5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Trend Info */}
        <div className="w-full glass-panel p-6 rounded-[32px] border-white/10 relative">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00d49a]/10 rounded-lg text-[#00d49a]">
                <Clock size={14} />
              </div>
              <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">HISTORIAL 24H</span>
            </div>
            <ChevronRight size={16} className="text-white/20" />
          </div>
          <div className="h-20 w-full relative">
            <svg viewBox="0 0 400 100" className="w-full h-full">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e2b053" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#e2b053" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path fill="url(#chartGrad)" d="M0,100 L0,60 Q50,20 100,50 T200,30 T300,70 T400,40 L400,100 Z" />
              <path fill="none" stroke="#e2b053" strokeWidth="3" strokeLinecap="round" d="M0,60 Q50,20 100,50 T200,30 T300,70 T400,40" />
            </svg>
          </div>
          <div className="flex justify-between pt-4 text-[8px] font-black text-white/10 tracking-[0.2em]">
            <span>MAÑANA</span><span>TARDE</span><span>NOCHE</span>
          </div>
        </div>
      </main>

      {/* Navigation */}
      <nav className="nav-bar fixed bottom-0 left-0 right-0 h-24 flex justify-around items-center px-10 z-20 rounded-t-[40px]">
        <div className="nav-item flex flex-col items-center gap-1.5">
          <Home size={22} /><span className="text-[8px] font-black uppercase tracking-widest">Inicio</span>
        </div>
        <div className="nav-item active flex flex-col items-center gap-1.5">
          <div className="relative">
            <BarChart2 size={24} />
            <div className="absolute top-[-4px] right-[-4px] w-2 h-2 bg-[#e2b053] rounded-full shadow-[0_0_8px_rgba(226,176,83,0.6)]" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">Monitor</span>
        </div>
        <div className="nav-item flex flex-col items-center gap-1.5">
          <Wallet size={22} /><span className="text-[8px] font-black uppercase tracking-widest">Datos</span>
        </div>
        <div className="nav-item flex flex-col items-center gap-1.5 text-white/20">
          <User size={22} /><span className="text-[8px] font-black uppercase tracking-widest">Perfil</span>
        </div>
      </nav>
    </div>
  );
}
