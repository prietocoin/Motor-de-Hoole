import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, RefreshCw, Instagram, Send, Twitter, Landmark, 
  Calendar, Clock, Briefcase, Share2, CalendarDays, 
  LayoutDashboard, Coins, TrendingUp, TrendingDown 
} from 'lucide-react';

export default function App() {
  // --- ESTADOS ---
  const [data, setData] = useState<any>(null);
  const [globalRates, setGlobalRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [trendColor, setTrendColor] = useState('#64748b'); 
  const [vzlaTime, setVzlaTime] = useState({ dayName: '', date: '', time: '' });
  const [sec60, setSec60] = useState(0); 
  const [sec300, setSec300] = useState(0); 
  const [activeTab, setActiveTab] = useState('home'); 
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- RELOJES Y TIEMPO REAL ---
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
      } catch (e) {}
      setSec60(now.getSeconds());
      setSec300(((Date.now() % 300000) / 1000));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- SINCRONIZACIÓN (CON CACHE-BUSTING) ---
  const sync = useCallback(async () => {
    setLoading(true);
    try {
      // ?t= asegura que el navegador no use datos viejos de Binance
      const res1 = await fetch(`/precio-actual?t=${Date.now()}`);
      const d1 = await res1.json();
      if (d1 && d1.id) {
        setTrendColor(d1.status === 'bajando' ? '#00d49a' : '#ff4b4b');
        if (d1.alerta_audio && !isMuted && isUnlocked) audioRef.current?.play().catch(() => {});
        setLastId(d1.id);
        setData(d1);
      }
      const res2 = await fetch(`/global-rates?t=${Date.now()}`); 
      const dbData = await res2.json(); 
      if (dbData && dbData.length > 0) {
        const row = dbData[0];
        const coins = ['pen', 'cop', 'clp', 'ars', 'mxn', 'ves', 'pyg', 'dop', 'crc', 'eur', 'cad', 'bob', 'brl'];
        const list = coins.map(c => ({
          name: c.toUpperCase(),
          price: (parseFloat(row[c]) >= 400) ? Math.round(parseFloat(row[c])).toString() : parseFloat(row[c]).toFixed(2)
        }));
        if (d1?.precio_bcv) list.push({ name: "BCV", price: d1.precio_bcv });
        setGlobalRates(list);
      }
    } catch (e) {} finally { setLoading(false); }
  }, [lastId, isMuted, isUnlocked]);

  useEffect(() => { if (isUnlocked) { sync(); const i = setInterval(sync, 15000); return () => clearInterval(i); } }, [isUnlocked, sync]);

  const handleShare = async () => {
    const text = activeTab === 'home' 
      ? `📊 *HOO MONITOR BETA*\n💵 Binance: ${data?.precio_usdt}\n🏦 BCV: ${data?.precio_bcv}`
      : `🌍 *PROMEDIO BINANCE P2P*\n\n${globalRates.map(c => `🔹 *${c.name}:* ${c.price}`).join('\n')}`;
    if (navigator.share) await navigator.share({ title: 'HOO Monitor', text, url: window.location.href });
  };

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-[#050608] z-[1000] flex flex-col items-center justify-center">
        <svg width="80" height="80" viewBox="0 0 100 100"><polyline points="20,35 50,55 80,35" fill="none" stroke="#e2b053" strokeWidth="5" strokeLinecap="round" /><circle cx="35" cy="50" r="11" fill="white" /><circle cx="65" cy="50" r="11" fill="white" /><circle cx="35" cy="50" r="4.5" fill="#050608" /><circle cx="65" cy="50" r="4.5" fill="#050608" /><polygon points="50,60 43,69 50,78 57,69" fill="#e2b053" /></svg>
        <h1 className="mt-6 font-rajdhani text-3xl font-bold tracking-[0.4em] text-white"><span className="text-[#e2b053]">H</span>OO</h1>
        <button onClick={() => setIsUnlocked(true)} className="mt-12 px-12 py-3 border border-[#e2b053]/20 font-black text-[10px] text-[#e2b053] uppercase tracking-[0.3em] rounded-full">Conectar Terminal</button>
      </div>
    );
  }

  const bcvNum = parseFloat(String(data?.precio_bcv || '0').replace(',', '.'));
  const usdtNum = parseFloat(String(data?.precio_usdt || '0').replace(',', '.'));

  return (
    <div className="h-screen w-full flex flex-col bg-[#050608] text-white overflow-hidden relative font-sans">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      <div className="marketing-banner"><div className="marketing-content">/// JAIROKOV SYSTEMS: IA A MEDIDA /// AUTOMATIZACIÓN ESTRATÉGICA /// INNOVACIÓN TECNOLÓGICA ///</div></div>

      <div className="flex-1 flex flex-col container mx-auto max-w-lg px-6 py-4 no-scrollbar overflow-y-auto pb-32">
        <header className="flex justify-between items-start pt-2 mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-[#e2b053]/30 flex items-center justify-center rounded-xl bg-[#e2b053]/5">
                    <svg width="22" height="22" viewBox="0 0 100 100"><polyline points="20,35 50,55 80,35" fill="none" stroke="#e2b053" strokeWidth="6" strokeLinecap="round" /><circle cx="35" cy="50" r="10" fill="white" /><circle cx="65" cy="50" r="10" fill="white" /><circle cx="35" cy="50" r="4" fill="#050608" /><circle cx="65" cy="50" r="4" fill="#050608" /><polygon points="50,60 44,68 50,76 56,68" fill="#e2b053" /></svg>
                </div>
                <div>
                  <h2 className="font-rajdhani text-xl font-bold tracking-widest leading-none"><span className="text-[#e2b053]">H</span>OO</h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 bg-[#00d49a] rounded-full animate-pulse shadow-[0_0_8px_#00d49a]"></div>
                    <p className="text-[7px] text-[#e2b053] font-black uppercase tracking-widest">DOLAR MONITOR BETA</p>
                  </div>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className="w-9 h-9 border border-white/5 rounded-full flex items-center justify-center bg-white/5" style={{ color: isMuted ? '#ff4b4b' : '#e2b053' }}><Volume2 className="w-4 h-4" /></button>
                <button onClick={sync} className={`w-9 h-9 border border-white/5 rounded-full flex items-center justify-center bg-white/5 text-[#e2b053] ${loading ? 'animate-spin' : ''}`}><RefreshCw className="w-4 h-4" /></button>
            </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="relative flex items-center justify-center my-4 py-4">
                  {/* Anillo de 60s */}
                  <svg width="250" height="250" viewBox="0 0 250 250" className="absolute">
                    <circle cx="125" cy="125" r="115" fill="none" stroke="#e2b053" strokeWidth="2" strokeDasharray="4 8" strokeOpacity="0.1" />
                    <circle cx="125" cy="125" r="115" fill="none" stroke="#e2b053" strokeWidth="2" strokeDasharray="722" strokeDashoffset={722 - (722 * sec60 / 60)} strokeLinecap="round" transform='rotate(-90 125 125)' className="transition-all duration-1000 ease-linear" />
                  </svg>
                  {/* Círculo Dentado Corporativo */}
                  <svg width="215" height="215" viewBox="0 0 215 215" className="absolute">
                    <circle cx="107.5" cy="107.5" r="95" fill="none" stroke="#e2b053" strokeWidth="10" strokeDasharray="2 3" strokeOpacity="0.7" />
                  </svg>
                  <svg width="220" height="220" viewBox="0 0 230 230" className="absolute rotate-[-90deg]"><circle cx="115" cy="115" r="102" fill="none" stroke="#1a1c1e" strokeWidth="14" /><circle cx="115" cy="115" r="102" fill="none" stroke={trendColor} strokeWidth="14" strokeLinecap="round" className="opacity-90 transition-all duration-500" /></svg>
                  
                  <div className="z-10 flex flex-col items-center text-center">
                    <span className="text-[9px] text-[#e2b053] font-black tracking-[3px] uppercase mb-1">Diferencial</span>
                    <span className="font-rajdhani text-6xl font-extrabold tracking-tighter leading-none">{data?.brecha_porcentaje || '0.00%'}</span>
                    <div className="mt-4 pt-2 border-t border-white/20 w-32 flex flex-col items-center">
                      <span className="text-base font-black text-white">Bs. {(usdtNum - bcvNum).toFixed(2)}</span>
                      <span className="text-[8px] text-[#e2b053] font-black tracking-[2px] uppercase">Brecha Neta</span>
                    </div>
                  </div>
              </div>

              {/* Banner de Tiempo */}
              <div className="my-4 border border-[#e2b053]/20 rounded-xl px-5 py-2.5 flex justify-between items-center bg-[#e2b053]/5 text-[9px] font-black uppercase">
                <div className="flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5 text-[#e2b053]" /> {vzlaTime.dayName}</div>
                <div>{vzlaTime.date}</div>
                <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#e2b053]" /> {vzlaTime.time}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="border border-white/5 rounded-2xl p-4 bg-[#111214]"><span className="text-[10px] text-[#e2b053] uppercase font-black tracking-wider">Binance P2P</span><h3 className="font-rajdhani text-3xl font-bold mt-1">{data?.precio_usdt || '--,--'}</h3></div>
                <div className="border border-white/5 rounded-2xl p-4 bg-[#111214] flex flex-col justify-between">
                  <span className="text-[10px] text-[#e2b053] uppercase font-black tracking-wider">Tendencia</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-rajdhani text-2xl font-black" style={{ color: trendColor }}>{data?.variacion_mercado || '0.00%'}</span>
                    {data?.status === 'subiendo' ? <TrendingUp className="w-6 h-6 text-[#ff4b4b]" /> : <TrendingDown className="w-6 h-6 text-[#00d49a]" />}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="border border-white/5 rounded-2xl p-4 flex justify-between items-center bg-[#111214]">
                  <div><span className="text-[9px] text-[#e2b053] font-black uppercase">Euro BCV</span><span className="block font-rajdhani text-xl font-bold mt-0.5">€ {data?.precio_eur || '--,--'}</span></div>
                  <Landmark className="w-5 h-5 text-[#e2b053]/40" />
                </div>
                <div className="border border-white/5 rounded-2xl p-4 flex justify-between items-center bg-[#111214]">
                  <div><span className="text-[9px] text-[#e2b053] font-black uppercase">Dólar BCV</span><span className="block font-rajdhani text-xl font-bold mt-0.5">$ {data?.precio_bcv || '--,--'}</span></div>
                  <Landmark className="w-5 h-5 text-[#e2b053]/40" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
