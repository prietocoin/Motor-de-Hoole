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
  
  const [sec60, setSec60] = useState(0); 
  const [sec300, setSec300] = useState(0); 
  
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
      } catch (e) { console.error("Error Time", e); }
      
      setSec60(now.getSeconds());
      const fiveMinInMs = 300000;
      setSec300(((Date.now() % fiveMinInMs) / 1000));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // 3. SINCRONIZACIÓN (FIX PRECIO BINANCE)
  // ==========================================
  const sync = useCallback(async () => {
    setLoading(true);
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 150);

    try {
      // ?t= destruye la caché para leer el precio real de Binance
      const res1 = await fetch(`/precio-actual?t=${Date.now()}`);
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

      const res2 = await fetch(`/global-rates?t=${Date.now()}`); 
      const dbData = await res2.json(); 
      if (dbData && dbData.length > 0) {
        const row = dbData[0];
        const coins = ['pen', 'cop', 'clp', 'ars', 'mxn', 'ves', 'pyg', 'dop', 'crc', 'eur', 'cad', 'bob', 'brl'];
        const list = coins.map(c => ({
          name: c.toUpperCase(),
          price: (parseFloat(row[c]) >= 400) ? Math.round(parseFloat(row[c])).toString() : parseFloat(row[c]).toFixed(2)
        }));
        // El BCV se inyecta al final de la lista global
        if (d1?.precio_bcv) list.push({ name: "BCV", price: d1.precio_bcv });
        setGlobalRates(list);
      }
    } catch (e) { console.error("Sync Error", e); } 
    finally { setTimeout(() => setLoading(false), 800); }
  }, [lastId, isMuted, isUnlocked]);

  useEffect(() => {
    if (isUnlocked) {
      sync();
      const interval = setInterval(sync, 30000); // Sincroniza cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [isUnlocked, sync]);

  // ==========================================
  // 4. LÓGICA DE COMPARTIR
  // ==========================================
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
        <button onClick={() => setIsUnlocked(true)} className="mt-12 px-12 py-3 border border-[#e2b053]/20 font-black text-[10px] text-[#e2b053] uppercase tracking-[0.3em] rounded-full">Conectar Terminal</button>
      </div>
    );
  }

  const bcvNum = parseFloat(String(data?.precio_bcv || '0').replace(',', '.'));
  const usdtNum = parseFloat(String(data?.precio_usdt || '0').replace(',', '.'));
  const currentGap = bcvNum > 0 ? ((usdtNum - bcvNum) / bcvNum) * 100 : 0;
  const dashOffset = 440 - (440 * Math.min(currentGap, 35) / 35);

  return (
    <div className={`h-screen w-full flex flex-col bg-[#050608] text-white overflow-hidden relative font-sans transition-all duration-75 ${isGlitching ? 'opacity-40 brightness-150' : 'opacity-100'}`}>
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      <div className="marketing-banner"><div className="marketing-content">/// JAIROKOV SYSTEMS: SOLUCIONES DE IA A MEDIDA /// AUTOMATIZACIÓN ESTRATÉGICA DE PROCESOS /// GESTIÓN DE DATOS ///</div></div>

      <div className="flex-1 flex flex-col container mx-auto max-w-lg px-6 py-4 no-scrollbar overflow-y-auto pb-32">
        
        {/* HEADER CON INDICADOR LIVE Y DORADO CORPORATIVO */}
        <header className="flex justify-between items-start pt-2 mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-[#e2b053]/30 flex items-center justify-center rounded-xl bg-[#e2b053]/5">
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
                <button onClick={() => setIsMuted(!isMuted)} className="w-9 h-9 border border-white/5 rounded-full flex items-center justify-center bg-white/5" style={{ color: isMuted ? '#ff4b4b' : '#e2b053' }}><Volume2 className="w-4 h-4" /></button>
                <button onClick={sync} className={`w-9 h-9 border border-white/5 rounded-full flex items-center justify-center bg-white/5 text-[#e2b053] ${loading ? 'animate-spin' : ''}`}><RefreshCw className="w-4 h-4" /></button>
            </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div key="h" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col">
              
              {/* MONITOR CON RELOJ 60s Y CÍRCULO DENTADO CORPORATIVO */}
              <div className="gauge-container relative flex items-center justify-center my-4 py-4">
                  {/* Reloj exterior 60 segundos */}
                  <svg width="250" height="250" viewBox="0 0 250 250" className="absolute">
                    <circle cx="125" cy="125" r="115" fill="none" stroke="#e2b053" strokeWidth="2" strokeDasharray="5 10" strokeOpacity="0.1" />
                    <circle 
                      cx="125" cy="125" r="115" fill="none" stroke="#e2b053" strokeWidth="2" 
                      strokeDasharray="722" strokeDashoffset={722 - (722 * (sec60 || 0) / 60)}
                      strokeLinecap="round" className="transition-all duration-1000 ease-linear" transform='rotate(-90 125 125)'
                    />
                  </svg>
                  
                  {/* Círculo Dentado Corporativo */}
                  <svg width="215" height="215" viewBox="0 0 215 215" className="absolute">
                    <circle cx="107.5" cy="107.5" r="95" fill="none" stroke="#e2b053" strokeWidth="10" strokeDasharray="2 3" strokeOpacity="0.7" />
                  </svg>

                  <svg width="220" height="220" viewBox="0 0 230 230" className="absolute rotate-[-90deg]"><circle cx="115" cy="115" r="102" fill="none" stroke="#1a1c1e" strokeWidth="14" /><circle cx="115" cy="115" r="102" fill="none" stroke={trendColor} strokeWidth="14" strokeLinecap="round" className={`transition-all duration-500 ${isPulsing ? 'animate-pulse' : 'opacity-90'}`} /></svg>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
                    <span className="text-[8px] text-[#e2b053] font-black tracking-[2px] mb-1 uppercase">Diferencial</span>
                    <span className="font-rajdhani text-5xl font-extrabold tracking-tighter leading-none">{data?.brecha_porcentaje || '0.00%'}</span>
                    <div className="mt-3 flex flex-col items-center pt-2 border-t border-white/20 w-28">
                      <span className="text-sm font-black text-white">Bs. {(usdtNum - bcvNum).toFixed(2)}</span>
                      <span className="text-[7px] text-white/80 font-black tracking-[2px] mt-0.5 uppercase">Brecha Neta</span>
                    </div>
                  </div>
              </div>

              {/* BANNER DE FECHA COMPLETO */}
              <div className="my-4">
                <div className="border border-[#e2b053]/20 rounded-xl px-4 py-2 flex justify-between items-center bg-[#e2b053]/5">
                  <div className="flex items-center gap-2 text-[8px] font-black text-white uppercase"><CalendarDays className="w-3 h-3 text-[#e2b053]" /> {vzlaTime.dayName}</div>
                  <div className="text-[8px] font-black text-white">{vzlaTime.date}</div>
                  <div className="flex items-center gap-2 text-[8px] font-black text-white"><Clock className="w-3 h-3 text-[#e2b053]" /> {vzlaTime.time}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="border border-white/5 rounded-2xl p-4 bg-[#111214]">
                  <span className="text-[9px] text-[#e2b053] uppercase font-black mb-1">Binance P2P</span>
                  <h3 className="font-rajdhani text-3xl font-bold">{data?.precio_usdt || '--,--'}</h3>
                </div>
                
                {/* TENDENCIA ALINEADA IZQUIERDA CON FLECHAS DINÁMICAS */}
                <div className="border border-white/5 rounded-2xl p-4 bg-[#111214] flex flex-col justify-between">
                  <span className="text-[9px] text-[#e2b053] uppercase font-black">Tendencia</span>
                  <div className="flex items-center gap-3">
                    <span className="font-rajdhani text-2xl font-black" style={{ color: trendColor }}>{data?.variacion_mercado || '0.00%'}</span>
                    {data?.status === 'subiendo' ? <TrendingUp className="w-6 h-6 text-[#ff4b4b]" /> : <TrendingDown className="w-6 h-6 text-[#00d49a]" />}
                  </div>
                </div>
              </div>

              {/* TARJETAS EURO Y DÓLAR BCV */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="border border-white/5 rounded-2xl p-3 flex justify-between items-center bg-[#111214]">
                  <div><span className="text-[8px] text-[#e2b053] uppercase font-black">Euro BCV</span><span className="block font-rajdhani text-lg font-bold">€ {data?.precio_eur || '--,--'}</span></div>
                  <Landmark className="w-4 h-4 text-[#e2b053]/40" />
                </div>
                <div className="border border-white/5 rounded-2xl p-3 flex justify-between items-center bg-[#111214]">
                  <div><span className="text-[8px] text-[#e2b053] uppercase font-black">Dólar BCV</span><span className="block font-rajdhani text-lg font-bold">$ {data?.precio_bcv || '--,--'}</span></div>
                  <Landmark className="w-4 h-4 text-[#e2b053]/40" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="c" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col">
              {/* PESTAÑA TASAS CON RELOJ 300s */}
              <div className="flex flex-col items-center mb-6 relative">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-[#e2b053] tracking-[0.3em] uppercase">Promedio Binance P2P</span>
                  <div className="relative w-6 h-6">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.1" />
                      <circle 
                        cx="12" cy="12" r="10" fill="none" stroke="#e2b053" strokeWidth="2" 
                        strokeDasharray="63" strokeDashoffset={63 - (63 * (sec300 || 0) / 300)}
                        strokeLinecap="round" transform="rotate(-90 12 12)"
                      />
                    </svg>
                  </div>
                </div>
                <div className="h-[1px] w-20 bg-[#e2b053]/30 mt-2"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {globalRates.map((c, i) => (
                  <div key={i} className="border border-white/5 rounded-xl p-3 flex items-center justify-between bg-[#111214]">
                    <span className="text-[11px] font-black text-[#e2b053]">{c.name}</span>
                    <div className="flex items-center gap-2"><span className="font-rajdhani text-xl font-bold tracking-tighter">{c.price}</span><TrendingUp className="w-2.5 h-2.5 text-[#00d49a] opacity-30" /></div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER COMPLETO CON CONTRATACIONES Y REDES SOCIALES */}
        <footer className="mt-auto pt-8">
            <div className="border border-[#e2b053]/10 bg-[#e2b053]/5 p-3 px-5 flex items-center justify-between rounded-2xl">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-3.5 h-3.5 text-[#e2b053]" />
                  <div className="flex flex-col">
                    <span className="text-[7px] text-[#e2b053] uppercase font-black tracking-widest leading-none">Consultoría / Contrataciones</span>
                    <span className="font-rajdhani text-xs font-bold tracking-[1px] text-white">@JAIROKOV</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <a href="https://instagram.com/jairokov" target="_blank" rel="noreferrer"><Instagram className="w-4 h-4 text-white/40 hover:text-[#e2b053] transition-colors" /></a>
                  <a href="https://t.me/jairokov" target="_blank" rel="noreferrer"><Send className="w-4 h-4 text-white/40 hover:text-[#e2b053] transition-colors" /></a>
                  <a href="https://twitter.com/jairokov" target="_blank" rel="noreferrer"><Twitter className="w-4 h-4 text-white/40 hover:text-[#e2b053] transition-colors" /></a>
                </div>
            </div>
            <div className="text-center py-5 text-[8px] text-white/10 uppercase tracking-[0.4em] font-black">
              Propiedad de Jairokov Systems © 2026
            </div>
        </footer>
      </div>

      <nav className="fixed bottom-0 left-0 w-full bg-[#050608]/98 backdrop-blur-xl border-t border-white/5 px-8 py-5 flex justify-around items-center z-[500]">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#e2b053]' : 'text-white/30'}`}><LayoutDashboard className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Monitor</span></button>
        <button onClick={() => setActiveTab('currencies')} className={`flex flex-col items-center gap-1 ${activeTab === 'currencies' ? 'text-[#e2b053]' : 'text-white/30'}`}><Coins className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Tasas</span></button>
        <button onClick={handleShare} className="flex flex-col items-center gap-1 text-[#e2b053]"><Share2 className="w-6 h-6" /><span className="text-[8px] font-black uppercase">Compartir</span></button>
      </nav>
    </div>
  );
}
