'use client';
import { useState, useEffect } from 'react';

interface Recipe { id: string; title: string; author: string; ingredients: string; steps: string; timestamp: number; }

export default function KitabResep() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', ingredients: '', steps: '' });
  const [sending, setSending] = useState(false);

  const load = () => fetch('/api/recipes').then(r => r.json()).then(d => setRecipes(d.recipes || []));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title || !form.ingredients || !form.steps || sending) return;
    setSending(true);
    await fetch('/api/recipes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ title: '', ingredients: '', steps: '' });
    setShowAdd(false);
    await load();
    setSending(false);
  };

  return (
    <div className="animate-fadeIn space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-heading flex items-center gap-2"><i className="fas fa-utensils icon-gold" />Kitab Resep</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-emas text-sm !px-4 !py-2">
          <i className="fas fa-plus mr-1" />Tambah Resep
        </button>
      </div>

      {showAdd && (
        <div className="glass-card p-5 animate-fadeIn space-y-3">
          <input className="input-keraton" placeholder="Nama masakan" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea className="input-keraton min-h-[80px] resize-none" placeholder="Bahan-bahan (pisahkan dengan koma)" value={form.ingredients} onChange={e => setForm({ ...form, ingredients: e.target.value })} />
          <textarea className="input-keraton min-h-[100px] resize-none" placeholder="Langkah-langkah memasak" value={form.steps} onChange={e => setForm({ ...form, steps: e.target.value })} />
          <button onClick={submit} disabled={sending} className="btn-emas w-full">{sending ? 'Menyimpan...' : 'Simpan Resep'}</button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {recipes.map(r => (
          <div key={r.id} className="glass-card p-5 transition-all cursor-pointer hover:scale-[1.02]"
            style={{ borderLeft: expanded === r.id ? '4px solid #D4AF37' : '4px solid rgba(212,175,55,0.2)' }}
            onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <i className="fas fa-utensils" style={{ color: '#D4AF37' }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-bold text-[#D4AF37] truncate">{r.title}</h3>
                <p className="text-xs text-yellow-700/50">oleh {r.author}</p>
              </div>
              <i className={`fas fa-chevron-${expanded === r.id ? 'up' : 'down'} text-xs text-yellow-700/40`}></i>
            </div>
            {expanded === r.id && (
              <div className="mt-3 space-y-3 animate-fadeIn pt-3"
                style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
                <div>
                  <h4 className="font-semibold text-yellow-600/80 mb-1 text-xs uppercase tracking-wider">
                    <i className="fas fa-list mr-1" />Bahan:
                  </h4>
                  <p className="text-[#c8b07a] text-sm">{r.ingredients}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-600/80 mb-1 text-xs uppercase tracking-wider">
                    <i className="fas fa-shoe-prints mr-1" />Langkah:
                  </h4>
                  <p className="text-[#c8b07a] text-sm whitespace-pre-wrap">{r.steps}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
