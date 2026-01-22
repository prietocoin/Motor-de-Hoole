import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  RefreshCw, 
  Instagram,
  Send,
  Twitter,
  Landmark,
  Calendar,
  Clock,
  Briefcase,
  Share2,
  CalendarDays,
  LayoutDashboard,
  Coins,
  TrendingUp 
} from 'lucide-react';

export default function App() {
  // --- ESTADOS DEL SISTEMA ---
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [trendColor, setTrendColor] = useState('#64748b'); 
  const [isPulsing, setIsPulsing] = useState(false);
  const [vzlaTime, setVzlaTime] = useState({ dayName: '', date: '', time: '' });
  const [progress, setProgress] = useState(100);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- CONTROL DE NAVEGACIÓN (PÁGINAS) ---
  const [activeTab, setActiveTab] = useState('home'); // 'home' es Monitor, 'currencies' es las 14 tarjetas

  // --- DATOS DE LAS 14 MONEDAS GLOBALES ---
  const otherCurrencies = [
    { currency: "PEN", final_average: "3.35" },
    { currency: "COP", final_average: "3610" },
    { currency: "CLP", final_average: "872" },
    { currency: "ARS", final_average: "1515" },
    { currency: "MXN", final_average: "17.57" },
    { currency: "VES", final_average: "462" },
    { currency: "PYG", final_average: "6614" },
    { currency: "DOP", final_average: "64.09" },
    { currency: "CRC", final_average: "501" },
    { currency: "EUR", final_average: "0.86" },
    { currency: "CAD", final_average: "1.40" },
    { currency: "BOB", final_average: "9.55" },
    { currency: "BRL", final_average: "5.32" },
    { currency: "BCV", final_average: "44.92" }
  ];

  // Lógica de Tiempo Real para Venezuela
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dayOptions: any = { timeZone: 'America/Caracas', weekday: 'long' };
      const dateOptions: any = { timeZone: 'America/Caracas', day: '2-digit', month: '2-digit', year: 'numeric' };
      const timeOptions: any = { timeZone: 'America/Caracas', hour: '2-digit', minute: '2-digit', hour12: true };
      
      setVzlaTime({
        dayName: new Intl.DateTimeFormat('es-VE', dayOptions).format(now),
        date: new Intl.DateTimeFormat('es-VE', dateOptions).format(now),
        time: new Intl.DateTimeFormat('es-VE', timeOptions).format(now)
      });
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Barra de progreso de 30 segundos
  useEffect(() => {
    if (!isUnlocked) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev <= 0 ? 100 : prev - 0.33));
    }, 100);
    return () => clearInterval(interval);
  }, [isUnlocked]);

  // Lógica de Compartir Contextual (Detecta en qué página estás)
  const handleShare = async () => {
    let shareText = '';

    if (activeTab === 'home') {
      shareText = `📊 *HOO Monitor: Dólar Venezuela*\n💵 Binance: ${data?.precio_usdt || '--,--'}\n🏦 BCV: ${data?.precio_bcv || '--,--'}`;
    } else {
      shareText = `🌍 *Tasas Globales P2P (Binance)*\nConsulta PEN, COP, ARS, MXN y más en tiempo real.`;
    }

    const shareData = {
      title: 'HOO Monitor - Jairokov Systems',
      text: `${shareText}\n\nVer aquí:`,
      url: window.location.href
    };

    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Enlace copiado al portapapeles');
      }
    } catch (err) { console.log(err); }
  };

  // Sincronización con el Servidor
  const sync = useCallback(async () => {
    setLoading(true);
    setProgress(100);
    try {
      const r = await fetch('/precio-actual');
      const d = await r.json();
      if (!d || !d.id) return;

      if (d.id !== lastId) {
        const newColor = (d.status === 'bajando') ? '#00d49a' : '#ff4b4b';
        setTrendColor(newColor);
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 2500);

        if (d.alerta_audio && !isMuted && isUnlocked) {
          audioRef.current?.play().catch(() => {});
        }
        setLastId(d.id);
      }
      setData(d);
    } catch (e) { console.error("Error Sync", e); }
    finally { setTimeout(() => setLoading(false), 1000); }
  }, [lastId, isMuted, isUnlocked]);

  useEffect(() => {
    if (isUnlocked) {
      sync();
      const interval = setInterval(sync, 30000);
      return () => clearInterval(interval);
    }
  }, [isUnlocked, sync]);

  // --- PANTALLA DE BLOQUEO (LANDING) ---
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-[#050608] z-[1000] flex flex-col items-center justify-center">
        <svg width="80" height="80" viewBox="0 0 100 100">
            <polyline points="20,35 50,55 80,35" fill="none" stroke="#e2b053" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="35" cy="50" r="11" fill="white" /><circle cx="65" cy="50" r="11" fill="white" />
            <circle cx="35" cy="50" r="4.5" fill="#050608" /><circle cx="65" cy="50" r="4.5" fill="#050608" />
            <polygon points="50,60 43,69 50,78 57,69" fill="#e2b053" />
        </svg>
        <h1 className="mt-6 font-rajdhani text-3xl font-bold tracking-[0.4em] text-white">
          <span className="text-[#e2b053]">H</span>OO
        </h1>
        <button onClick={() => setIsUnlocked(true)} className="mt-12 px-12 py-3 glass-card font-black text-[10px] text-[#e2b053] border border-[#e2b053]/20 uppercase tracking-[0.3em]">Conectar Terminal</button>
      </div>
    );
  }

  // Cálculos de brecha
  const bcvNum = parseFloat(String(data?.precio_bcv || '0').replace(',', '.'));
  const usdtNum = parseFloat(String(data?.precio_usdt || '0').replace(',', '.'));
  const currentGap = bcvNum > 0 ? ((usdtNum - bcvNum) / bcvNum) * 100 : 0;
  const dashOffset = 440 - (440 * Math.min(currentGap, 35) / 35);

  return (
    <div className="h-screen w-full flex flex-col bg-[#050608] text-white overflow-hidden relative">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      
      {/* BANNER SUPERIOR DINÁMICO (COMÚN) */}
      <div className="marketing-banner">
          <div className="marketing-content">
              /// JAIROKOV SYSTEMS: SOLUCIONES DE INTELIGENCIA ARTIFICIAL A MEDIDA /// AUTOMATIZACIÓN ESTRATÉGICA DE PROCESOS /// GESTIÓN AVANZADA DE BASES DE DATOS Y REGISTROS /// INNOVACIÓN TECNOLÓGICA DE ALTO NIVEL ///
          </div>
      </div>

      <div className="flex-1 flex flex-col container mx-auto max-w-lg px-6 py-4 no-scrollbar overflow-y-auto pb-24">
        {/* MEMBRETE / HEADER (COMÚN) */}
        <header className="flex justify-between items-start pt-2 mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 glass-card flex items-center justify-center border-white/5">
                    <svg width="22" height="22" viewBox="0 0 100 100">
                        <polyline points="20,35 50,55 80,35" fill="none" stroke="#e2b053" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="35" cy="50" r="10" fill="white" /><circle cx="65" cy="50" r="10" fill="white" />
                        <circle cx="35" cy="50" r="4" fill="#050608" /><circle cx="65" cy="50" r="4" fill="#050608" />
                        <polygon points="50,60 44,68 50,76 56,68" fill="#e2b053" />
                    </svg>
                </div>
                <div>
                  <h2 className="font-rajdhani text-xl font-bold tracking-widest leading-none">
                    <span className="text-[#e2b053]">H</span>OO
                  </h2>
                  <p className="text-[7px] text-white/90 font-black uppercase mt-1 tracking-widest">DOLAR MONITOR V1.1</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className="w-9 h-9 glass-card flex items-center justify-center" style={{ color: isMuted ? '#ff4b4b' : '#64748b' }}><Volume2 className="w-4 h-4" /></button>
                <button onClick={sync} className={`w-9 h-9 glass-card flex items-center justify-center text-white/30 ${loading ? 'animate-spin' : ''}`}><RefreshCw className="w-4 h-4" /></button>
            </div>
        </header>

        {/* --- CONTENIDO VARIABLE SEGÚN LA PESTAÑA --- */}
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            /* --- PÁGINA 1: MONITOR VENEZUELA --- */
            <motion.div 
              key="monitor"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col"
            >
              <div className="gauge-container relative flex items-center justify-center my-2 py-4">
                  <svg width="230" height="230" viewBox="0 0 230 230" className="absolute">
                    <circle cx="115" cy="115" r="102" fill="none" stroke="#1a1c1e" strokeWidth="14" />
                    <circle cx="115" cy="115" r="102" fill="none" stroke={trendColor} strokeWidth="14" strokeLinecap="round" strokeDasharray="641" className={`transition-all duration-500 ${isPulsing ? 'animate-pulse-intense' : 'opacity-90'}`} transform='rotate(-90 115 115)' />
                  </svg>
                  <svg width="180" height="180" viewBox="0 0 160 160" className="gauge-svg relative z-10">
                      <circle className="gauge-segment-bg" cx="80" cy="80" r="70" />
                      <motion.circle initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: dashOffset }} className="gauge-segment-progress" cx="80" cy="80" r="70" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
                      <span className="text-[8px] text-[#e2b053] font-black tracking-[2px] mb-1 uppercase">Diferencial</span>
                      <span className="font-rajdhani text-5xl font-extrabold tracking-tighter leading-none">{data?.brecha_porcentaje || (currentGap.toFixed(2) + '%')}</span>
                      <div className="mt-3 flex flex-col items-center pt-2 border-t border-white/20 w-28">
                          <span className="text-sm font-black text-white">Bs. {(usdtNum - bcvNum).toFixed(2)}</span>
                          <span className="text-[7px] text-white/80 font-black tracking-[2px] mt-0.5 uppercase">Brecha Neta</span>
                      </div>
                  </div>
              </div>

              <div className="news-banner-container my-2 relative">
                  <div className="glass-card px-4 py-2 flex justify-center items-center border-[#e2b053]/30 bg-[#e2b053]/10 gap-6">
                      <div className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest">
                          <CalendarDays className="w-3.5 h-3.5 text-[#e2b053]" /> {vzlaTime.dayName}
                      </div>
                      <div className="h-3 w-[1px] bg-white/30"></div>
                      <div className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5 text-[#e2b053]" /> {vzlaTime.time}
                      </div>
                  </div>
                  <div className="absolute -bottom-1 left-0 h-[2px] bg-[#e2b053]/40 w-full rounded-full overflow-hidden">
                      <motion.div className="h-full bg-[#e2b053]" style={{ width: `${progress}%` }} />
                  </div>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                      <div className="glass-card p-4">
                        <span className="text-[9px] text-white uppercase tracking-widest mb-1 font-black">Binance P2P</span>
                        <h3 className="font-rajdhani text-3xl font-bold">{data?.precio_usdt || '--,--'}</h3>
                        <p className="text-[8px] text-white/80 font-bold uppercase">VES / USDT</p>
                      </div>
                      <div className="glass-card p-4 flex flex-col justify-between">
                        <span className="text-[9px] text-white uppercase tracking-widest mb-1 font-black">Tendencia</span>
                        <span className="font-rajdhani text-2xl font-black text-right" style={{ color: trendColor }}>{data?.variacion_mercado || '0.00%'}</span>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      <div className="glass-card p-3 flex justify-between items-center bg-[#181a1b]/90">
                        <div><span className="text-[8px] text-white uppercase font-black">Euro BCV</span><span className="block font-rajdhani text-lg font-bold">€ {data?.precio_eur || '--,--'}</span></div>
                        <Landmark className="w-4 h-4 text-[#e2b053]/40" />
                      </div>
                      <div className="glass-card p-3 flex justify-between items-center bg-[#181a1b]/90">
                        <div><span className="text-[8px] text-white uppercase font-black">Dólar BCV</span><span className="block font-rajdhani text-lg font-bold">$ {data?.precio_bcv || '--,--'}</span></div>
                        <Landmark className="w-4 h-4 text-[#e2b053]/40" />
                      </div>
                  </div>
              </div>
            </motion.div>
          ) : (
            /* --- PÁGINA 2: GRID DE 14 TARJETAS --- */
            <motion.div 
              key="currencies"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-2 gap-3"
            >
              {otherCurrencies.map((c, i) => (
                <motion.div 
                  key={c.currency}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 flex flex-col border-white/5 bg-[#111214]"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-[#e2b053] tracking-widest">{c.currency}</span>
                    <TrendingUp className="w-3 h-3 text-white/20" />
                  </div>
                  <div className="font-rajdhani text-2xl font-bold">
                    {c.final_average}
                  </div>
                  <div className="text-[7px] text-white/40 uppercase font-black mt-1">Binance Average</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER DE CONTACTO (COMÚN) */}
        <footer className="mt-auto pt-6">
            <div className="glass-card p-2 px-4 flex items-center justify-between border-white/5 bg-white/5">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-3.5 h-3.5 text-[#e2b053]/60" />
                  <div className="flex flex-col">
                    <span className="text-[7px] text-[#e2b053]/80 uppercase font-black">Consultoría</span>
                    <span className="font-rajdhani text-xs font-bold">@JAIROKOV</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Instagram className="w-4 h-4 text-white/30" />
                  <Send className="w-4 h-4 text-white/30" />
                  <Twitter className="w-4 h-4 text-white/30" />
                </div>
            </div>
            <div className="text-center py-4 opacity-20 text-[8px] font-black uppercase tracking-[0.4em]">Jairokov Systems © 2026</div>
        </footer>
      </div>

      {/* --- MENÚ INFERIOR FIJO DE NAVEGACIÓN --- */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#050608]/90 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex justify-around items-center z-[500]">
        
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-[#e2b053]' : 'text-white/30'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Monitor</span>
          {activeTab === 'home' && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-[#e2b053] rounded-full mt-1" />}
        </button>

        <button 
          onClick={() => setActiveTab('currencies')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'currencies' ? 'text-[#e2b053]' : 'text-white/30'}`}
        >
          <Coins className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Monedas</span>
          {activeTab === 'currencies' && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-[#e2b053] rounded-full mt-1" />}
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-1 text-[#e2b053]">
          <Share2 className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Compartir</span>
        </button>

      </nav>
    </div>
  );
}
