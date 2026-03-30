'use client';
import { useState, useEffect } from 'react';

interface Member { id: string; name: string; parentId: string | null; generation: number; location: string; }

export default function PetaSebaran() {
  const [tree, setTree] = useState<Member[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', location: '' });

  const load = () => fetch('/api/family-tree').then(r => r.json()).then(d => setTree(d.tree || []));
  useEffect(() => { load(); }, []);

  const addLocation = async () => {
    if (!form.name || !form.location) return;
    await fetch('/api/family-tree', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ name: '', location: '' });
    setShowAdd(false);
    load();
  };

  // Group by location dynamically
  const locationGroups = tree.reduce((acc, m) => {
    if (!m.location) return acc;
    const loc = m.location.trim();
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(m.name);
    return acc;
  }, {} as Record<string, string[]>);

  const colors = [
    'from-yellow-500 to-amber-400', 'from-blue-500 to-cyan-400', 'from-green-500 to-emerald-400', 
    'from-red-500 to-orange-400', 'from-purple-500 to-pink-400', 'from-indigo-500 to-blue-400', 'from-teal-500 to-cyan-400'
  ];

  const locations = Object.entries(locationGroups).map(([name, members], i) => ({
    name, members, color: colors[i % colors.length]
  }));

  return (
    <div className="animate-fadeIn space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-heading flex items-center gap-2"><i className="fas fa-map-marked-alt icon-gold" />Peta Sebaran Keluarga</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-emas text-sm !px-4 !py-2">
          <i className="fas fa-plus mr-1" />Tambah
        </button>
      </div>

      {showAdd && (
        <div className="glass-card p-5 animate-fadeIn space-y-3">
          <input className="input-keraton" placeholder="Nama anggota keluarga" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="input-keraton" placeholder="Kota / Lokasi saat ini" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <button onClick={addLocation} className="btn-emas w-full">Simpan Lokasi</button>
        </div>
      )}

      {/* Map Panel */}
      <div className="glass-card p-6">
        <div className="relative rounded-2xl p-6 min-h-[280px] overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at center, #0a1a2e 0%, #050d17 100%)', border: '1px solid rgba(212,175,55,0.15)' }}>
          {/* Decorative ocean lines */}
          <div className="absolute inset-0 opacity-10">
            {[30,60,90,120,150].map(y => (
              <div key={y} className="absolute left-0 right-0 h-px" style={{ top: `${y}px`, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)' }} />
            ))}
          </div>
          {/* Island hint */}
          <div className="absolute top-1/2 left-1/4 right-1/4 h-12 rounded-full blur-2xl" style={{ background: 'rgba(212,175,55,0.04)' }} />

          <div className="relative grid grid-cols-3 md:grid-cols-4 gap-5">
            {locations.map(loc => (
              <div key={loc.name} className="group flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform animate-pulse-glow cursor-default"
                  style={{ background: 'linear-gradient(135deg, #3d2800, #6b4300)', border: '2px solid rgba(212,175,55,0.5)', boxShadow: '0 0 20px rgba(212,175,55,0.2)' }}>
                  <span className="font-bold font-serif text-sm" style={{ color: '#D4AF37' }}>{loc.members.length}</span>
                </div>
                <div className="mt-2 text-center">
                  <div className="font-serif font-bold text-sm" style={{ color: '#D4AF37' }}>{loc.name}</div>
                  <div className="text-xs" style={{ color: 'rgba(212,175,55,0.45)' }}>{loc.members.length} anggota</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail per kota */}
      <div className="grid md:grid-cols-2 gap-4">
        {locations.map(loc => (
          <div key={loc.name} className="glass-card p-4 hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)' }}>
                <i className="fas fa-map-pin icon-gold" />
              </div>
              <div>
                <h3 className="font-serif font-bold" style={{ color: '#D4AF37' }}>{loc.name}</h3>
                <p className="text-xs" style={{ color: 'rgba(212,175,55,0.45)' }}>{loc.members.length} anggota keluarga</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-3" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
              {loc.members.map(name => (
                <div key={name} className="flex items-center gap-2 text-sm" style={{ color: '#c8b07a' }}>
                  <i className="fas fa-user text-xs" style={{ color: 'rgba(212,175,55,0.4)' }} />{name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
