import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, RefreshCw, Instagram, Send, Twitter, Landmark, 
  Calendar, Clock, Briefcase, Share2, CalendarDays, 
  LayoutDashboard, Coins, TrendingUp, TrendingDown 
} from 'lucide-react';

export default function App() {
  // ==========================================
  // 1. ESTADOS Y REFERENCIAS
  // ==========================================
  const [data, setData] = useState<any>(null);
  const [globalRates, setGlobalRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [trendColor, setTrendColor] = useState('#64748b'); 
  const [isPulsing, setIsPulsing] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false); 
  const [vzlaTime, setVzlaTime] = useState({ dayName: '', date: '', time: '' });
  
  // Relojes de animación (Segundos)
  const [sec60, setSec60] = useState(0); 
  const [sec300, setSec300] = useState(0); 
  
  const [activeTab, setActiveTab] = useState('home'); 
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ==========================================
  // 2. LÓGICA DE TIEMPO Y RELOJES ANIMADOS
  // ==========================================
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: any = { timeZone: 'America/Caracas' };
      
      try {
        setVzlaTime({
          dayName: new Intl.DateTimeFormat('es-VE', { ...options, weekday: 'long' }).format(now).toUpperCase(),
          date: new Intl.DateTimeFormat('es-VE', { ...options, day: '2-digit', month: '2-digit', year: 'numeric' }).format(now),
          time: new Intl.DateTimeFormat('es-VE', { ...options, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(now).toUpperCase()
        });
      } catch (e) { console.error("Error Intl", e); }
      
      setSec60(now.getSeconds());
      const fiveMinInMs = 300000;
      setSec300((Date.now() % fiveMinInMs) / 1000);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // 3. SINCRONIZACIÓN Y EFECTO GLITCH
  // ==========================================
  const sync = useCallback(async () => {
    setLoading(true);
    setIsGlitching(true); 
    setTimeout(() => setIsGlitching(false), 150);

    try {
      const res1 = await fetch('/precio-actual');
      const d1 = await res1.json();
      if (d1 && d1.id) {
        setTrendColor(d1.status === 'bajando' ? '#00d49a' : '#ff4b4b');
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 2500);
        if (d1.alerta_audio && !isMuted && isUnlocked) {
          audioRef.current?.play().catch(() => {});
        }
        setLastId(d1.id);
        setData(d1);
      }

      const res2 = await fetch('/global-rates'); 
      const dbData = await res2.json(); 
      if (dbData && dbData.length > 0) {
        const row = dbData[0];
        const coins = ['pen', 'cop', 'clp', 'ars', 'mxn', 'ves', 'pyg', 'dop', 'crc', 'eur', 'cad', 'bob', 'brl'];
        const list = coins.map(c => {
          const val = parseFloat(row[c]);
          const formatted = (val >= 400 && val <= 50000) ? Math.round(val).toString() : val.toFixed(2);
          return { name: c.toUpperCase(), price: formatted };
        });
        if (d1?.precio_bcv) list.push({ name: "BCV", price: d1.precio_bcv });
        setGlobalRates(list);
      }
    } catch (e) { console.error("Sync Error", e); } 
    finally { setTimeout(() => setLoading(false), 800); }
  }, [lastId, isMuted, isUnlocked]);

  useEffect(() => {
    if (isUnlocked) {
      sync();
      const interval = setInterval(sync, 300000);
      return () => clearInterval(interval);
    }
  }, [isUnlocked, sync]);

  // Compartir detallado
  const handleShare = async () => {
    let shareText = activeTab === 'home' 
      ? `📊 *HOO MONITOR BETA*\n💵 Binance: ${data?.precio_usdt || '--'}\n🏦 BCV: ${data?.precio_bcv || '--'}\n🏦 Euro: ${data?.precio_eur || '--'}`
      : `🌍 *PROMEDIO BINANCE P2P*\n\n${globalRates.map(c => `🔹 *${c.name}:* ${c.price}`).join('\n')}`;
    try {
      if (navigator.share) await navigator.share({ title: 'HOO Monitor', text: shareText, url: window.location.href });
      else { await navigator.clipboard.writeText(shareText + "\n" + window.location.href); alert('Enlace copiado'); }
    } catch (err) {}
  };

  // Pantalla de bloqueo
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-[#050608] z-[1000] flex flex-col items-center justify-center">
        <svg width="80" height="80" viewBox="0 0 100 100"><polyline points="20,35 50,55 80,35" fill="none" stroke="#e2b053" strokeWidth="5" strokeLinecap="round" /><circle cx="35" cy="50" r="11" fill="white" /><circle cx="65" cy="50" r="11" fill="white" /><circle cx="35" cy="50" r="4.5" fill="#050608" /><circle cx="65" cy="50" r="4.5" fill="#050608" /><polygon points="50,60 43,69 50,78 57,69" fill="#e2b053" /></svg>
        <h1 className="mt-6 font-rajdhani text-3xl font-bold tracking-[0.4em] text-white"><span className="text-[#e2b053]">H</span>OO</h1>
        <button onClick={() => setIsUnlocked(true)} className="mt-12 px-12 py-3 glass-card font-black text-[10px] text-[#e2b053] border border-[#e2b053]/20 uppercase tracking-[0.3em]">Conectar Terminal</button>
      </div>
    );
  }

  // Cálculos de Gauge con seguridad
  const bcvNum = parseFloat(String(data?.precio_bcv || '0').replace(',', '.'));
  const usdtNum = parseFloat(String(data?.precio_usdt || '0').replace(',', '.'));
  const currentGap = bcvNum > 0 ? ((usdtNum - bcvNum) / bcvNum) * 100 : 0;
  const dashOffset = 440 - (440 * Math.min(currentGap, 35) / 35);

  return (
    <div className={`h-screen w-full flex flex-col bg-[#050608] text-white overflow-hidden relative font-sans transition-opacity duration-75 ${isGlitching ? 'opacity-40' : 'opacity-100'}`}>
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      <div className="marketing-banner"><div className="marketing-content">/// JAIROKOV SYSTEMS: IA A MEDIDA /// AUTOMATIZACIÓN ESTRATÉGICA /// INNOVACIÓN TECNOLÓGICA ///</div></div>

      <div className="flex-1 flex flex-col container mx-auto max-w-lg px-6 py-4 no-scrollbar overflow-y-auto pb-32">
        
        {/* HEADER RESTAURADO CON COLOR DORADO */}
        <header className="flex justify-between items-start pt-2 mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 glass-card flex items-center justify-center border-[#e2b053]/20">
                    <svg width="22" height="22" viewBox="0 0 100 100"><polyline points="20,35 50,55 80,35" fill="none" stroke="#e2b053" strokeWidth="6" strokeLinecap="round" /><circle cx="35" cy="50" r="10" fill="white" /><circle cx="65" cy="50" r="10" fill="white" /><circle cx="35" cy="50" r="4" fill="#050608" /><circle cx="65" cy="50" r="4" fill="#050608" /><polygon points="50,60 44,68 50,76 56,68" fill="#e2b053" /></svg>
                </div>
                <div>
                  <h2 className="font-rajdhani text-xl font-bold tracking-widest leading-none">
                    <span className="text-[#e2b053]">H</span>OO
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 bg-[#00d49a] rounded-full animate-pulse shadow-[0_0_8px_#00d49a]"></div>
                    <p className="text-[7px] text-[#e2b053] font-black uppercase tracking-widest">
                      DOLAR MONITOR BETA
                    </p>
                  </div>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className="w-9 h-9 glass-card flex items-center justify-center" style={{ color: isMuted ? '#ff4b4b' : '#64748b' }}><Volume2 className="w-4 h-4" /></button>
                <button onClick={sync} className={`w-9 h-9 glass-card flex items-center justify-center text-white/30 ${loading ? 'animate-spin' : ''}`}><RefreshCw className="w-4 h-4" /></button>
            </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div key="h" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              {/* MONITOR PRINCIPAL CON ANILLO 60s */}
              <div className="gauge-container relative flex items-center justify-center my-2 py-4">
                  {/* Anillo exterior de 60 segundos */}
                  <svg width="240" height="240" viewBox="0 0 240 240" className="absolute">
                    <circle cx="120" cy="120" r="112" fill="none" stroke="#e2b053" strokeWidth="2" strokeDasharray="4 8" strokeOpacity="0.2" />
                    <circle 
                      cx="120" cy="120" r="112" fill="none" stroke="#e2b053" strokeWidth="2" 
                      strokeDasharray="703" strokeDashoffset={703 - (703 * (sec60 || 0) / 60)}
                      strokeLinecap="round" className="transition-all duration-1000 ease-linear" transform='rotate(-90 120 120)'
                    />
                  </svg>
                  
                  <svg width="220" height="220" viewBox="0 0 230 230" className="absolute"><circle cx="115" cy="115" r="102" fill="none" stroke="#1a1c1e" strokeWidth="
