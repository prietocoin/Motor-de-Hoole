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
  const [vzlaTime, setVzlaTime] = useState({ dayName: '', date: '', time: '' });
  
  const [sec60, setSec60] = useState(0); 
  const [count300, setCount300] = useState(300); 
  
  const [activeTab, setActiveTab] = useState('home'); 
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ==========================================
  // 2. RELOJES Y TIEMPO REAL
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
      } catch (e) {}
      setSec60(now.getSeconds());
      setCount300((prev) => (prev <= 1 ? 300 : prev - 1));
    };
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // 3. SINCRONIZACIÓN (MONITOR: 60s / TASAS: 300s)
  // ==========================================
  const syncMonitor = useCallback(async () => {
    try {
      const res = await fetch(`/precio-actual?t=${Date.now()}`);
      const d = await res.json();
      if (d && d.id !== lastId) {
        setTrendColor(d.status === 'bajando' ? '#00d49a' : '#ff4b4b');
        if (d.alerta_audio && !isMuted && isUnlocked) audioRef.current?.play().catch(() => {});
        setLastId(d.id);
        setData(d);
      }
    } catch (e) {}
  }, [lastId, isMuted, isUnlocked]);

  const syncGlobal = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/global-rates?t=${Date.now()}`); 
      const dbData = await res.json(); 
      if (dbData && dbData.length > 0) {
        const row = dbData[0];
        const coins = ['pen', 'cop', 'clp', 'ars', 'mxn', 'ves', 'pyg', 'dop', 'crc', 'eur', 'cad', 'bob', 'brl'];
        const list = coins.map(c => ({
          name: c.toUpperCase(),
          price: (parseFloat(row[c]) >= 400) ? Math.round(parseFloat(row[c])).toString() : parseFloat(row[c]).toFixed(2)
        }));
        if (data?.precio_bcv) list.push({ name: "BCV", price: data.precio_bcv });
        setGlobalRates(list);
      }
    } catch (e) {} finally { setLoading(false); }
  }, [data]);

  useEffect(() => {
    if (!isUnlocked) return;
    syncMonitor();
    const iMonitor = setInterval(syncMonitor, 60000); // ACTUALIZACIÓN CADA 60 SEGUNDOS
    return () => clearInterval(iMonitor);
  }, [isUnlocked, syncMonitor]);

  useEffect(() => {
    if (!isUnlocked) return;
    syncGlobal();
    const iGlobal = setInterval(syncGlobal, 300000); // ACTUALIZACIÓN CADA 300 SEGUNDOS
    return () => clearInterval(iGlobal);
  }, [isUnlocked, syncGlobal]);

  // ==========================================
  // 4. COMPARTIR
  // ==========================================
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
      <div className="marketing-banner"><div className="marketing-content text-[10px]">/// JAIROKOV SYSTEMS: IA A MEDIDA /// AUTOMATIZACIÓN ESTRATÉGICA /// INNOVACIÓN TECNOLÓGICA ///</div></div>

      <div className="flex-1 flex flex-col container mx-auto max-w-lg px-6 py-4 no-scrollbar overflow-y-auto pb-32">
        <header className="flex justify-between items-start pt-2 mb-2">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 border border-[#e2b053]/30 flex items-center justify-center rounded-xl bg-[#e2b053]/5">
                    <svg width="20" height="20" viewBox="0 0 100 100"><polyline points="20,35 50,55 80,35" fill="none" stroke="#e2b053" strokeWidth="6" strokeLinecap="round" /><circle cx="35" cy="50" r="10" fill="white" /><circle cx="65" cy="50" r="10" fill="white" /><circle cx="35" cy="50" r="4" fill="#050608" /><circle cx="65" cy="50" r="4" fill="#050608" /><polygon points="50,60 44,68 50,76 56,68" fill="#e2b053" /></svg>
                </div>
                <div>
                  <h2 className="font-rajdhani text-lg font-bold tracking-widest leading-none"><span className="text-[#e2b053]">H</span>OO</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-[#00d49a] rounded-full animate-pulse shadow-[0_0_8px_#00d49a]"></div>
                    <p className="text-[7px] text-[#e2b053] font-black uppercase tracking-widest">DOLAR MONITOR BETA</p>
                  </div>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className="w-8 h-8 border border-white/5 rounded-full flex items-center justify-center bg-white/5" style={{ color: isMuted ? '#ff4b4b' : '#e2b053' }}><Volume2 size={14} /></button>
                <button onClick={syncMonitor} className="w-8 h-8 border border-white/5 rounded-full flex items-center justify-center bg-white/5 text-[#e2b053]"><RefreshCw size={14} /></button>
            </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
              <div className="relative flex items-center justify-center py-6">
                  {/* Reloj exterior 60s */}
                  <svg width="220" height="220" viewBox="0 0 250 250" className="absolute">
                    <circle cx="125" cy="125" r="115" fill="none" stroke="#e2b053" strokeWidth="1.5" strokeDasharray="5 10" strokeOpacity="0.1" />
                    <circle cx="125" cy="125" r="115" fill="none" stroke="#e2b053" strokeWidth="2" strokeDasharray="722" strokeDashoffset={722 - (722 * sec60 / 60)} strokeLinecap="round" transform='rotate(-90 125 125)' className="transition-all duration-1000 ease-linear" />
                  </svg>
                  {/* Círculo Dentado Corporativo */}
                  <svg width="190" height="190" viewBox="0 0 215 215" className="absolute">
                    <circle cx="107.5" cy="107.5" r="95" fill="none" stroke="#e2b053" strokeWidth="10" strokeDasharray="2 3" strokeOpacity="0.7" />
                  </svg>
                  <svg width="200" height="200" viewBox="0 0 230 230" className="absolute rotate-[-90deg]"><circle cx="115" cy="115" r="102" fill="none" stroke="#1a1c1e" strokeWidth="14" /><circle cx="115" cy="115" r="102" fill="none" stroke={trendColor} strokeWidth="14" strokeLinecap="round" className="opacity-90" /></svg>
                  
                  <div className="z-10 flex flex-col items-center text-center">
                    <span className="text-[8px] text-[#e2b053] font-black tracking-[2px] uppercase mb-0.5">Diferencial</span>
                    <span className="font-rajdhani text-5xl font-extrabold tracking-tighter leading-none">{data?.brecha_porcentaje || '0.00%'}</span>
                    <div className="mt-2 pt-1 border-t border-white/20 w-28 flex flex-col items-center">
                      <span className="text-sm font-black text-white">Bs. {(usdtNum - bcvNum).toFixed(2)}</span>
                      <span className="text-[7px] text-[#e2b053] font-black tracking-[2px] uppercase">Brecha Neta</span>
                    </div>
                  </div>
              </div>

              <div className="my-2 border border-[#e2b053]/20 rounded-xl px-4 py-2 flex justify-between items-center bg-[#e2b053]/5 text-[8px] font-black uppercase">
                <div className="flex items-center gap-2 text-white"><CalendarDays size={12} className="text-[#e2b053]" /> {vzlaTime.dayName}</div>
                <div className="text-white">{vzlaTime.date}</div>
                <div className="flex items-center gap-2 text-white"><Clock size={12} className="text-[#e2b053]" /> {vzlaTime.time}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="border border-white/5 rounded-2xl p-3 bg-[#111214]"><span className="text-[9px] text-[#e2b053] uppercase font-black tracking-wider">Binance P2P</span><h3 className="font-rajdhani text-2xl font-bold mt-1">{data?.precio_usdt || '--,--'}</h3></div>
                <div className="border border-white/5 rounded-2xl p-3 bg-[#111214] flex flex-col justify-between">
                  <span className="text-[9px] text-[#e2b053] uppercase font-black tracking-wider">Tendencia</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-rajdhani text-2xl font-black" style={{ color: trendColor }}>{data?.variacion_mercado || '0.00%'}</span>
                    {data?.status === 'subiendo' ? <TrendingUp size={20} className="text-[#ff4b4b]" /> : <TrendingDown size={20} className="text-[#00d49a]" />}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="border border-white/5 rounded-2xl p-3 flex justify-between items-center bg-[#111214]">
                  <div><span className="text-[8px] text-[#e2b053] font-black uppercase">Euro BCV</span><span className="block font-rajdhani text-lg font-bold">€ {data?.precio_eur || '--,--'}</span></div>
                  <Landmark size={18} className="text-[#e2b053]/40" />
                </div>
                <div className="border border-white/5 rounded-2xl p-3 flex justify-between items-center bg-[#111214]">
                  <div><span className="text-[8px] text-[#e2b053] font-black uppercase">Dólar BCV</span><span className="block font-rajdhani text-lg font-bold">$ {data?.precio_bcv || '--,--'}</span></div>
                  <Landmark size={18} className="text-[#e2b053]/40" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-[#e2b053] tracking-[0.3em] uppercase">Promedio Binance P2P</span>
                  <div className="relative w-7 h-7 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" className="absolute"><circle cx="12" cy="12" r="10" fill="none" stroke="#e2b053" strokeWidth="2" strokeOpacity="0.1" /><circle cx="12" cy="12" r="10" fill="none" stroke="#e2b053" strokeWidth="2" strokeDasharray="63" strokeDashoffset={63 - (63 * (300 - count300) / 300)} strokeLinecap="round" transform="rotate(-90 12 12)" /></svg>
                    <span className="text-[7px] font-black text-[#e2b053]">{Math.floor(count300/60)}m</span>
                  </div>
                </div>
                <div className="h-[2px] w-14 bg-[#e2b053]/40 mt-2 rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {globalRates.map((c, i) => (
                  <div key={i} className="border border-white/5 rounded-xl p-3 flex items-center justify-between bg-[#111214]">
                    <span className="text-[11px] font-black text-[#e2b053]">{c.name}</span>
                    <div className="flex items-center gap-2"><span className="font-rajdhani text-lg font-bold">{c.price}</span><TrendingUp size={12} className="text-[#00d49a] opacity-30" /></div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-auto pt-4">
            <div className="border border-[#e2b053]/10 bg-[#e2b053]/5 p-2 px-4 flex items-center justify-between rounded-2xl">
                <div className="flex items-center gap-3">
                  <Briefcase size={14} className="text-[#e2b053]" />
                  <div className="flex flex-col">
                    <span className="text-[7px] text-[#e2b053] font-black uppercase leading-none">Consultoría / Contrataciones</span>
                    <span className="font-rajdhani text-xs font-bold text-white mt-0.5">@JAIROKOV</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <a href="https://instagram.com/jairokov" target="_blank" rel="noreferrer"><Instagram size={16} className="text-white/40 hover:text-[#e2b053]" /></a>
                  <a href="https://t.me/jairokov" target="_blank" rel="noreferrer"><Send size={16} className="text-white/40 hover:text-[#e2b053]" /></a>
                  <a href="https://twitter.com/jairokov" target="_blank" rel="noreferrer"><Twitter size={16} className="text-white/40 hover:text-[#e2b053]" /></a>
                </div>
            </div>
            <div className="text-center py-4 text-[8px] text-white/10 uppercase font-black tracking-widest">Propiedad de Jairokov Systems © 2026</div>
        </footer>
      </div>

      <nav className="fixed bottom-0 left-0 w-full bg-[#050608]/98 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex justify-around items-center z-[500]">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#e2b053]' : 'text-white/20'}`}><LayoutDashboard size={22} /><span className="text-[8px] font-black uppercase">Monitor</span></button>
        <button onClick={() => setActiveTab('currencies')} className={`flex flex-col items-center gap-1 ${activeTab === 'currencies' ? 'text-[#e2b053]' : 'text-white/20'}`}><Coins size={22} /><span className="text-[8px] font-black uppercase">Tasas</span></button>
        <button onClick={handleShare} className="flex flex-col items-center gap-1 text-[#e2b053] hover:scale-110 active:scale-95 transition-all"><Share2 size={22} /><span className="text-[8px] font-black uppercase">Compartir</span></button>
      </nav>
    </div>
  );
}
