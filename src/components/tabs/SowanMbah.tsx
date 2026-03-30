'use client';
import { useState, useRef, useEffect } from 'react';

interface AiMsg { role: 'user' | 'ai'; text: string; }

export default function SowanMbah({ aiEnabled }: { aiEnabled: boolean }) {
  const [messages, setMessages] = useState<AiMsg[]>([
    { role: 'ai', text: 'Eh, Cucuku... Sini, duduk. Mbah senang sekali kamu mau sowan. Ada apa, Nak? Ceritakan saja apa yang ada di hatimu. 🙏' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (!aiEnabled) {
    return (
      <div className="animate-fadeIn glass-card p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <i className="fas fa-ban text-2xl text-red-500/70"></i>
        </div>
        <h2 className="text-xl font-serif font-bold text-[#D4AF37] mb-2">Sowan Mbah Tidak Tersedia</h2>
        <p className="text-yellow-700/50 text-sm">Fitur ini sedang dinonaktifkan oleh Sang Arsitek.</p>
      </div>
    );
  }

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages(prev => [...prev, { role: 'ai', text: `⚠️ ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Gagal menghubungi Mbah. Coba lagi nanti.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fadeIn flex flex-col h-[calc(100vh-220px)] md:h-[calc(100vh-180px)]">
      <h2 className="section-heading mb-3 flex items-center gap-2">
        <i className="fas fa-hat-wizard icon-gold" />Sowan Mbah Marto
      </h2>
      <div className="glass-card flex-1 overflow-y-auto custom-scroll p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'ai' && (
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mr-2 self-end"
                style={{ background: 'linear-gradient(135deg, #3d2800, #6b4300)', border: '1px solid rgba(212,175,55,0.3)' }}>
                <i className="fas fa-hat-wizard text-xs" style={{ color: '#D4AF37' }}></i>
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${m.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
              style={m.role === 'user'
                ? { background: 'linear-gradient(135deg, #b8860b, #D4AF37)', color: '#0a0800', boxShadow: '0 2px 12px rgba(212,175,55,0.25)' }
                : { background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)', color: '#c8b07a' }
              }>
              {m.role === 'ai' && <div className="text-xs font-bold font-serif mb-1" style={{ color: '#D4AF37' }}>Mbah Marto</div>}
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full flex-shrink-0 mr-2 self-end flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3d2800, #6b4300)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <i className="fas fa-hat-wizard text-xs" style={{ color: '#D4AF37' }}></i>
            </div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <div className="text-xs font-serif font-bold mb-1" style={{ color: '#D4AF37' }}>Mbah Marto</div>
              <div className="flex gap-1.5 items-center">
                {[0, 150, 300].map(d => (
                  <div key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#D4AF37', animationDelay: `${d}ms`, opacity: 0.6 }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 mt-3">
        <input className="input-keraton flex-1" placeholder="Sowan ke Mbah..." value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
        <button onClick={send} disabled={loading} className="btn-emas !px-5">
          <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`} />
        </button>
      </div>
    </div>
  );
}
