import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  RefreshCw, 
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
      <div id="splash" className="fixed inset-0 bg-[#050608] z-[1000] flex flex-col items-center justify-center">
        <svg width="80" height="80" viewBox="0 0 100 100">
            <polyline points="20,35 50,55 80,35" fill="none" stroke="#e2b053" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="35" cy="50" r="11" fill="white" />
            <circle cx="65" cy="50" r="11" fill="white" />
            <circle cx="35" cy="50" r="4.5" fill="#050608" />
            <circle cx="65" cy="50" r="4.5" fill="#050608" />
            <polygon points="50,60 43,69 50,78 57,69" fill="#e2b053" />
        </svg>
        <h1 className="mt-6 font-rajdhani text-3xl font-bold tracking-[0.4em] text-white">
          <span className="text-[#e2b053]">H</span>OO
        </h1>
        <button 
          onClick={() => setIsUnlocked(true)}
          className="mt-12 px-12 py-3 glass-card font-black text-[10px] text-[#e2b053] border border-[#e2b053]/20 uppercase tracking-[0.3em]"
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
      
      {/* Marketing Banner Profesional */}
      <div className="marketing-banner flex-shrink-0">
          <div className="marketing-content">
              /// JAIROKOV SYSTEMS: SOLUCIONES DE INTELIGENCIA ARTIFICIAL A MEDIDA /// AUTOMATIZACIÓN ESTRATÉGICA DE PROCESOS /// GESTIÓN AVANZADA DE BASES DE DATOS Y REGISTROS /// POTENCIANDO EL ÉXITO DE EMPRENDEDORES Y PYMES /// INNOVACIÓN TECNOLÓGICA DE ALTO NIVEL ///
          </div>
      </div>

      <AnimatePresence>
        {bannerVisible && (
          <motion.div 
            initial={{ y: -100, x: '-50%' }}
            animate={{ y: 0, x: '-50%' }}
            exit={{ y: -100, x: '-50%' }}
            className="fixed top-[35px] left-1/2 bg-red-600 px-4 py-1 rounded-b-lg text-[10px] font-bold z-50 uppercase tracking-widest"
          >
            ⚠️ ALERTA: TENDENCIA VOLÁTIL
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col container mx-auto max-w-lg px-6 justify-between py-4 overflow-hidden">
        <header className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 glass-card flex items-center justify-center border-white/5">
                    <svg width="22" height="22" viewBox="0 0 100 100">
                        <polyline points="20,35 50,55 80,35" fill="none" stroke="#e2b053" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="35" cy="50" r="10" fill="white" />
                        <circle cx="65" cy="50" r="10" fill="white" />
                        <circle cx="35" cy="50" r="4" fill="#050608" />
                        <circle cx="65" cy="50" r="4" fill="#050608" />
                        <polygon points="50,60 44,68 50,76 56,68" fill="#e2b053" />
                    </svg>
                </div>
                <div>
                    <h2 className="font-rajdhani text-xl font-bold tracking-widest text-white leading-none"><span className="text-[#e2b053]">H</span>OO</h2>
                    <p className="text-[7px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">DÓLAR MONITOR</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="w-9 h-9 glass-card flex items-center justify-center"
                  style={{ color: isMuted ? '#ff4b4b' : '#64748b' }}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button onClick={sync} className={`w-9 h-9 glass-card flex items-center justify-center text-white/30 ${loading ? 'animate-spin' : ''}`}>
                  <RefreshCw className="w-4 h-4" />
                </button>
            </div>
        </header>

        <div className="gauge-container scale-90 sm:scale-100">
            <svg width="200" height="200" viewBox="0 0 160 160" className="gauge-svg">
                <circle className="gauge-segment-bg" cx="80" cy="80" r="70" />
                <motion.circle 
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: dashOffset }}
                  className="gauge-segment-progress" 
                  cx="80" cy="80" r="70" 
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[7px] text-[#e2b053] font-bold tracking-[2px] mb-1 opacity-60">DIFERENCIAL</span>
                <span className="font-rajdhani text-4xl font-extrabold tracking-tighter leading-none">
                  {data?.brecha_porcentaje || (currentGap.toFixed(2) + '%')}
                </span>
                <div className="mt-4 flex flex-col items-center pt-2 border-t border-white/10 w-24">
                    <span className="text-xs font-bold text-white/90">Bs. {(usdtNum - bcvNum).toFixed(2)}</span>
                    <span className="text-[6px] text-white/20 font-black tracking-[2px] mt-1">BRECHA NETA</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[7px] font-bold text-white/30 tracking-widest uppercase">BINANCE P2P</span>
                    <span className={`text-[7px] font-black ${data?.status === 'bajando' ? 'text-red-500' : 'text-green-500'}`}>
                      {data?.variacion_mercado || '0.00%'}
                    </span>
                </div>
                <h3 className="font-rajdhani text-2xl font-bold">{data?.precio_usdt || '--,--'}</h3>
                <p className="text-[6px] text-white/20">VES / USDT</p>
                <div className="h-4 mt-2">
                  <svg viewBox="0 0 100 20" className="w-full h-full">
                    <path className="sparkline" d="M0,15 Q20,5 40,15 T70,5 T100,10" />
                  </svg>
                </div>
            </div>
            <div className="glass-card p-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[7px] font-bold text-white/30 tracking-widest uppercase">OFICIAL BCV</span>
                    <span className="text-[7px] font-black text-white/40">+0.00%</span>
                </div>
                <h3 className="font-rajdhani text-2xl font-bold text-white/80">{data?.precio_bcv || '--,--'}</h3>
                <p className="text-[6px] text-white/20">VES / BCV</p>
                <div className="h-4 mt-2">
                  <svg viewBox="0 0 100 20" className="w-full h-full">
                    <path className="sparkline" style={{ stroke: '#64748b' }} d="M0,10 Q50,10 100,10" />
                  </svg>
                </div>
            </div>
            <div className="glass-card p-3 col-span-2 flex justify-between items-center bg-[#181a1b]">
                <div className="flex flex-col">
                    <span className="text-[6px] font-black text-[#e2b053]/60 uppercase tracking-[2px]">Tasa Euro Oficial</span>
                    <span className="font-rajdhani text-lg font-bold text-[#e2b053]">{data?.precio_eur || '--,--'} Bs.</span>
                </div>
                <div className="py-1 px-3 glass-card text-[6px] font-black tracking-[1px] border-[#e2b053]/20 uppercase">Ancla Diaria</div>
            </div>
        </div>

        <div className="glass-card p-3 flex items-center justify-between border-white/5">
            <div className="flex flex-col">
                <span className="text-[6px] text-white/30 font-bold tracking-[2px] uppercase">SISTEMA ELITE</span>
                <span className="font-rajdhani text-xs font-bold tracking-[2px]">@JAIROKOV</span>
            </div>
            <div className="flex gap-4">
                <a href="https://instagram.com/jairokov" target="_blank" className="text-white/40 hover:text-white"><Instagram className="w-4 h-4" /></a>
                <a href="https://t.me/jairokov" target="_blank" className="text-white/40 hover:text-white"><Send className="w-4 h-4" /></a>
                <a href="https://x.com/jairokov" target="_blank" className="text-white/40 hover:text-white"><Twitter className="w-4 h-4" /></a>
            </div>
        </div>

        <div className="text-center">
            <p className="text-[7px] text-white/10 font-black uppercase tracking-[0.4em]">PROPIEDAD DE <span className="text-[#e2b053]">JAIROKOV SYSTEMS</span> © 2026</p>
        </div>
      </div>
    </div>
  );
}
