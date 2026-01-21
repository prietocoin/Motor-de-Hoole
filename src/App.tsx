import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  RefreshCw, 
  Instagram,
  Send,
  Twitter,
  Landmark // Icono de banco para BCV
} from 'lucide-react';

export default function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  // Color inicial neutro, luego verde o rojo según tendencia
  const [trendColor, setTrendColor] = useState('#64748b'); 
  const [isPulsing, setIsPulsing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sync = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/precio-actual');
      const d = await r.json();
      if (!d || !d.id) return;

      if (d.id !== lastId) {
        // Lógica de Color Premium:
        // Bajando = Verde (Fortaleza Bs), Subiendo = Rojo (Alerta Bs)
        const newColor = (d.status === 'bajando') ? '#00d49a' : '#ff4b4b';
        setTrendColor(newColor);
        
        // Activar parpadeo intenso del nuevo anillo grueso
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 2500);

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
            <polygon points="50,60 44,68 50,76 56,68" fill="#e2b053" />
        </svg>
        <h1 className="mt-6 font-rajdhani text-3xl font-bold tracking-[0.4em] text-white"><span className="text-[#e2b053]">H</span>OO</h1>
        <button onClick={() => setIsUnlocked(true)} className="mt-12 px-12 py-3 glass-card font-black text-[10px] text-[#e2b053] border border-[#e2b053]/20 uppercase tracking-[0.3em]">Conectar Terminal</button>
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
      
      <div className="marketing-banner">
          <div className="marketing-content">
              /// JAIROKOV SYSTEMS: SOLUCIONES DE INTELIGENCIA ARTIFICIAL A MEDIDA /// AUTOMATIZACIÓN ESTRATÉGICA DE PROCESOS /// GESTIÓN AVANZADA DE BASES DE DATOS Y REGISTROS /// POTENCIANDO EL ÉXITO DE EMPRENDEDORES Y PYMES /// INNOVACIÓN TECNOLÓGICA DE ALTO NIVEL ///
          </div>
      </div>

      <AnimatePresence>
        {bannerVisible && (
          <motion.div initial={{ y: -100, x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: -100, x: '-50%' }} className="fixed top-[32px] left-1/2 z-[200] bg-red-600 px-4 py-1 rounded-b-lg text-[9px] font-black uppercase tracking-widest shadow-lg">
            ⚠️ ALERTA: TENDENCIA VOLÁTIL DETECTADA
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col container mx-auto max-w-lg px-6 py-4 overflow-y-auto no-scrollbar">
        <header className="flex justify-between items-start pt-2 mb-2">
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
                    <p className="text-[7px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">DÓLAR MONITOR v6.5</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className="w-9 h-9 glass-card flex items-center justify-center" style={{ color: isMuted ? '#ff4b4b' : '#64748b' }}><Volume2 className="w-4 h-4" /></button>
                <button onClick={sync} className={`w-9 h-9 glass-card flex items-center justify-center text-white/30 ${loading ? 'animate-spin' : ''}`}><RefreshCw className="w-4 h-4" /></button>
            </div>
        </header>

        {/* === NUEVO GAUGE PREMIUM GRUESO === */}
        <div className="gauge-container relative flex items-center justify-center my-2 py-4">
            {/* Anillo Exterior Grueso y Sólido */}
            <svg width="230" height="230" viewBox="0 0 230 230" className="absolute z-0">
              {/* Fondo del anillo grueso */}
              <circle cx="115" cy="115" r="102" fill="none" stroke="#1a1c1e" strokeWidth="14" />
              {/* Anillo de color dinámico (Rojo/Verde) */}
              <circle 
                cx="115" cy="115" r="102" 
                fill="none" 
                stroke={trendColor} 
                strokeWidth="14"
                strokeLinecap="round"
                // Circunferencia completa para que sea sólido
                strokeDasharray="641" 
                strokeDashoffset="0"
                transform='rotate(-90 115 115)'
                className={`transition-all duration-500 ${isPulsing ? 'animate-pulse-intense' : 'opacity-90'}`}
              />
            </svg>

            {/* Medidor Segmentado Dorado Original (Arriba) */}
            <svg width="180" height="180" viewBox="0 0 160 160" className="gauge-svg relative z-10">
                <circle className="gauge-segment-bg" cx="80" cy="80" r="70" />
                <motion.circle initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: dashOffset }} className="gauge-segment-progress" cx="80" cy="80" r="70" />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
                <span className="text-[7px] text-[#e2b053] font-bold tracking-[2px] mb-1 opacity-60 uppercase">Diferencial</span>
                <span className="font-rajdhani text-4xl font-extrabold tracking-tighter leading-none shadow-xl">
                  {data?.brecha_porcentaje || (currentGap.toFixed(2) + '%')}
                </span>
                <div className="mt-3 flex flex-col items-center pt-2 border-t border-white/10 w-24">
                    <span className="text-xs font-bold text-white/90">Bs. {(usdtNum - bcvNum).toFixed(2)}</span>
                    <span className="text-[6px] text-white/20 font-black tracking-[2px] mt-0.5 uppercase">Brecha Neta</span>
                </div>
            </div>
        </div>

        {/* === NUEVA ESTRUCTURA DE TARJETAS === */}
        <div className="flex flex-col gap-3 mt-2">
            
            {/* FILA 1: Precio Binance y Tendencia */}
            <div className="grid grid-cols-2 gap-3">
                {/* Tarjeta Izquierda: Solo Precio Binance */}
                <div className="glass-card p-4 flex flex-col justify-center">
                    <span className="text-[7px] font-bold text-white/30 tracking-widest uppercase mb-2">Binance P2P</span>
                    <h3 className="font-rajdhani text-3xl font-bold">{data?.precio_usdt || '--,--'}</h3>
                    <p className="text-[6px] text-white/20 mt-1">VES / USDT</p>
                </div>

                {/* Tarjeta Derecha: Solo Tendencia y Gráfico */}
                <div className="glass-card p-4 flex flex-col justify-between">
                    <span className="text-[7px] font-bold text-white/30 tracking-widest uppercase mb-1">Tendencia Mercado</span>
                    <div className="flex flex-col items-end">
                        <span className="font-rajdhani text-2xl font-black" style={{ color: trendColor }}>
                          {data?.variacion_mercado || '0.00%'}
                        </span>
                        {/* Sparkline Dinámico */}
                        <div className="h-5 w-full mt-2">
                            <svg viewBox="0 0 100 25" className="w-full h-full">
                                <path className="sparkline" style={{ stroke: trendColor, filter: `drop-shadow(0 0 4px ${trendColor}60)` }} d="M0,20 Q30,5 50,15 T100,0" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* FILA 2: Tasas Oficiales BCV (Divididas) */}
            <div className="grid grid-cols-2 gap-3">
                {/* Euro BCV */}
                <div className="glass-card p-3 flex justify-between items-center bg-[#181a1b]/80">
                    <div className="flex flex-col">
                        <span className="text-[6px] font-black text-white/40 uppercase tracking-[2px]">Euro Oficial</span>
                        <span className="font-rajdhani text-lg font-bold text-white">€ {data?.precio_eur || '--,--'}</span>
                    </div>
                    <div className="text-[#e2b053] flex items-center gap-1 bg-[#e2b053]/10 px-2 py-1 rounded-md">
                        <Landmark className="w-3 h-3" /> <span className="text-[7px] font-black tracking-widest">BCV</span>
                    </div>
                </div>
                
                {/* Dólar BCV (Movido aquí) */}
                <div className="glass-card p-3 flex justify-between items-center bg-[#181a1b]/80">
                    <div className="flex flex-col">
                        <span className="text-[6px] font-black text-white/40 uppercase tracking-[2px]">Dólar Oficial</span>
                        <span className="font-rajdhani text-lg font-bold text-white">$ {data?.precio_bcv || '--,--'}</span>
                    </div>
                     <div className="text-[#e2b053] flex items-center gap-1 bg-[#e2b053]/10 px-2 py-1 rounded-md">
                        <Landmark className="w-3 h-3" /> <span className="text-[7px] font-black tracking-widest">BCV</span>
                    </div>
                </div>
            </div>

        </div>

        <div className="mt-auto pt-4">
            <footer className="glass-card p-3 flex items-center justify-between border-white/5">
                <div className="flex flex-col">
                    <span className="text-[6px] text-white/30 font-bold tracking-[2px] uppercase">Sistema Elite</span>
                    <span className="font-rajdhani text-xs font-bold tracking-[2px]">@JAIROKOV</span>
                </div>
                <div className="flex gap-4">
                    <a href="https://instagram.com/jairokov" target="_blank" className="text-white/40 hover:text-white"><Instagram className="w-4 h-4" /></a>
                    <a href="https://t.me/jairokov" target="_blank" className="text-white/40 hover:text-white"><Send className="w-4 h-4" /></a>
                    <a href="https://x.com/jairokov" target="_blank" className="text-white/40 hover:text-white"><Twitter className="w-4 h-4" /></a>
                </div>
            </footer>

            <div className="text-center py-3">
                <p className="text-[7px] text-white/10 font-black uppercase tracking-[0.4em]">Propiedad de <span className="text-[#e2b053]">Jairokov Systems</span> © 2026</p>
            </div>
        </div>
      </div>
    </div>
  );
}
