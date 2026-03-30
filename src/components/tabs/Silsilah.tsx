'use client';
import { useState, useEffect } from 'react';

interface Member { id: string; name: string; parentId: string | null; generation: number; location?: string; birthYear?: number; }

export default function Silsilah() {
  const [tree, setTree] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Member | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', parentId: '', location: '', birthYear: '' });

  const load = () => fetch('/api/family-tree').then(r => r.json()).then(d => setTree(d.tree || []));
  useEffect(() => { load(); }, []);

  const addMember = async () => {
    if (!form.name) return;
    await fetch('/api/family-tree', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ name: '', parentId: '', location: '', birthYear: '' });
    setShowAdd(false);
    load();
  };


  return (
    <div className="animate-fadeIn space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-heading flex items-center gap-2"><i className="fas fa-sitemap icon-gold" />Silsilah Keluarga</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-emas text-sm !px-4 !py-2">
          <i className="fas fa-plus mr-1" />Tambah
        </button>
      </div>

      {showAdd && (
        <div className="glass-card p-5 animate-fadeIn space-y-3">
          <input className="input-keraton" placeholder="Nama lengkap" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <select className="input-keraton" value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })}
            style={{ background: '#0a0800' }}>
            <option value="" style={{ background: '#0a0800' }}>-- Pilih Orang Tua --</option>
            {tree.map(m => <option key={m.id} value={m.id} style={{ background: '#0a0800' }}>{m.name}</option>)}
          </select>
          <input className="input-keraton" placeholder="Lokasi" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <input className="input-keraton" placeholder="Tahun lahir" type="number" value={form.birthYear} onChange={e => setForm({ ...form, birthYear: e.target.value })} />
          <button onClick={addMember} className="btn-emas w-full">Simpan</button>
        </div>
      )}

      {/* Tree visualization */}
      <div className="glass-card p-8 overflow-x-auto custom-scroll relative"
        style={{ background: 'radial-gradient(circle at 20% 20%, rgba(212,175,55,0.04) 0%, transparent 60%), rgba(8,6,0,0.85)' }}>
        <style dangerouslySetInnerHTML={{__html: `
          .css-tree ul { padding-top: 20px; position: relative; transition: all 0.5s; display: flex; justify-content: center; }
          .css-tree li { float: left; text-align: center; list-style-type: none; position: relative; padding: 20px 5px 0 5px; transition: all 0.5s; }
          .css-tree li::before, .css-tree li::after { content: ''; position: absolute; top: 0; right: 50%; border-top: 2px solid #D4AF37; width: 50%; height: 20px; }
          .css-tree li::after { right: auto; left: 50%; border-left: 2px solid #D4AF37; }
          .css-tree li:only-child::after, .css-tree li:only-child::before { display: none; }
          .css-tree li:only-child { padding-top: 0; }
          .css-tree li:first-child::before, .css-tree li:last-child::after { border: 0 none; }
          .css-tree li:last-child::before { border-right: 2px solid #D4AF37; border-radius: 0 5px 0 0; }
          .css-tree li:first-child::after { border-radius: 5px 0 0 0; }
          .css-tree ul ul::before { content: ''; position: absolute; top: 0; left: 50%; border-left: 2px solid #D4AF37; width: 0; height: 20px; }
          .tree-node-item {
            display: inline-block; padding: 10px 15px;
            border-top: 2px solid #D4AF37; border-bottom: 2px solid #D4AF37;
            border-left: 6px solid #D4AF37; border-right: 1px solid rgba(212,175,55,0.2);
            border-radius: 4px 14px 14px 4px;
            background: rgba(12,10,3,0.9); backdrop-filter: blur(8px);
            box-shadow: 0 2px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.08);
            cursor: pointer; transition: all 0.25s; min-width: 120px;
          }
          .tree-node-item:hover { transform: scale(1.07); box-shadow: 0 4px 24px rgba(212,175,55,0.25); border-left-color: #F0C040; }
          .tree-node-item.root-node {
            background: linear-gradient(135deg, #3d2000, #6b3c00);
            border-left-color: #FFD700; border-top-color: #FFD700; border-bottom-color: #FFD700;
            box-shadow: 0 4px 32px rgba(212,175,55,0.4), 0 0 50px rgba(212,175,55,0.1);
          }
        `}} />
        
        <div className="css-tree min-w-max pb-8 pt-4">
          {(() => {
            const rootMembers = tree.filter(m => !m.parentId);
            
            const renderNode = (member: Member) => {
              const children = tree.filter(m => m.parentId === member.id);
              const isRoot = !member.parentId;
              
              return (
                <li key={member.id}>
                  <div className={`tree-node-item ${isRoot ? 'root-node' : ''}`} onClick={() => setSelected(member)}>
                    <div className="font-serif font-bold text-sm" style={{ color: isRoot ? '#FFD700' : '#D4AF37' }}>{member.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: isRoot ? 'rgba(255,215,0,0.6)' : 'rgba(212,175,55,0.5)' }}>
                      {member.location && <><i className="fas fa-map-marker-alt mr-1" />{member.location}</>}
                    </div>
                  </div>
                  {children.length > 0 && (
                    <ul>
                      {children.map(child => renderNode(child))}
                    </ul>
                  )}
                </li>
              );
            };

            if (tree.length === 0) return <div className="text-center py-10" style={{ color: 'rgba(212,175,55,0.4)' }}>Silsilah masih kosong.</div>;
            
            return (
              <ul>
                {rootMembers.map(root => renderNode(root))}
                {tree.filter(m => m.parentId && !tree.find(p => p.id === m.parentId)).map(orphan => renderNode(orphan))}
              </ul>
            );
          })()}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setSelected(null)}>
          <div className="glass-card-royal p-6 max-w-sm w-full animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3d2800, #6b4300)', border: '2px solid rgba(212,175,55,0.4)', boxShadow: '0 0 30px rgba(212,175,55,0.2)' }}>
                <i className={`fas ${selected.generation === 1 ? 'fa-crown' : selected.generation === 2 ? 'fa-user-tie' : 'fa-user'} text-2xl`}
                  style={{ color: '#D4AF37', filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.4))' }} />
              </div>
              <h3 className="text-xl font-serif font-bold" style={{ color: '#D4AF37' }}>{selected.name}</h3>
            </div>
            <div className="space-y-2 text-sm pt-3" style={{ borderTop: '1px solid rgba(212,175,55,0.15)', color: '#c8b07a' }}>
              <p><i className="fas fa-layer-group mr-2 icon-gold" />Generasi: {selected.generation}</p>
              {selected.location && <p><i className="fas fa-map-marker-alt mr-2 icon-gold" />{selected.location}</p>}
              {selected.birthYear && <p><i className="fas fa-calendar mr-2 icon-gold" />Lahir: {selected.birthYear}</p>}
              {selected.parentId && <p><i className="fas fa-user mr-2 icon-gold" />Anak dari: {tree.find(m => m.id === selected.parentId)?.name}</p>}
              <p><i className="fas fa-users mr-2 icon-gold" />Anak: {tree.filter(m => m.parentId === selected.id).map(m => m.name).join(', ') || '-'}</p>
            </div>
            <button onClick={() => setSelected(null)} className="btn-emas w-full mt-5">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
