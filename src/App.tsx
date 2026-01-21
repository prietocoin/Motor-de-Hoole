import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  TrendingUp, 
  ChevronRight,
  ShieldAlert,
  Zap
} from 'lucide-react';

// Recreación exacta del diseño V6.0 estable del usuario
export default function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/precio-actual');
      if (!response.ok) throw new Error("Offline");
      const result = await response.json();
      
      const d = Array.isArray(result) ? result[0] : (result.analisis || result);
      
      if (!d) return;

      if (d.id !== lastId) {
        if (d.alerta_audio && isUnlocked) {
          audioRef.current?.play().catch(() => console.log("Audio block"));
        }
        setBannerVisible(!!d.mostrar_banner);
        setLastId(d.id);
      }

      setData({
        precio_usdt: d.precio_usdt || "0.00",
        precio_bcv: d.precio_bcv || "0.00",
        precio_eur: d.precio_eur || "0.00",
        brecha_porcentaje: String(d.brecha_porcentaje || "0%").replace('%', ''),
        variacion_mercado: d.variacion_mercado || "0.00%",
        status: d.status || "Estable"
      });
    } catch (err) {
      console.error("Fallo:", err);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, [lastId, isUnlocked]);

  useEffect(() => {
    if (isUnlocked) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [isUnlocked, fetchData]);

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0a0b0d] flex flex-col items-center justify-center p-8 transition-opacity duration-700">
        <div className="mb-8 w-24 h-24 rounded-full glass-panel flex items-center justify-center border-gold btn-pulse">
            <svg viewBox="0 0 100 100" className="w-14 h-14 text-[#e2b053]">
                <path d="M50 15 L80 35 L80 65 L50 85 L20 65 L20 35 Z" fill="none" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="10" fill="currentColor" />
            </svg>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tighter mb-2">HOO <span className="gold-gradient">SMART</span></h1>
        <p className="text-white/40 text-xs uppercase tracking-[0.3em] font-light mb-12">V6.0 Terminal de Energía</p>
        <button 
          onClick={() => setIsUnlocked(true)}
          className="w-full max-w-xs py-5 bg-gradient-to-r from-[#e2b053] to-[#ffb347] text-black font-bold text-lg rounded-2xl shadow-2xl hover:scale-105 transition-transform"
        >
          CONECTAR TERMINAL
        </button>
      </div>
    );
  }

  const brechaVal = parseFloat(data?.brecha_porcentaje || '0');
  const dashOffset = 440 - (440 * Math.min(brechaVal, 30) / 30);

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0b0d] text-white overflow-hidden relative selection:bg-[#e2b053]">
      <audio id="alert-sound" ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto"></audio>
      
      {/* Alertas Banner */}
      <AnimatePresence>
        {bannerVisible && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 w-full z-50 p-3 danger-banner text-center text-[10px] sm:text-xs shadow-xl font-extrabold"
          >
            ⚠️ ATENCIÓN: MOVIMIENTO BRUSCO EN MERCADO PARALELO
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Header */}
      <header className="pt-12 px-8 flex justify-between items-center z-10">
          <div>
              <h2 className="text-xs text-white/40 font-bold uppercase tracking-widest leading-none mb-1">Mercado</h2>
              <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight">HOO MONITOR</span>
                  <span className={`status-badge ${data ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {data ? 'CONECTADO' : 'SIN CONEXIÓN'}
                  </span>
              </div>
          </div>
          <div className="flex gap-4">
              <button onClick={fetchData} className={`p-3 glass-panel text-white/60 hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`}>
                  <RefreshCw className="w-5 h-5" />
              </button>
          </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 space-y-8 z-10 overflow-hidden pb-24">
          
          {/* Gauge Central */}
          <div className="relative flex items-center justify-center">
              <svg width="260" height="260" viewBox="0 0 160 160" className="transform -rotate-90">
                  <circle className="gauge-background" cx="80" cy="80" r="70" />
                  <motion.circle 
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: dashOffset }}
                    className="gauge-progress" 
                    cx="80" cy="80" r="70" 
                    strokeDasharray="440"
                    style={{ stroke: brechaVal > 20 ? "#ff4b2b" : "#e2b053" }}
                  />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-5xl font-extrabold tracking-tighter leading-none mb-1">{data?.brecha_porcentaje || '0.0'}%</span>
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Brecha Oficial</span>
              </div>
          </div>

          {/* Indicador Principal: USDT */}
          <div className="w-full max-w-md glass-panel p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                          <TrendingUp className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-semibold text-white/60">Binance P2P (Dinámico)</span>
                  </div>
                  <div className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">{data?.status || 'Estable'}</div>
              </div>
              <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-['Inter']">{data?.precio_usdt || '0.00'}</span>
                  <span className="text-lg font-bold text-white/40">Bs.</span>
              </div>
              <div className="text-xs font-bold text-green-500 mt-1">{data?.variacion_mercado || '0.00%'} hoy</div>
          </div>

          {/* Anclas Oficiales: BCV y EURO */}
          <div className="w-full max-w-md grid grid-cols-2 gap-4">
              {/* BCV USD */}
              <div className="glass-panel p-5">
                  <span className="text-[10px] font-bold text-white/40 uppercase block mb-2">BCV USD (Ancla)</span>
                  <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">{data?.precio_bcv || '0.00'}</span>
                      <span className="text-xs text-white/40">Bs.</span>
                  </div>
              </div>
              {/* BCV EUR */}
              <div className="glass-panel p-5 border-l-4 border-l-[#e2b053]/30">
                  <span className="text-[10px] font-bold text-[#e2b053]/60 uppercase block mb-2">BCV EUR (Oficial)</span>
                  <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold gold-gradient">{data?.precio_eur || '0.00'}</span>
                      <span className="text-xs text-white/40">Bs.</span>
                  </div>
              </div>
          </div>
      </main>

      {/* Footer Branding */}
      <footer className="p-8 text-center opacity-30 pointer-events-none">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold">Maracaibo Software Lab &copy; 2026</p>
      </footer>
    </div>
  );
}
