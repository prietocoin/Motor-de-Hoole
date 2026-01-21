import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  RefreshCw, 
  Home, 
  BarChart2, 
  CircleDollarSign, 
  User,
  Instagram,
  Send,
  Twitter
} from 'lucide-react';

export default function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sync = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/precio-actual');
      const d = await r.json();
      if (!d || !d.id) return;

      if (d.id !== lastId) {
        if (d.alerta_audio && !isMuted && isUnlocked) {
          audioRef.current?.play().catch(() => {});
        }
        if (d.mostrar_banner) {
          setBannerVisible(true);
          setTimeout(() => setBannerVisible(false), 8000);
        }
        setLastId(d.id);
      }

      setData(d);
    } catch (e) {
      console.error("Error Sync", e);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  }, [lastId, isMuted, isUnlocked]);

  useEffect(() => {
    if (isUnlocked) {
      sync();
      const interval = setInterval(sync, 30000);
      return () => clearInterval(interval);
    }
  }, [isUnlocked, sync]);

  if (!isUnlocked) {
    return (
      <div id="splash" style={{ position: 'fixed', inset: 0, background: '#050608', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="80" height="80" viewBox="0 0 100 100">
            <polyline points="20,35 50,55 80,35" fill="none" stroke="var(--accent-gold)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="35" cy="50" r="11" fill="white" />
            <circle cx="65" cy="50" r="11" fill="white" />
            <circle cx="35" cy="50" r="4.5" fill="#050608" />
            <circle cx="65" cy="50" r="4.5" fill="#050608" />
            <polygon points="50,60 43,69 50,78 57,69" fill="var(--accent-gold)" />
        </svg>
        <h1 className="mt-6 font-rajdhani text-3xl font-bold tracking-[0.4em] text-white">
          <span className="gold-h">H</span>OO
        </h1>
        <button 
          onClick={() => setIsUnlocked(true)}
          className="mt-12 px-12 py-3 glass-card font-black text-[10px] gold-h border-gold-500/20 uppercase tracking-[0.3em]"
        >
          Conectar Terminal
        </button>
      </div>
    );
  }

  const bcvNum = parseFloat(String(data?.precio_bcv || '0').replace(',', '.'));
  const usdtNum = parseFloat(String(data?.precio_usdt || '0').replace(',', '.'));
  const currentGap = bcvNum > 0 ? ((usdtNum - bcvNum) / bcvNum) * 100 : 0;
  const dashOffset = 440 - (440 * Math.min(currentGap, 35) / 35);

  return (
    <div className="h-screen w-full flex flex-col bg-[#050608] text-white overflow-hidden relative">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      
      {/* Marketing Banner */}
      <div className="marketing-banner">
          <div className="marketing-content">
              /// JAIROKOV SYSTEMS: AUTOMATIZACIONES CON INTELIGENCIA ARTIFICIAL /// SISTEMAS PARA EMPRENDEDORES Y PYMES
              /// HOO MONITOR: PRECISIÓN TOTAL SIN OCR /// TENDENCIAS DEL MERCADO EN TIEMPO REAL /// MVP DESARROLLADO PARA
              EL ÉXITO COMERCIAL ///
          </div>
      </div>

      {/* Alertas Temporales */}
      <AnimatePresence>
        {bannerVisible && (
          <motion.div 
            initial={{ y: -100, x: '-50%' }}
            animate={{ y: 0, x: '-50%' }}
            exit={{ y: -100, x: '-50%' }}
            id="alert-notification"
            className="fixed top-[32px] left-1/2"
            style={{ display: 'block' }}
          >
            ⚠️ ALERTA: TENDENCIA VOLÁTIL DETECTADA
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col container mx-auto max-w-lg px-6">
        <header className="pt-6 flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 glass-card flex items-center justify-center border-white/5 shadow-xl">
                    <svg width="24" height="24" viewBox="0 0 100 100">
                        <polyline points="20,35 50,55 80,35" fill="none" stroke="var(--accent-gold)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="35" cy="50" r="10" fill="white" />
                        <circle cx="65" cy="50" r="10" fill="white" />
                        <circle cx="35" cy="50" r="4" fill="#050608" />
                        <circle cx="65" cy="50" r="4" fill="#050608" />
                        <polygon points="50,60 44,68 50,76 56,68" fill="var(--accent-gold)" />
                    </svg>
                </div>
                <div>
                    <h2 className="font-rajdhani text-2xl font-bold tracking-widest text-white leading-none"><span class="gold-h">H</span>OO</h2>
                    <p className="text-[8px] text-white/40 font-black uppercase tracking-[0.2em] mt-1.5">DÓLAR MONITOR</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="w-10 h-10 glass-card flex items-center justify-center"
                  style={{ color: isMuted ? 'var(--accent-red)' : 'var(--text-dim)' }}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button onClick={sync} className={`w-10 h-10 glass-card flex items-center justify-center text-white/30 ${loading ? 'animate-spin' : ''}`}>
                  <RefreshCw className="w-4 h-4" />
                </button>
            </div>
        </header>

        <div className="gauge-container">
            <svg width="210" height="210" viewBox="0 0 160 160" className="gauge-svg">
                <circle className="gauge-segment-bg" cx="80" cy="80" r="70" />
                <motion.circle 
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: dashOffset }}
                  id="gauge-arc" 
                  className="gauge-segment-progress" 
                  cx="80" cy="80" r="70" 
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span style={{ fontSize: '8px', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '2px', marginBottom: '5px', opacity: 0.6 }}>DIFERENCIAL</span>
                <span className="font-rajdhani text-5xl font-extrabold tracking-tighter leading-none">
                  {data?.brecha_porcentaje || (currentGap.toFixed(2) + '%')}
                </span>
                <div className="mt-6 flex flex-col items-center pt-2 border-t border-white/10 w-32">
                    <span className="text-sm font-bold text-white/90">Bs. {(usdtNum - bcvNum).toFixed(2)}</span>
                    <span style={{ fontSize: '7px', color: 'white', opacity: 0.2, fontWeight: 900, letterSpacing: '2px', marginTop: '4px' }}>BRECHA NETA</span>
                </div>
            </div>
        </div>

        <div className="cards-container grid grid-cols-2 gap-4 mt-2">
            <div className="glass-card p-5">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[8px] font-bold text-white/30 tracking-widest uppercase">BINANCE P2P</span>
                    <span className={`text-[8px] font-black ${data?.status === 'bajando' ? 'text-red-500' : 'text-green-500'}`}>
                      {data?.variacion_mercado || '0.00%'}
                    </span>
                </div>
                <h3 className="font-rajdhani text-3xl font-bold">{data?.precio_usdt || '--,--'}</h3>
                <p className="text-[7px] text-white/20 mt-1">VES / USDT</p>
                <div className="h-6 mt-3">
                  <svg viewBox="0 0 100 20" className="w-full h-full">
                    <path className="sparkline" d="M0,15 Q20,5 40,15 T70,5 T100,10" />
                  </svg>
                </div>
            </div>
            <div className="glass-card p-5">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[8px] font-bold text-white/30 tracking-widest uppercase">OFICIAL BCV</span>
                    <span className="text-[8px] font-black text-white/40">+0.00%</span>
                </div>
                <h3 className="font-rajdhani text-3xl font-bold text-white/80">{data?.precio_bcv || '--,--'}</h3>
                <p className="text-[7px] text-white/20 mt-1">VES / BCV</p>
                <div className="h-6 mt-3">
                  <svg viewBox="0 0 100 20" className="w-full h-full">
                    <path className="sparkline" style={{ stroke: 'var(--text-dim)' }} d="M0,10 Q50,10 100,10" />
                  </svg>
                </div>
            </div>
            <div className="glass-card p-4 col-span-2 flex justify-between items-center bg-[#181a1b]">
                <div className="flex flex-col">
                    <span className="text-[7px] font-black text-[#e2b053]/60 uppercase tracking-[2px]">Tasa Euro Oficial</span>
                    <span className="font-rajdhani text-xl font-bold gold-h">{data?.precio_eur || '--,--'} Bs.</span>
                </div>
                <div className="py-1 px-3 glass-card text-[7px] font-black tracking-[1px] border-[#e2b053]/20 uppercase">Ancla Diaria</div>
            </div>
        </div>

        <div className="mt-6 glass-card p-4 flex items-center justify-between border-white/5">
            <div className="flex flex-col">
                <span className="text-[7px] text-white/30 font-bold tracking-[2px] uppercase mb-1">SISTEMA ELITE</span>
                <span className="font-rajdhani text-sm font-bold tracking-[2px]">@JAIROKOV</span>
            </div>
            <div className="flex gap-4">
                <a href="https://instagram.com/jairokov" target="_blank" className="text-white/40 hover:text-white"><Instagram className="w-4 h-4" /></a>
                <a href="https://t.me/jairokov" target="_blank" className="text-white/40 hover:text-white"><Send className="w-4 h-4" /></a>
                <a href="https://x.com/jairokov" target="_blank" className="text-white/40 hover:text-white"><Twitter className="w-4 h-4" /></a>
            </div>
        </div>

        <div className="mt-auto mb-4 text-center py-4">
            <p className="text-[8px] text-white/10 font-black uppercase tracking-[0.4em]">PROPIEDAD DE <span class="gold-h">JAIROKOV SYSTEMS</span> © 2026</p>
        </div>
      </div>

      <nav className="nav-bar shrink-0">
        <div className="nav-item">
          <Home className="w-5 h-5" />
          <span>INICIO</span>
        </div>
        <div className="nav-item active">
          <BarChart2 className="w-5 h-5" />
          <span>MONITOR</span>
        </div>
        <div className="nav-item">
          <CircleDollarSign className="w-5 h-5" />
          <span>DIVISAS</span>
        </div>
        <div className="nav-item">
          <User className="w-5 h-5" />
          <span>PERFIL</span>
        </div>
      </nav>
    </div>
  );
}
