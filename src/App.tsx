import { useState, useEffect, useCallback, useRef } from 'react';
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
  Volume2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';

interface MarketData {
  precio_bcv: string;
  precio_usdt: string;
  brecha_porcentaje: string;
  id?: string;
  timestamp?: string;
  status: 'subiendo' | 'bajando' | 'estable';
  alerta_audio: boolean;
  mostrar_banner: boolean;
  brecha_bs: string;
}

export default function App() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastIdRef = useRef<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/precio-actual');
      const result = await response.json();
      
      const d = Array.isArray(result) ? result[0] : (result.analisis || result);

      if (!d || (!d.precio_bcv && !d.precio_usdt)) return;

      const newData: MarketData = {
        precio_bcv: String(d.precio_bcv || '0.00'),
        precio_usdt: String(d.precio_usdt || '0.00'),
        brecha_porcentaje: String(d.brecha_porcentaje || '0%').replace('%', ''),
        id: String(d.id),
        status: (d.status || 'estable') as any,
        alerta_audio: !!d.alerta_audio,
        mostrar_banner: !!d.mostrar_banner,
        brecha_bs: String(d.brecha_bs || '0.00'),
        timestamp: new Date().toLocaleTimeString()
      };

      // Manejo de Alertas y Audio
      if (newData.id !== lastIdRef.current) {
        if (newData.alerta_audio && audioRef.current) {
          audioRef.current.play().catch(() => console.log("Audio blocked"));
        }
        if (newData.mostrar_banner) {
          setBannerVisible(true);
          setTimeout(() => setBannerVisible(false), 8000);
        }
        lastIdRef.current = newData.id || null;
      }

      setData(newData);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
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
      <div className="h-screen flex items-center justify-center p-8 bg-[#050608] selection:bg-[#e2b053]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-panel p-12 max-w-sm w-full text-center border-[#e2b053]/20"
        >
          <div className="relative w-32 h-32 mx-auto mb-10 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-[#e2b053]/10 rounded-full"
            />
            <div className="w-24 h-24 rounded-full bg-[#e2b053]/5 border border-[#e2b053]/30 flex items-center justify-center shadow-[0_0_50px_rgba(226,176,83,0.1)]">
              <ShieldCheck size={48} className="text-[#e2b053]" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold rajdhani gold-text tracking-tighter mb-4 italic">HOOLE ULTRA</h1>
          <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.5em] mb-12">Fintech Terminal V7.14</p>
          <button
            onClick={() => setHasInteracted(true)}
            className="w-full py-5 bg-gradient-to-br from-[#e2b053] to-[#ffb347] text-black font-black text-lg rounded-[24px] shadow-[0_15px_40px_rgba(226,176,83,0.25)] hover:scale-[1.03] active:scale-[0.98] transition-all uppercase tracking-widest"
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
    <div className="h-screen flex flex-col bg-[#050608] relative overflow-hidden app-container">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      
      {/* Dynamic Marketing Banner (30px) */}
      <AnimatePresence>
        {bannerVisible && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 32 }}
            exit={{ height: 0 }}
            className="bg-gradient-to-r from-[#e2b053] to-[#ffb347] flex items-center justify-center overflow-hidden z-[100]"
          >
            <span className="text-[10px] font-black text-black uppercase tracking-[0.3em] flex items-center gap-2">
              <AlertTriangle size={12} /> Oportunidad de Arbitraje Detectada <AlertTriangle size={12} />
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="pt-8 px-8 flex justify-between items-center z-50">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-[#e2b053] fill-[#e2b053]/20" />
            <span className="text-2xl font-black rajdhani tracking-tighter uppercase italic gold-text">
              HOOLE<span className="text-white opacity-90 ml-1">MONITOR</span>
            </span>
          </div>
          <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] ml-7">System Ultra-Premium</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => fetchData()} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 text-white/40 hover:text-[#e2b053] transition-all active:scale-90">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 text-white/40 relative">
            <Bell size={20} />
            <div className="absolute top-3 right-3 w-2 h-2 bg-[#ff4b4b] rounded-full shadow-[0_0_8px_rgba(255,75,75,0.6)]" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 space-y-12 z-10 overflow-hidden pb-24">
        
        {/* Central Display */}
        <div className="relative group p-4">
          <div className="absolute inset-0 bg-[#e2b053]/5 blur-[60px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
          <svg width="240" height="240" viewBox="0 0 160 160" className="transform -rotate-90 animate-float">
            <circle className="gauge-background" cx="80" cy="80" r="72" />
            <motion.circle
              initial={{ strokeDashoffset: 440 }}
              animate={{ strokeDashoffset: dashOffset }}
              className="gauge-fill"
              cx="80" cy="80" r="72"
              strokeDasharray="440"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={data?.brecha_porcentaje}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center">
                  <span className="text-7xl font-black rajdhani gold-text tracking-tighter leading-none">
                    {data?.brecha_porcentaje || '0.00'}
                  </span>
                  <span className="text-2xl font-bold text-[#e2b053] ml-1 mt-6">%</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center mt-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
                  <div className={`w-1.5 h-1.5 rounded-full ${data?.status === 'subiendo' ? 'bg-[#00d49a]' : data?.status === 'bajando' ? 'bg-[#ff4b4b]' : 'bg-white/20'} shadow-lg`} />
                  <span className="text-[9px] text-white/50 font-black uppercase tracking-[0.4em]">THE GAP</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dynamic Metrics */}
        <div className="w-full grid grid-cols-2 gap-5 px-2">
          {/* Binance */}
          <div className="glass-panel p-6 border-[#e2b053]/10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-[#e2b053]/10 rounded-2xl text-[#e2b053]">
                <TrendingUp size={18} />
              </div>
              <ArrowUpRight size={14} className="text-[#00d49a] opacity-50" />
            </div>
            <span className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1 block">USDT BINANCE</span>
            <div className="flex flex-baseline gap-1">
              <span className="text-[10px] text-[#e2b053] font-bold">Bs.</span>
              <span className="text-3xl font-black rajdhani text-white leading-none tracking-tighter">
                {data?.precio_usdt || '0.00'}
              </span>
            </div>
            <div className="mt-5 h-[2px] bg-white/5 relative overflow-hidden rounded-full">
              <motion.div 
                animate={{ x: [-100, 100] }} 
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-[40px] bg-gradient-to-r from-transparent via-[#e2b053]/40 to-transparent" 
              />
            </div>
          </div>

          {/* BCV */}
          <div className="glass-panel p-6 border-white/5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-white/5 rounded-2xl text-white/60">
                <Home size={18} />
              </div>
              <Info size={14} className="text-white/20" />
            </div>
            <span className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1 block">OFICIAL BCV</span>
            <div className="flex flex-baseline gap-1">
              <span className="text-[10px] text-white/40 font-bold">Bs.</span>
              <span className="text-3xl font-black rajdhani text-white/80 leading-none tracking-tighter">
                {data?.precio_bcv || '0.00'}
              </span>
            </div>
            <div className="mt-5 h-[2px] bg-white/5 rounded-full" />
          </div>
        </div>

        {/* Global Delta / Brecha BS */}
        <div className="w-full glass-panel p-6 py-7 border-[#00d49a]/10 flex justify-between items-center group overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00d49a]/10 flex items-center justify-center text-[#00d49a] border border-[#00d49a]/20">
              <Wallet size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Brecha Absoluta</span>
              <span className="text-2xl font-black rajdhani text-white leading-none mt-1">
                Bs. {data?.brecha_bs || '0.00'}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="px-3 py-1 bg-[#00d49a]/10 rounded-full border border-[#00d49a]/20">
              <span className="text-[10px] font-black text-[#00d49a] uppercase tracking-widest">Seguro</span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-24 bg-gradient-to-l from-[#00d49a]/5 to-transparent pointer-events-none" />
        </div>

      </main>

      {/* Luxury Navigation */}
      <nav className="nav-bar fixed bottom-0 left-0 right-0 h-24 flex justify-around items-center px-10 z-50 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="nav-item flex flex-col items-center gap-2">
          <Home size={22} className="opacity-50" />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Dashboard</span>
        </div>
        <div className="nav-item active flex flex-col items-center gap-2 relative">
          <div className="absolute top-[-35px] w-14 h-1 bg-[#e2b053] rounded-full shadow-[0_5px_15px_rgba(226,176,83,0.4)]" />
          <BarChart2 size={26} />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Monitor</span>
        </div>
        <div className="nav-item flex flex-col items-center gap-2">
          <Wallet size={22} className="opacity-50" />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Finanzas</span>
        </div>
        <div className="nav-item flex flex-col items-center gap-2">
          <User size={22} className="opacity-50" />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Ajustes</span>
        </div>
      </nav>

      {/* Background Micro-Interactions Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#e2b053]/[0.02] radial-gradient" />
      </div>

    </div>
  );
}
