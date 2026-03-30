'use client';
import { useState, useEffect } from 'react';

interface Prayer { id: string; author: string; text: string; timestamp: number; }

export default function PapanDoa() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => fetch('/api/prayers').then(r => r.json()).then(d => setPrayers(d.prayers || []));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await fetch('/api/prayers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    setText('');
    await load();
    setSending(false);
  };

  return (
    <div className="animate-fadeIn space-y-4">
      <h2 className="section-heading flex items-center gap-2">
        <i className="fas fa-praying-hands icon-gold" />Papan Doa
      </h2>
      <div className="glass-card p-5">
        <p className="text-yellow-700/50 text-xs mb-3 font-serif italic">Tulis doa tulus dari hatimu untuk keluarga tercinta...</p>
        <textarea className="input-keraton min-h-[100px] resize-none" placeholder="Ya Allah, berikanlah kesehatan dan kebahagiaan bagi seluruh keluarga..." value={text} onChange={e => setText(e.target.value)} />
        <button onClick={submit} disabled={sending} className="btn-emas w-full mt-3">
          <i className={`fas ${sending ? 'fa-spinner fa-spin' : 'fa-dove'} mr-2`} />{sending ? 'Mengirim...' : 'Kirim Doa'}
        </button>
      </div>
      <div className="space-y-3">
        {prayers.slice().reverse().map(p => (
          <div key={p.id} className="glass-card p-4 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <i className="fas fa-praying-hands text-sm" style={{ color: '#D4AF37' }}></i>
              </div>
              <div className="flex-1">
                <p className="text-[#c8b07a] italic leading-relaxed text-sm">&ldquo;{p.text}&rdquo;</p>
                <div className="flex justify-between mt-2 text-xs" style={{ borderTop: '1px solid rgba(212,175,55,0.1)', paddingTop: '0.5rem' }}>
                  <span className="font-semibold font-serif" style={{ color: '#D4AF37' }}>{p.author}</span>
                  <span className="text-yellow-700/40">{new Date(p.timestamp).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
