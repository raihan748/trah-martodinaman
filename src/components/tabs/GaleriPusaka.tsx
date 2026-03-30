'use client';
import { useState, useEffect } from 'react';
import { resizeImage } from '@/lib/image';

interface GalleryItem { id: string; title: string; description: string; imageUrl: string; uploader: string; timestamp: number; }

export default function GaleriPusaka() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '' });
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  const load = () => fetch('/api/gallery').then(r => r.json()).then(d => setItems(d.gallery || []));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title) return;
    await fetch('/api/gallery', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ title: '', description: '', imageUrl: '' });
    setShowAdd(false);
    load();
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      resizeImage(file, (base64) => setForm({ ...form, imageUrl: base64 }));
    }
  };

  const goldGrads = [
    'from-[#3d2800] to-[#6b4200]','from-[#1a2800] to-[#2a4000]','from-[#1a0000] to-[#3d1a00]',
    'from-[#001a1a] to-[#003333]','from-[#0d0020] to-[#1a004d]','from-[#200020] to-[#400040]'
  ];

  return (
    <div className="animate-fadeIn space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-heading flex items-center gap-2"><i className="fas fa-images icon-gold" />Galeri Pusaka</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-emas text-sm !px-4 !py-2"><i className="fas fa-plus mr-1" />Tambah</button>
      </div>
      {showAdd && (
        <div className="glass-card p-5 animate-fadeIn space-y-3">
          <input className="input-keraton" placeholder="Judul foto/kenangan" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea className="input-keraton min-h-[60px] resize-none" placeholder="Deskripsi" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="rounded-xl p-4 text-center cursor-pointer transition"
            style={{ border: '2px dashed rgba(212,175,55,0.25)', background: 'rgba(212,175,55,0.03)' }}>
            <input type="file" accept="image/*" className="hidden" id="gallery-upload" onChange={handleImage} />
            <label htmlFor="gallery-upload" className="cursor-pointer font-medium flex flex-col items-center" style={{ color: 'rgba(212,175,55,0.6)' }}>
              <i className="fas fa-cloud-upload-alt text-3xl mb-2 icon-gold"></i>
              {form.imageUrl ? 'Gambar terpilih ✦' : 'Pilih Foto / Gambar'}
            </label>
          </div>
          {form.imageUrl && <img src={form.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-xl" style={{ border: '1px solid rgba(212,175,55,0.3)' }} />}
          <button onClick={submit} className="btn-emas w-full">Simpan ke Galeri</button>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <div key={item.id} className="group cursor-pointer" onClick={() => setSelected(item)}>
            <div className={`aspect-square rounded-2xl bg-gradient-to-br ${goldGrads[i % goldGrads.length]} flex items-center justify-center group-hover:scale-105 transition-all overflow-hidden relative`}
              style={{ border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.1)' }}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <i className="fas fa-camera text-3xl group-hover:scale-110 transition-transform" style={{ color: 'rgba(212,175,55,0.4)' }} />
              )}
              {/* Gold corner accent */}
              <div className="absolute top-1.5 left-1.5 w-3 h-3 border-l border-t" style={{ borderColor: 'rgba(212,175,55,0.5)' }} />
              <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-r border-b" style={{ borderColor: 'rgba(212,175,55,0.5)' }} />
            </div>
            <h4 className="mt-2 font-serif font-semibold text-sm truncate" style={{ color: '#D4AF37' }}>{item.title}</h4>
            <p className="text-xs" style={{ color: 'rgba(212,175,55,0.45)' }}>{item.uploader}</p>
          </div>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={() => setSelected(null)}>
          <div className="glass-card-royal p-6 max-w-md w-full animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="aspect-video rounded-xl overflow-hidden mb-4 relative" style={{ border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.05)' }}>
              {selected.imageUrl ? (
                <img src={selected.imageUrl} alt={selected.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="fas fa-image text-5xl" style={{ color: 'rgba(212,175,55,0.3)' }} />
                </div>
              )}
            </div>
            <h3 className="text-xl font-serif font-bold" style={{ color: '#D4AF37' }}>{selected.title}</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: '#c8b07a' }}>{selected.description}</p>
            <div className="flex justify-between mt-3 text-xs pt-3" style={{ borderTop: '1px solid rgba(212,175,55,0.15)', color: 'rgba(212,175,55,0.5)' }}>
              <span><i className="fas fa-camera mr-1" />{selected.uploader}</span>
              <span>{new Date(selected.timestamp).toLocaleDateString('id-ID')}</span>
            </div>
            <button onClick={() => setSelected(null)} className="btn-emas w-full mt-4">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
