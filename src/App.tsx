import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, RefreshCw, Instagram, Send, Twitter, Landmark, 
  Calendar, Clock, Briefcase, Share2, CalendarDays, 
  LayoutDashboard, Coins, TrendingUp 
} from 'lucide-react';

export default function App() {
  // ==========================================
  // 1. ESTADOS (DATOS Y NAVEGACIÓN)
  // ==========================================
  const [data, setData] = useState<any>(null); // Monitor Venezuela (Trae precio_bcv)
  const [globalRates, setGlobalRates] = useState<any[]>([]); // Tasas Globales + BCV al final
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [trendColor, setTrendColor] = useState('#64748b'); 
  const [isPulsing, setIsPulsing] = useState(false);
  const [vzlaTime, setVzlaTime] = useState({ dayName: '', date: '', time: '' });
  const [progress, setProgress] = useState(100);
  
  const [activeTab, setActiveTab] = useState('home'); 
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ==========================================
  // 2. RELOJ Y PROGRESO (VENEZUELA)
  // ==========================================
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: any = { timeZone: 'America/Caracas' };
      setVzlaTime({
        dayName: new Intl.DateTimeFormat('es-VE', { ...options, weekday: 'long' }).format(now),
        date: new Intl.DateTimeFormat('es-VE', { ...options, day: '2-digit', month: '2-digit', year: 'numeric' }).format(now),
        time: new Intl.DateTimeFormat('es-VE', { ...options, hour: '2-digit', minute: '2-digit', hour12: true }).format(now)
      });
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev <= 0 ? 100 : prev - 0.33));
    }, 100);
    return () => clearInterval(interval);
  }, [isUnlocked]);

  // ==========================================
  // 3. SINCRONIZACIÓN (SUPABASE)
  // ==========================================
  const sync = useCallback(async () => {
    setLoading(true);
    try {
      // Petición 1: Monitor Principal (Obtenemos precio_bcv real)
      const res1 = await fetch('/precio-actual');
      const d1 = await res1.json();
      if (d1 && d1.id !== lastId) {
        setTrendColor(d1.status === 'bajando' ? '#00d49a' : '#ff4b4b');
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 2500);
        if (d1.alerta_audio && !isMuted && isUnlocked) audioRef.current?.play().catch(() => {});
        setLastId(d1.id);
        setData(d1);
      }

      // Petición 2: Tasas Globales
      const res2 = await fetch('/global-rates'); 
      const dbData = await res2.json(); 

      if (dbData && dbData.length > 0) {
        const row = dbData[0]; 
        const coins = ['pen', 'cop', 'clp', 'ars', 'mxn', 'ves', 'pyg', 'dop', 'crc', 'eur', 'cad', 'bob', 'brl'];
        
        // Mapeo de monedas P2P
        const list = coins.map(c => {
          const val = parseFloat(row[c]);
          const formatted = (val >= 400 && val <= 50000) ? Math.round(val).toString() : val.toFixed(2);
          return { name: c.toUpperCase(), price: formatted };
        });

        // INYECCIÓN DEL BCV AL FINAL DE LA LISTA
        if (d1?.precio_bcv) {
          list.push({ name: "BCV", price: d1.precio_bcv });
        }

        setGlobalRates(list);
      }
    } catch (e) {
      console.error("Error Sync", e);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, [lastId, isMuted, isUnlocked]);

  useEffect(() => {
    if (isUnlocked) {
      sync();
      const interval = setInterval(sync, 300000);
      return () => clearInterval(interval);
    }
  }, [isUnlocked, sync]);

  // ==========================================
  // 4. COMPARTIR INTELIGENTE (DETALLADO)
  // ==========================================
  const handleShare = async () => {
    let shareText = '';

    if (activeTab === 'home') {
      shareText = `📊 *HOO Monitor - Venezuela*\n💵 Binance: ${data?.precio_usdt || '--,--'}\n🏦 BCV: ${data?.precio_bcv || '--,--'}\n🏦 Euro: ${data?.precio_eur || '--,--'}`;
    } else {
      // Genera lista con BCV al final
      const detalle = globalRates.map(c => `🔹 *${c.name}:* ${c.price}`).join('\n');
      shareText = `🌍 *Tasas Globales P2P (Binance)*\n\n${detalle}`;
    }

    const shareData = {
      title: 'HOO Monitor',
      text: `${shareText}\n\nConsúltalo en vivo:`,
      url: window.location.href
    };

    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Copiado al portapapeles');
      }
    } catch (err) {}
  };

  // Pantalla de bloqueo
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-[#050608] z-[1000] flex flex-col items-center justify-center">
        <svg width="80" height="80" viewBox="0 0 100 100"><polyline points="20,35 50,55 80,35" fill="none" stroke="#e2b053" strokeWidth="5" strokeLinecap="round" /><circle cx="35" cy="50" r="11" fill="white" /><circle cx="65" cy="50" r="11" fill="white" /><circle cx="35" cy="50" r="4.5" fill="#050608" /><circle cx="65" cy="50" r="4.5" fill="#050608" /><polygon points="50,60 43,69 50,78 57,69" fill="#e2b053" /></svg>
        <h1 className="mt-6 font-rajdhani text-3xl font-bold tracking-[0.4em] text-white">HOO</h1>
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
      <div className="marketing-banner"><div className="marketing-content">/// JAIROKOV SYSTEMS: SOLUCIONES DE IA A MEDIDA /// AUTOMATIZACIÓN ESTRATÉGICA /// GESTIÓN DE DATOS ///</div></div>

      <div className="flex-1 flex flex-col container mx-auto max-w-lg px-6 py-4 no-scrollbar overflow-y-auto pb-32">
        <header className="flex justify-between items-start pt-2 mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 glass-card flex items-center justify-center border-white/5">
                    <svg width="22" height="22" viewBox="0 0 100 100"><polyline points="20,35 50,55 80,35" fill="none" stroke="#e2b053" strokeWidth="6" strokeLinecap="round" /><circle cx="35" cy="50" r="10" fill="white" /><circle cx="65" cy="50" r="10" fill="white" /><circle cx="35" cy="50" r="4" fill="#050608" /><circle cx="65" cy="50" r="4" fill="#050608" /><polygon points="50,60 44,68 50,76 56,68" fill="#e2b053" /></svg>
                </div>
                <div><h2 className="font-rajdhani text-xl font-bold tracking-widest leading-none">HOO</h2><p className="text-[7px] text-white/50 font-black uppercase mt-1 tracking-widest">Jairokov Systems © 2026</p></div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className="w-9 h-9 glass-card flex items-center justify-center" style={{ color: isMuted ? '#ff4b4b' : '#64748b' }}><Volume2 className="w-4 h-4" /></button>
                <button onClick={sync} className={`w-9 h-9 glass-card flex items-center justify-center text-white/30 ${loading ? 'animate-spin' : ''}`}><RefreshCw className="w-4 h-4" /></button>
            </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div key="h" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col">
              <div className="gauge-container relative flex items-center justify-center my-2 py-4">
                  <svg width="230" height="230" viewBox="0 0 230 230" className="absolute"><circle cx="115" cy="115" r="102" fill="none" stroke="#1a1c1e" strokeWidth="14" /><circle cx="115" cy="115" r="102" fill="none" stroke={trendColor} strokeWidth="14" strokeLinecap="round" className={`transition-all duration-500 ${isPulsing ? 'animate-pulse' : 'opacity-90'}`} transform='rotate(-90 115 115)' /></svg>
                  <svg width="180" height="180" viewBox="0 0 160 160" className="gauge-svg relative z-10"><circle className="gauge-segment-bg" cx="80" cy="80" r="70" /><motion.circle initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: dashOffset }} className="gauge-segment-progress" cx="80" cy="80" r="70" /></svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20"><span className="text-[8px] text-[#e2b053] font-black tracking-[2px] mb-1 uppercase">Diferencial</span><span className="font-rajdhani text-5xl font-extrabold tracking-tighter leading-none">{data?.brecha_porcentaje || '0.00%'}</span><div className="mt-3 flex flex-col items-center pt-2 border-t border-white/20 w-28"><span className="text-sm font-black text-white">Bs. {(usdtNum - bcvNum).toFixed(2)}</span><span className="text-[7px] text-white/80 font-black tracking-[2px] mt-0.5 uppercase">Brecha Neta</span></div></div>
              </div>
              <div className="news-banner-container my-2 relative"><div className="glass-card px-4 py-2 flex justify-center items-center border-[#e2b053]/30 bg-[#e2b053]/10 gap-6"><div className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest"><CalendarDays className="w-3.5 h-3.5 text-[#e2b053]" /> {vzlaTime.dayName}</div><div className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest"><Clock className="w-3.5 h-3.5 text-[#e2b053]" /> {vzlaTime.time}</div></div></div>
              <div className="grid grid-cols-2 gap-3 mt-4"><div className="glass-card p-4 flex flex-col"><span className="text-[9px] text-white uppercase font-black tracking-widest mb-1">Binance P2P</span><h3 className="font-rajdhani text-3xl font-bold">{data?.precio_usdt || '--,--'}</h3></div><div className="glass-card p-4 flex flex-col justify-between"><span className="text-[9px] text-white uppercase font-black tracking-widest">Tendencia</span><span className="font-rajdhani text-2xl font-black text-right" style={{ color: trendColor }}>{data?.variacion_mercado || '0.00%'}</span></div></div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="glass-card p-3 flex justify-between items-center bg-[#181a1b]/90">
                    <div><span className="text-[8px] text-white uppercase font-black tracking-wider">Euro BCV</span><span className="block font-rajdhani text-lg font-bold">€ {data?.precio_eur || '--,--'}</span></div>
                    <Landmark className="w-4 h-4 text-[#e2b053]/40" />
                  </div>
                  <div className="glass-card p-3 flex justify-between items-center bg-[#181a1b]/90">
                    <div><span className="text-[8px] text-white uppercase font-black tracking-wider">Dólar BCV</span><span className="block font-rajdhani text-lg font-bold">$ {data?.precio_bcv || '--,--'}</span></div>
                    <Landmark className="w-4 h-4 text-[#e2b053]/40" />
                  </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="c" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col">
              <div className="flex flex-col items-center mb-6"><span className="text-[10px] font-black text-[#e2b053] tracking-[0.3em] uppercase">Promedio Binance P2P</span><div className="h-[1px] w-20 bg-[#e2b053]/30 mt-2"></div></div>
              <div className="grid grid-cols-2 gap-3">
                {globalRates.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="glass-card p-3 flex items-center justify-between border-white/5 bg-[#111214]">
                    <span className="text-[11px] font-black text-[#e2b053]">{c.name}</span>
                    <div className="flex items-center gap-2"><span className="font-rajdhani text-xl font-bold tracking-tighter">{c.price}</span><TrendingUp className="w-2.5 h-2.5 text-[#00d49a] opacity-30" /></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-auto pt-8"><div className="glass-card p-2 px-4 flex items-center justify-between border-white/5 bg-white/5 opacity-80"><div className="flex items-center gap-3"><Briefcase className="w-3.5 h-3.5 text-[#e2b053]/60" /><span className="text-[8px] font-black uppercase">@JAIROKOV SYSTEMS</span></div><div className="flex gap-4"><Instagram className="w-4 h-4 text-white/30" /><Send className="w-4 h-4 text-white/30" /></div></div></footer>
      </div>

      <nav className="fixed bottom-0 left-0 w-full bg-[#050608]/95 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex justify-around items-center z-[500]">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#e2b053]' : 'text-white/30'}`}><LayoutDashboard className="w-5 h-5" /><span className="text-[8px] font-black uppercase">Monitor</span></button>
        <button onClick={() => setActiveTab('currencies')} className={`flex flex-col items-center gap-1 ${activeTab === 'currencies' ? 'text-[#e2b053]' : 'text-white/30'}`}><Coins className="w-5 h-5" /><span className="text-[8px] font-black uppercase">Tasas</span></button>
        <button onClick={handleShare} className="flex flex-col items-center gap-1 text-[#e2b053]"><Share2 className="w-5 h-5" /><span className="text-[8px] font-black uppercase">Compartir</span></button>
      </nav>
    </div>
  );
}
