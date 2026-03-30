'use client';
import { useState, useEffect, useRef } from 'react';

interface Msg { id: string; sender: string; text: string; timestamp: number; }

export default function RuangTengah({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = () => fetch('/api/chat').then(r => r.json()).then(d => setMessages(d.messages || []));
  useEffect(() => { load(); const i = setInterval(load, 5000); return () => clearInterval(i); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    setText('');
    await load();
    setSending(false);
  };

  return (
    <div className="animate-fadeIn flex flex-col h-[calc(100vh-220px)] md:h-[calc(100vh-180px)]">
      <h2 className="section-heading mb-3 flex items-center gap-2">
        <i className="fas fa-comments icon-gold" />Ruang Tengah
      </h2>
      <div className="glass-card flex-1 overflow-y-auto custom-scroll p-4 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === userName ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${m.sender === userName
              ? 'rounded-tr-sm text-black font-medium'
              : 'rounded-tl-sm text-[#e8d5a3]'
            }`} style={m.sender === userName
              ? { background: 'linear-gradient(135deg, #b8860b, #D4AF37)', boxShadow: '0 2px 12px rgba(212,175,55,0.25)' }
              : { background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }
            }>
              {m.sender !== userName && <div className="text-xs font-bold mb-1 font-serif" style={{ color: '#D4AF37' }}>{m.sender}</div>}
              <p className="text-sm">{m.text}</p>
              <div className={`text-xs mt-1 opacity-60`}>
                {new Date(m.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 mt-3">
        <input className="input-keraton flex-1" placeholder="Ketik pesan..." value={text}
          onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
        <button onClick={send} disabled={sending} className="btn-emas !px-5">
          <i className={`fas ${sending ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`} />
        </button>
      </div>
    </div>
  );
}
