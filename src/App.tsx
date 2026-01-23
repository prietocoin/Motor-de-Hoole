import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, RefreshCw, Instagram, Send, Twitter, Landmark, 
  Clock, Briefcase, Share2, CalendarDays, 
  LayoutDashboard, Coins, TrendingUp, TrendingDown, Wallet
} from 'lucide-react';

export default function App() {
  // ==========================================
  // 1. ESTADOS (SIN CAMBIOS)
  // ==========================================
  const [data, setData] = useState<any>(null);
  const [globalRates, setGlobalRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [trendColor, setTrendColor] = useState('#64748b'); 
  const [vzlaTime, setVzlaTime] = useState({ dayName: '', date: '', time: '' });
  
  // Contadores
  const [count60, setCount60] = useState(60); // Monitor
  const [count300, setCount300] = useState(300); // Tasas
  
  const [activeTab, setActiveTab] = useState('home'); 
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ==========================================
  // 2. LÓGICA DE TIEMPO (SIN CAMBIOS)
  // ==========================================
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const options: any = { timeZone: 'America/Caracas' };
      try {
        setVzlaTime({
          dayName: new Intl.DateTimeFormat('es-VE', { ...options, weekday: 'long' }).format(now),
          date: new Intl.DateTimeFormat('es-VE', { ...options, day: '2-digit', month: '2-digit' }).format(now),
          time: new Intl.DateTimeFormat('es-VE', { ...options, hour: '2-digit', minute: '2-digit', hour12: true }).format(now)
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
  // 3. SINCRONIZACIÓN (SIN CAMBIOS)
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
      ? `📊 *HOO MONITOR*\nDiferencial: ${data?.brecha_porcentaje}\nBinance: ${data?.precio_usdt}\nBCV: ${data?.precio_bcv}`
      : `🌍 *TASAS P2P*\n\n${globalRates.map(c => `🔹 *${c.name}:* ${c.price}`).join('\n')}`;
    if (navigator.share) await navigator.share({ title: 'HOO Monitor', text, url: window.location.href });
  };

  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 bg-[#050608] z-[1000] flex flex-col items-center justify-center">
        <h1 className="font-rajdhani text-3xl font-bold tracking-[0.4em] text-white"><span className="text-[#e2b053]">H</span>OO</h1>
        <button onClick={() => setIsUnlocked(true)} className="mt-12 px-12 py-3 border border-[#e2b053]/20 font-black text-[10px] text-[#e2b053] uppercase tracking-[0.3em] rounded-full">Iniciando Sistema...</button>
      </div>
    );
  }

  const bcvNum = parseFloat(String(data?.precio_bcv || '0').replace(',', '.'));
  const usdtNum = parseFloat(String(data?.precio_usdt || '0').replace(',', '.'));

  return (
    <div className="h-screen w-full flex flex-col bg-[#050608] text-white overflow-hidden relative font-sans">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      
      {/* HEADER */}
      <div className="flex-none pt-6 px-6 pb-4">
        <header className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-[#e2b053]/30 flex items-center justify-center rounded-xl bg-[#e2b053]/5">
                    <svg width="20" height="20" viewBox="0 0 100 100"><polyline points="20,35 50,55 80,35" fill="none" stroke="#e2b053" strokeWidth="6" strokeLinecap="round" /><circle cx="35" cy="50" r="10" fill="white" /><circle cx="65" cy="50" r="10" fill="white" /><circle cx="35" cy="50" r="4" fill="#050608" /><circle cx="65" cy="50" r="4" fill="#050608" /><polygon points="50,60 44,68 50,76 56,68" fill="#e2b053" /></svg>
                </div>
                <div>
                  <h2 className="font-rajdhani text-xl font-bold tracking-widest leading-none"><span className="text-[#e2b053]">H</span>OO</h2>
                  <p className="text-[8px] text-[#e2b053] font-black uppercase tracking-widest opacity-80 mt-0.5">Monitor Beta</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className="w-9 h-9 border border-white/5 rounded-full flex items-center justify-center bg-white/5" style={{ color: isMuted ? '#ff4b4b' : '#e2b053' }}><Volume2 size={16} /></button>
                <button onClick={syncMonitor} className="w-9 h-9 border border-white/5 rounded-full flex items-center justify-center bg-white/5 text-[#e2b053]"><RefreshCw size={16} /></button>
            </div>
        </header>
      </div>

      {/* CONTENIDO PRINCIPAL CON SCROLL */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-6 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div key="h" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
              
              {/* 1. TARJETA HÉROE PRINCIPAL (Estilo "Total Balance") */}
              <div className="w-full p-6 rounded-[2rem] bg-gradient-to-br from-[#e2b053]/20 to-[#e2b053]/5 border border-[#e2b053]/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet size={48} className="text-[#e2b053]" /></div>
                <div className="flex flex-col z-10 relative">
                  <span className="text-[10px] font-black text-[#e2b053] uppercase tracking-widest mb-1">Diferencial Actual</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-rajdhani text-6xl font-extrabold tracking-tighter text-white leading-none">{data?.brecha_porcentaje || '0.00%'}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-[#e2b053]/70 font-black uppercase block mb-0.5">Binance P2P</span>
                      <span className="font-rajdhani text-2xl font-bold text-white">{data?.precio_usdt || '--,--'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-[#e2b053]/70 font-black uppercase block mb-0.5">Brecha Neta</span>
                      <span className="font-rajdhani text-xl font-bold text-white">Bs. {(usdtNum - bcvNum).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {/* Barra de progreso del minuto */}
                <div className="absolute bottom-0 left-0 h-1 bg-[#e2b053]/30" style={{ width: `${(count60 / 60) * 100}%`, transition: 'width 1s linear' }}></div>
              </div>

              {/* 2. SECCIÓN DE TARJETAS HORIZONTALES (Estilo "Saving Plans") */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[11px] font-black text-white uppercase tracking-wider">Indicadores Clave</h3>
                  <div className="flex items-center gap-2 text-[9px] font-black text-[#e2b053]/70 uppercase bg-[#e2b053]/5 px-2 py-1 rounded-full">
                    <Clock size={10} /> {vzlaTime.time}
                  </div>
                </div>
                {/* Contenedor con scroll horizontal */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2" style={{ maskImage: 'linear-gradient(to right, black 85%, transparent 100%)' }}>
                  {/* Tarjeta Tendencia */}
                  <div className="flex-none w-32 p-4 rounded-2xl border border-white/5 bg-[#111214] flex flex-col justify-between">
                    <TrendingUp size={20} className="text-[#e2b053] mb-3 opacity-50" />
                    <div>
                      <span className="text-[9px] text-white/60 font-black uppercase block mb-0.5">Tendencia</span>
                      <div className="flex items-center gap-1">
                        <span className="font-rajdhani text-lg font-bold" style={{ color: trendColor }}>{data?.variacion_mercado || '0.00%'}</span>
                        {data?.status === 'subiendo' ? <TrendingUp size={14} className="text-[#ff4b4b]" /> : <TrendingDown size={14} className="text-[#00d49a]" />}
                      </div>
                    </div>
                  </div>
                  {/* Tarjeta Euro BCV */}
                  <div className="flex-none w-32 p-4 rounded-2xl border border-white/5 bg-[#111214] flex flex-col justify-between">
                    <Landmark size={20} className="text-[#e2b053] mb-3 opacity-50" />
                    <div>
                      <span className="text-[9px] text-white/60 font-black uppercase block mb-0.5">Euro BCV</span>
                      <span className="font-rajdhani text-lg font-bold text-white">€ {data?.precio_eur || '--,--'}</span>
                    </div>
                  </div>
                  {/* Tarjeta Dólar BCV */}
                  <div className="flex-none w-32 p-4 rounded-2xl border border-white/5 bg-[#111214] flex flex-col justify-between">
                    <Landmark size={20} className="text-[#e2b053] mb-3 opacity-50" />
                    <div>
                      <span className="text-[9px] text-white/60 font-black uppercase block mb-0.5">Dólar BCV</span>
                      <span className="font-rajdhani text-lg font-bold text-white">$ {data?.precio_bcv || '--,--'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
            </motion.div>
          ) : (
            <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
              {/* PESTAÑA TASAS GLOBALES */}
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-[#e2b053] tracking-[0.2em] uppercase">Promedio Binance P2P</span>
                  <div className="text-[9px] font-black text-[#e2b053]/70 bg-[#e2b053]/5 px-2 py-1 rounded-full">
                    Actualiza en {Math.floor(count300/60)}:{String(count300%60).padStart(2,'0')}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {globalRates.map((c, i) => (
                  <div key={i} className="border border-white/5 rounded-xl p-3.5 flex items-center justify-between bg-[#111214]">
                    <span className="text-[11px] font-black text-[#e2b053]">{c.name}</span>
                    <div className="flex items-center gap-2"><span className="font-rajdhani text-lg font-bold">{c.price}</span><TrendingUp size={12} className="text-[#00d49a] opacity-30" /></div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER */}
        <footer className="mt-auto pt-4">
            <div className="border border-[#e2b053]/10 bg-[#e2b053]/5 p-3 px-5 flex items-center justify-between rounded-2xl">
                <div className="flex items-center gap-3">
                  <Briefcase size={14} className="text-[#e2b053]" />
                  <div className="flex flex-col">
                    <span className="text-[7px] text-[#e2b053] font-black uppercase leading-none tracking-tight">Consultoría / Contrataciones</span>
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

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#050608]/98 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex justify-around items-center z-[500]">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#e2b053]' : 'text-white/20'}`}><LayoutDashboard size={20} /><span className="text-[8px] font-black uppercase">Monitor</span></button>
        <button onClick={() => setActiveTab('currencies')} className={`flex flex-col items-center gap-1 ${activeTab === 'currencies' ? 'text-[#e2b053]' : 'text-white/20'}`}><Coins size={20} /><span className="text-[8px] font-black uppercase">Tasas</span></button>
        <button onClick={handleShare} className="flex flex-col items-center gap-1 text-[#e2b053] hover:scale-110 active:scale-95 transition-all"><Share2 size={20} /><span className="text-[8px] font-black uppercase">Compartir</span></button>
      </nav>
    </div>
  );
}
