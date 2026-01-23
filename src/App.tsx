import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, RefreshCw, Instagram, Send, Twitter, Landmark, 
  Clock, Briefcase, Share2, CalendarDays, 
  LayoutDashboard, Coins, TrendingUp, TrendingDown, Gauge
} from 'lucide-react';

export default function App() {
  // ==========================================
  // 1. ESTADOS (MANTENIENDO LÓGICA DE TIEMPO)
  // ==========================================
  const [data, setData] = useState<any>(null);
  const [globalRates, setGlobalRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [trendColor, setTrendColor] = useState('#64748b'); 
  const [vzlaTime, setVzlaTime] = useState({ dayName: '', date: '', time: '' });
  
  const [count60, setCount60] = useState(60); 
  const [count300, setCount300] = useState(300); 
  
  const [activeTab, setActiveTab] = useState('home'); 
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ==========================================
  // 2. RELOJES Y CONTEO REGRESIVO
  // ==========================================
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const options: any = { timeZone: 'America/Caracas' };
      try {
        setVzlaTime({
          dayName: new Intl.DateTimeFormat('es-VE', { ...options, weekday: 'long' }).format(now).toUpperCase(),
          date: new Intl.DateTimeFormat('es-VE', { ...options, day: '2-digit', month: '2-digit' }).format(now),
          time: new Intl.DateTimeFormat('es-VE', { ...options, hour: '2-digit', minute: '2-digit', hour12: true }).format(now).toUpperCase()
        });
      } catch (e) {}

      if (isUnlocked) {
        setCount60((prev) => (prev <= 1 ? 60 : prev - 1));
        setCount300((prev) => (prev <= 1 ? 300 : prev - 1));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isUnlocked]);

  // ==========================================
  // 3. SINCRONIZACIÓN (Bypass de Caché)
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
    } catch (e) {} finally { setTimeout(() => setLoading(false), 800); }
  }, [data]);

  useEffect(() => { if (count60 === 60 && isUnlocked) syncMonitor(); }, [count60, isUnlocked, syncMonitor]);
  useEffect(() => { if (count300 === 300 && isUnlocked) syncGlobal(); }, [count300, isUnlocked, syncGlobal]);

  const handleShare = async () => {
    const text = activeTab === 'home' 
      ? `📊 *HOO MONITOR BETA*\nBinance: ${data?.precio_usdt}\nBCV: ${data?.precio_bcv}\nTendencia: ${data?.variacion_mercado}`
      : `🌍 *TASAS P2P*\n\n${globalRates.map(c => `🔹 *${c.name}:* ${c.price}`).join('\n')}`;
    if (navigator.share) await navigator.share({ title: 'HOO Monitor', text, url: window.location.href });
  };

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-[#050608] z-[1000] flex flex-col items-center justify-center">
        <h1 className="font-rajdhani text-4xl font-bold tracking-[0.4em] text-white animate-pulse"><span className="text-[#e2b053]">H</span>OO</h1>
        <button onClick={() => setIsUnlocked(true)} className="mt-12 px-12 py-3 border border-[#e2b053]/20 font-black text-[10px] text-[#e2b053] uppercase tracking-[0.3em] rounded-full bg-[#e2b053]/5">Conectar Terminal</button>
      </div>
    );
  }

  const bcvNum = parseFloat(String(data?.precio_bcv || '0').replace(',', '.'));
  const usdtNum = parseFloat(String(data?.precio_usdt || '0').replace(',', '.'));

  return (
    <div className="h-screen w-full flex flex-col bg-[#050608] text-white overflow-hidden relative font-sans">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      
      {/* HEADER ESCALADO */}
      <div className="flex-none pt-6 px-6 pb-2">
        <header className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-[#e2b053]/30 flex items-center justify-center rounded-xl bg-[#e2b053]/5 shadow-[0_0_15px_rgba(226,176,83,0.1)]">
                    <svg width="22" height="22" viewBox="0 0 100 100"><polyline points="20,35 50,55 80,35" fill="none" stroke="#e2b053" strokeWidth="6" strokeLinecap="round" /><circle cx="35" cy="50" r="10" fill="white" /><circle cx="65" cy="50" r="10" fill="white" /><circle cx="35" cy="50" r="4" fill="#050608" /><circle cx="65" cy="50" r="4" fill="#050608" /><polygon points="50,60 44,68 50,76 56,68" fill="#e2b053" /></svg>
                </div>
                <div>
                  <h2 className="font-rajdhani text-xl font-bold tracking-widest leading-none"><span className="text-[#e2b053]">H</span>OO</h2>
                  <p className="text-[8px] text-[#e2b053] font-black uppercase tracking-[0.2em] opacity-80 mt-1">Monitor Beta</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className="w-9 h-9 border border-white/5 rounded-full flex items-center justify-center bg-white/5" style={{ color: isMuted ? '#ff4b4b' : '#e2b053' }}><Volume2 size={16} /></button>
                <button onClick={syncMonitor} className="w-9 h-9 border border-white/5 rounded-full flex items-center justify-center bg-white/5 text-[#e2b053]"><RefreshCw size={16} /></button>
            </div>
        </header>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-6 pb-32 pt-2">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div key="h" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
              
              {/* 1. TARJETA HÉROE: DIFERENCIAL + INDICADOR + TENDENCIA INTEGRADA */}
              <div className="w-full p-6 rounded-[2.5rem] bg-gradient-to-br from-[#e2b053]/15 to-[#e2b053]/5 border border-[#e2b053]/30 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 p-6 opacity-30">
                  <Gauge size={56} className="text-[#e2b053] animate-pulse" strokeWidth={1.5} />
                </div>
                
                <div className="flex flex-col z-10 relative">
                  <span className="text-[10px] font-black text-[#e2b053] uppercase tracking-[0.3em] mb-2 opacity-80 text-shadow-sm">Diferencial Actual</span>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <span className="font-rajdhani text-6xl font-extrabold tracking-tighter text-white drop-shadow-lg">{data?.brecha_porcentaje || '0.00%'}</span>
                  </div>

                  {/* Cuadrícula de 3 datos: Binance, Tendencia, Brecha Neta */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#e2b053]/20">
                    <div>
                      <span className="text-[8px] text-[#e2b053]/60 font-black uppercase block mb-1">Binance P2P</span>
                      <span className="font-rajdhani text-lg font-bold text-white">{data?.precio_usdt || '--,--'}</span>
                    </div>
                    <div className="border-x border-[#e2b053]/10 px-2">
                      <span className="text-[8px] text-[#e2b053]/60 font-black uppercase block mb-1">Tendencia</span>
                      <div className="flex items-center gap-1">
                        <span className="font-rajdhani text-lg font-bold" style={{ color: trendColor }}>{data?.variacion_mercado || '0.00%'}</span>
                        {data?.status === 'subiendo' ? <TrendingUp size={12} className="text-[#ff4b4b]" /> : <TrendingDown size={12} className="text-[#00d49a]" />}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-[#e2b053]/60 font-black uppercase block mb-1">Brecha Neta</span>
                      <span className="font-rajdhani text-lg font-bold text-white">Bs. {(usdtNum - bcvNum).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Reloj Circular de 60s (Sutil en el fondo) */}
                <div className="absolute -bottom-10 -right-10 opacity-5">
                   <svg width="180" height="180" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="45" fill="none" stroke="#e2b053" strokeWidth="2" strokeDasharray="2 4" />
                     <motion.circle cx="50" cy="50" r="45" fill="none" stroke="#e2b053" strokeWidth="2" strokeDasharray="283" strokeDashoffset={283 - (283 * (60 - count60) / 60)} strokeLinecap="round" transform="rotate(-90 50 50)" />
                   </svg>
                </div>
              </div>

              {/* 2. INDICADORES BCV (Scroll Horizontal Limpio) */}
              <div>
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Tasas Oficiales BCV</h3>
                  <div className="flex items-center gap-2 text-[8px] font-black text-[#e2b053]/70 bg-[#e2b053]/5 px-3 py-1 rounded-full border border-[#e2b053]/10">
                    <Clock size={10} /> {vzlaTime.time}
                  </div>
                </div>
                
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                  {/* Euro BCV */}
                  <div className="flex-none w-[160px] p-5 rounded-3xl border border-white/5 bg-[#111214] flex flex-col justify-between shadow-xl">
                    <div className="w-10 h-10 rounded-full bg-[#e2b053]/5 flex items-center justify-center mb-4">
                      <Landmark size={20} className="text-[#e2b053]" />
                    </div>
                    <div>
                      <span className="text-[8px] text-white/40 font-black uppercase block mb-1">Euro Oficial</span>
                      <span className="font-rajdhani text-xl font-bold text-white">€ {data?.precio_eur || '--,--'}</span>
                    </div>
                  </div>
                  {/* Dólar BCV */}
                  <div className="flex-none w-[160px] p-5 rounded-3xl border border-white/5 bg-[#111214] flex flex-col justify-between shadow-xl">
                    <div className="w-10 h-10 rounded-full bg-[#e2b053]/5 flex items-center justify-center mb-4">
                      <Landmark size={20} className="text-[#e2b053]" />
                    </div>
                    <div>
                      <span className="text-[8px] text-white/40 font-black uppercase block mb-1">Dólar Oficial</span>
                      <span className="font-rajdhani text-xl font-bold text-white">$ {data?.precio_bcv || '--,--'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
            </motion.div>
          ) : (
            <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
              {/* TASAS GLOBALES */}
              <div className="flex flex-col items-center mb-8 pt-4">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-[#e2b053] tracking-[0.3em] uppercase">Promedio Binance P2P</span>
                  <div className="text-[9px] font-black text-[#e2b053]/70 bg-[#e2b053]/5 px-3 py-1 rounded-full border border-[#e2b053]/10">
                    Sync en {Math.floor(count300/60)}:{String(count300%60).padStart(2,'0')}
                  </div>
                </div>
                <div className="h-0.5 w-12 bg-[#e2b053]/30 mt-3 rounded-full"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {globalRates.map((c, i) => (
                  <div key={i} className="border border-white/5 rounded-[1.5rem] p-4 flex items-center justify-between bg-[#111214] shadow-md">
                    <span className="text-[11px] font-black text-[#e2b053]">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-rajdhani text-lg font-bold">{c.price}</span>
                      <TrendingUp size={12} className="text-[#00d49a] opacity-30" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER ESCALADO */}
        <footer className="mt-auto pt-6">
            <div className="border border-[#e2b053]/10 bg-[#e2b053]/5 p-3 px-5 flex items-center justify-between rounded-[1.5rem]">
                <div className="flex items-center gap-3">
                  <Briefcase size={16} className="text-[#e2b053]" />
                  <div className="flex flex-col">
                    <span className="text-[7px] text-[#e2b053] font-black uppercase tracking-widest leading-none">Consultoría / Contrataciones</span>
                    <span className="font-rajdhani text-sm font-bold text-white mt-1">@JAIROKOV</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <a href="https://instagram.com/jairokov" target="_blank" rel="noreferrer"><Instagram size={18} className="text-white/30 hover:text-[#e2b053] transition-colors" /></a>
                  <a href="https://t.me/jairokov" target="_blank" rel="noreferrer"><Send size={18} className="text-white/30 hover:text-[#e2b053] transition-colors" /></a>
                  <a href="https://twitter.com/jairokov" target="_blank" rel="noreferrer"><Twitter size={18} className="text-white/30 hover:text-[#e2b053] transition-colors" /></a>
                </div>
            </div>
            <div className="text-center py-6">
               <p className="text-[8px] text-white/10 uppercase font-black tracking-[0.3em]">Jairokov Systems © 2026</p>
            </div>
        </footer>
      </div>

      {/* NAVEGACIÓN INFERIOR */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#050608]/98 backdrop-blur-2xl border-t border-white/5 px-10 py-5 flex justify-around items-center z-[500] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'home' ? 'text-[#e2b053] scale-110' : 'text-white/20'}`}><LayoutDashboard size={24} /><span className="text-[9px] font-black uppercase tracking-wider">Monitor</span></button>
        <button onClick={() => setActiveTab('currencies')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'currencies' ? 'text-[#e2b053] scale-110' : 'text-white/20'}`}><Coins size={24} /><span className="text-[9px] font-black uppercase tracking-wider">Tasas</span></button>
        <button onClick={handleShare} className="flex flex-col items-center gap-1.5 text-[#e2b053] hover:scale-125 active:scale-90 transition-all"><Share2 size={24} /><span className="text-[9px] font-black uppercase tracking-wider">Compartir</span></button>
      </nav>
    </div>
  );
}
