'use client';
import { useState, useEffect } from 'react';
import { resizeImage } from '@/lib/image';

interface Capsule { id: string; author: string; message: string; openDate: number; timestamp: number; canOpen: boolean; imageUrl?: string; }

export default function KapsulWaktu() {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ message: '', openDate: '', imageUrl: '' });

  const load = () => fetch('/api/capsule').then(r => r.json()).then(d => setCapsules(d.capsules || []));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.message || !form.openDate) return;
    await fetch('/api/capsule', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ message: '', openDate: '', imageUrl: '' });
    setShowAdd(false);
    load();
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      resizeImage(file, (base64) => setForm({ ...form, imageUrl: base64 }));
    }
  };

  return (
    <div className="animate-fadeIn space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-heading flex items-center gap-2"><i className="fas fa-hourglass-half icon-gold" />Kapsul Waktu</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-emas text-sm !px-4 !py-2">
          <i className="fas fa-plus mr-1" />Buat Kapsul
        </button>
      </div>

      {showAdd && (
        <div className="glass-card p-5 animate-fadeIn space-y-3">
          <textarea className="input-keraton min-h-[100px] resize-none" placeholder="Tulis pesan untuk masa depan..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
          <div className="rounded-xl p-4 text-center cursor-pointer transition"
            style={{ border: '2px dashed rgba(212,175,55,0.25)', background: 'rgba(212,175,55,0.03)' }}>
            <input type="file" accept="image/*" className="hidden" id="capsule-upload" onChange={handleImage} />
            <label htmlFor="capsule-upload" className="cursor-pointer font-medium flex flex-col items-center" style={{ color: 'rgba(212,175,55,0.6)' }}>
              <i className="fas fa-camera text-3xl mb-2 icon-gold"></i>
              {form.imageUrl ? 'Foto kenangan terpilih ✦' : 'Sisipkan Foto Kenangan (Opsional)'}
            </label>
          </div>
          {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-xl" style={{ border: '1px solid rgba(212,175,55,0.3)' }} />}
          <div>
            <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wider" style={{ color: 'rgba(212,175,55,0.6)' }}>Dibuka pada tanggal:</label>
            <input type="date" className="input-keraton" value={form.openDate} onChange={e => setForm({ ...form, openDate: e.target.value })}
              style={{ colorScheme: 'dark' }} />
          </div>
          <button onClick={submit} className="btn-emas w-full">
            <i className="fas fa-lock mr-2" />Kunci Kapsul
          </button>
        </div>
      )}

      <div className="space-y-4">
        {capsules.map(c => (
          <div key={c.id} className="glass-card p-5 relative overflow-hidden"
            style={{ borderLeft: c.canOpen ? '4px solid rgba(74,222,128,0.6)' : '4px solid rgba(212,175,55,0.3)' }}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: c.canOpen ? 'linear-gradient(90deg, transparent, rgba(74,222,128,0.3), transparent)' : 'linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)' }} />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: c.canOpen ? 'rgba(74,222,128,0.08)' : 'rgba(212,175,55,0.06)', border: `1px solid ${c.canOpen ? 'rgba(74,222,128,0.3)' : 'rgba(212,175,55,0.2)'}` }}>
                <i className={`fas ${c.canOpen ? 'fa-envelope-open-text text-green-400' : 'fa-lock'} text-xl`}
                  style={!c.canOpen ? { color: 'rgba(212,175,55,0.5)' } : {}} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-serif"
                    style={c.canOpen
                      ? { background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }
                      : { background: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }
                    }>
                    {c.canOpen ? 'TERBUKA' : 'TERKUNCI'}
                  </span>
                </div>
                <p className="leading-relaxed text-sm" style={{ color: c.canOpen ? '#c8b07a' : 'rgba(212,175,55,0.3)', fontStyle: c.canOpen ? 'normal' : 'italic' }}>
                  {c.message}
                </p>
                {c.canOpen && c.imageUrl && (
                  <div className="my-3 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
                    <img src={c.imageUrl} alt="Kenangan Kapsul Waktu" className="w-full h-auto object-contain max-h-64" />
                  </div>
                )}
                <div className="flex justify-between mt-3 text-xs pt-3" style={{ borderTop: '1px solid rgba(212,175,55,0.1)', color: 'rgba(212,175,55,0.45)' }}>
                  <span><i className="fas fa-feather-alt mr-1" />{c.author}</span>
                  <span><i className="fas fa-calendar-alt mr-1" />Dibuka: {new Date(c.openDate).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
