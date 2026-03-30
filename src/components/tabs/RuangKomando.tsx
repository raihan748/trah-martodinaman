'use client';
import { useState, useEffect, useCallback } from 'react';

interface AuditEntry { id: string; user: string; action: string; timestamp: number; detail?: string; }
interface AdminUser { name: string; activeSince: number; }
interface AdminConfig {
  geminiApiKey: string; aiEnabled: boolean; killSwitch: boolean;
  capsuleForceOpen: boolean; capsuleForceLock: boolean;
  megaphoneMessage: string; megaphoneActive: boolean;
  eventDate: string; admins: AdminUser[];
}

export default function RuangKomando({ onConfigChange }: { role: string; onConfigChange: () => void }) {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [megaText, setMegaText] = useState('');
  const [gamelanLink, setGamelanLink] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch('/api/admin').then(r => r.json()).then(d => {
      setConfig(d.config);
      setAudit(d.auditLog || []);
      setIsOwner(d.isOwner);
      if (d.config) {
        setEventDate(d.config.eventDate?.split('T')[0] || '');
        setApiKey(d.config.geminiApiKey || '');
        setGamelanLink(d.config.gamelanYoutubeLink || '');
      }
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (action: string, body: Record<string, unknown> = {}) => {
    setLoading(action);
    await fetch('/api/admin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body }),
    });
    await load();
    onConfigChange();
    setLoading(null);
  };

  if (!config) return <div className="text-center py-8" style={{ color: 'rgba(212,175,55,0.5)' }}>Memuat...</div>;

  return (
    <div className="animate-fadeIn space-y-4">
      {/* Header */}
      <div className="glass-card-royal p-6 overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: isOwner ? 'linear-gradient(135deg, #3d2800, #6b4300)' : 'linear-gradient(135deg, #1a2840, #2a4060)', border: `2px solid ${isOwner ? 'rgba(212,175,55,0.5)' : 'rgba(59,130,246,0.4)'}`, boxShadow: isOwner ? '0 0 30px rgba(212,175,55,0.2)' : '0 0 20px rgba(59,130,246,0.15)' }}>
            <i className={`fas ${isOwner ? 'fa-crown text-yellow-400' : 'fa-shield-alt text-blue-400'} text-2xl`} style={{ filter: `drop-shadow(0 0 6px ${isOwner ? 'rgba(212,175,55,0.5)' : 'rgba(59,130,246,0.4)'})` }} />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold" style={{ color: '#D4AF37', textShadow: '0 0 20px rgba(212,175,55,0.3)' }}>Ruang Komando</h2>
            <p className="text-sm mt-0.5 font-serif" style={{ color: isOwner ? 'rgba(212,175,55,0.6)' : 'rgba(100,149,237,0.7)' }}>{isOwner ? 'Mode: SANG ARSITEK — GOD MODE' : 'Mode: PENGURUS'}</p>
          </div>
        </div>
      </div>

      {/* Admin Tool: Event Date */}
      <div className="god-panel">
        <h3 className="font-serif font-bold text-[#D4AF37] mb-3 flex items-center gap-2"><i className="fas fa-calendar-alt icon-gold" />Atur Tanggal Silaturahmi</h3>
        <div className="flex gap-2">
          <input type="date" className="input-keraton flex-1" value={eventDate} onChange={e => setEventDate(e.target.value)} style={{ colorScheme: 'dark' }} />
          <button onClick={() => act('set-event-date', { date: new Date(eventDate).toISOString() })} className="btn-emas" disabled={loading === 'set-event-date'}>
            {loading === 'set-event-date' ? <i className="fas fa-spinner fa-spin" /> : 'Simpan'}
          </button>
        </div>
      </div>

      {/* === GOD MODE TOOLS (Owner Only) === */}
      {isOwner && (
        <>
          <div className="pt-2 pb-1" style={{ borderTop: '1px solid rgba(212,175,55,0.2)' }}>
            <h3 className="text-xl font-serif font-bold flex items-center gap-2" style={{ color: '#D4AF37', textShadow: '0 0 20px rgba(212,175,55,0.35)' }}>
              <i className="fas fa-crown icon-gold" />GOD MODE
              <span className="text-base font-sans" style={{ color: 'rgba(212,175,55,0.5)' }}>— Hanya Sang Arsitek</span>
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* 1. Kunci API & Saklar AI */}
            <div className="god-panel">
              <h4 className="font-serif font-bold text-[#D4AF37] mb-3"><i className="fas fa-key mr-2 icon-gold" />1. Kunci API & Saklar AI</h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input type="password" className="input-keraton flex-1 text-sm" placeholder="Gemini API Key" value={apiKey} onChange={e => setApiKey(e.target.value)} />
                  <button onClick={() => act('set-api-key', { key: apiKey })} className="btn-emas !px-4 text-sm" disabled={loading === 'set-api-key'}>Set</button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
                  <span className="text-sm font-medium" style={{ color: '#c8b07a' }}>Tab Sowan Mbah</span>
                  <button onClick={() => act('toggle-ai')} className={`w-14 h-7 rounded-full transition-all relative ${config.aiEnabled ? 'bg-green-500' : 'bg-gray-700'}`}>
                    <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${config.aiEnabled ? 'left-7' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* 9. Gamelan YouTube Link */}
            <div className="god-panel">
              <h4 className="font-serif font-bold text-[#D4AF37] mb-3"><i className="fas fa-music mr-2 icon-gold" />9. Link Musik Gamelan</h4>
              <div className="flex gap-2">
                <input className="input-keraton flex-1 text-sm" placeholder="https://youtube.com/watch?v=..." value={gamelanLink} onChange={e => setGamelanLink(e.target.value)} />
                <button onClick={() => act('set-gamelan-link', { link: gamelanLink })} className="btn-emas !px-4 text-sm" disabled={loading === 'set-gamelan-link'}>Set</button>
              </div>
              <p className="text-xs mt-2" style={{ color: 'rgba(212,175,55,0.5)' }}>Masukkan link YouTube untuk pemutar musik latar website.</p>
            </div>

            {/* 3. Manajemen Admin */}
            <div className="god-panel">
              <h4 className="font-serif font-bold text-[#D4AF37] mb-3"><i className="fas fa-users-cog mr-2 icon-gold" />3. Manajemen Admin</h4>
              <div className="space-y-2">
                {config.admins.map(a => (
                  <div key={a.name} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}>
                    <div>
                      <span className="font-medium text-sm" style={{ color: '#e8d5a3' }}>{a.name}</span>
                      <span className="text-xs ml-2" style={{ color: 'rgba(212,175,55,0.4)' }}>sejak {new Date(a.activeSince).toLocaleDateString('id-ID')}</span>
                    </div>
                    <button onClick={() => act('remove-admin', { name: a.name })} className="text-red-400/70 hover:text-red-400 text-sm font-bold transition-colors">
                      <i className="fas fa-user-minus" /> Cabut
                    </button>
                  </div>
                ))}
                {config.admins.length === 0 && <p className="text-sm italic" style={{ color: 'rgba(212,175,55,0.4)' }}>Tidak ada pengurus aktif</p>}
              </div>
            </div>

            {/* 4. Force Kapsul Override */}
            <div className="god-panel">
              <h4 className="font-serif font-bold text-[#D4AF37] mb-3"><i className="fas fa-lock-open mr-2 icon-gold" />4. Force Kapsul Override</h4>
              <div className="flex gap-2">
                <button onClick={() => act('force-capsule', { mode: 'open' })} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${config.capsuleForceOpen ? 'bg-green-600 text-white' : 'text-green-400 hover:bg-green-500/10'}`}
                  style={{ border: '1px solid rgba(74,222,128,0.3)' }}>
                  <i className="fas fa-lock-open mr-1" />Paksa Buka
                </button>
                <button onClick={() => act('force-capsule', { mode: 'lock' })} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${config.capsuleForceLock ? 'bg-red-600 text-white' : 'text-red-400 hover:bg-red-500/10'}`}
                  style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
                  <i className="fas fa-lock mr-1" />Paksa Kunci
                </button>
                <button onClick={() => act('force-capsule', { mode: 'normal' })} className="flex-1 py-2 rounded-xl text-sm font-bold transition-all" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', color: 'rgba(212,175,55,0.6)' }}>
                  Normal
                </button>
              </div>
            </div>

            {/* 7. Backup Silsilah */}
            <div className="god-panel">
              <h4 className="font-serif font-bold text-[#D4AF37] mb-3"><i className="fas fa-download mr-2 icon-gold" />7. Backup Silsilah</h4>
              <button onClick={async () => {
                setLoading('backup');
                const res = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'backup-silsilah' }) });
                const data = await res.json();
                const blob = new Blob([JSON.stringify(data.backup, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = data.filename; a.click();
                URL.revokeObjectURL(url);
                setLoading(null);
              }} className="btn-emas w-full" disabled={loading === 'backup'}>
                <i className={`fas ${loading === 'backup' ? 'fa-spinner fa-spin' : 'fa-file-export'} mr-2`} />Download JSON
              </button>
            </div>
          </div>

          {/* 5. Megaphone Broadcast */}
          <div className="god-panel" style={{ border: '1px solid rgba(249,115,22,0.35)', background: 'rgba(30,10,0,0.85)' }}>
            <h4 className="font-serif font-bold mb-3 flex items-center gap-2" style={{ color: '#f97316' }}><i className="fas fa-bullhorn" style={{ color: '#f97316' }} />5. Megaphone Broadcast</h4>
            <div className="flex gap-2 mb-2">
              <input className="input-keraton flex-1" style={{ borderColor: 'rgba(249,115,22,0.3)' }} placeholder="Pesan darurat untuk semua anggota..." value={megaText} onChange={e => setMegaText(e.target.value)} />
              <button onClick={() => { act('megaphone', { message: megaText }); setMegaText(''); }}
                className="px-4 py-2 font-bold rounded-xl shadow transition-all hover:scale-105 text-white" style={{ background: 'linear-gradient(135deg, #ea580c, #dc2626)', border: '1px solid rgba(249,115,22,0.4)' }}
                disabled={!megaText.trim()}>
                <i className="fas fa-paper-plane mr-1" />Kirim
              </button>
            </div>
            {config.megaphoneActive && (
              <div className="flex items-center justify-between p-3 rounded-xl mt-2"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <span className="text-red-400 text-sm font-medium"><i className="fas fa-volume-up mr-2" />Aktif: {config.megaphoneMessage}</span>
                <button onClick={() => act('megaphone', { clear: true })} className="text-red-400/60 hover:text-red-400 text-sm font-bold transition-colors">Hapus</button>
              </div>
            )}
          </div>

          {/* Destructive row: Reset Polling + Kill Switch */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* 6. Reset Polling */}
            <div className="god-panel god-destructive">
              <h4 className="font-serif font-bold text-red-400/80 mb-3"><i className="fas fa-exclamation-triangle mr-2 text-red-500" />6. Reset Polling</h4>
              <p className="text-red-400/60 text-sm mb-3"><i className="fas fa-exclamation-circle mr-1" />Menghapus SEMUA suara di tab Demokrasi. Tidak dapat dibatalkan!</p>
              <button onClick={() => { if (confirm('YAKIN reset semua polling? Tindakan ini TIDAK bisa dibatalkan!')) act('reset-polling'); }}
                className="btn-merah w-full"><i className="fas fa-trash-alt mr-2" />RESET SEMUA SUARA</button>
            </div>

            {/* 8. Maintenance Kill Switch */}
            <div className="god-panel god-destructive">
              <h4 className="font-serif font-bold text-red-400/80 mb-3"><i className="fas fa-power-off mr-2 text-red-500" />8. Maintenance Kill Switch</h4>
              <p className="text-red-400/60 text-sm mb-3"><i className="fas fa-radiation-alt mr-1" />Mengunci SELURUH portal untuk Member & Admin.</p>
              <button onClick={() => act('kill-switch')}
                className={`w-full py-3 rounded-xl font-bold font-serif text-lg transition-all ${config.killSwitch ? 'text-white' : 'text-white'}`}
                style={config.killSwitch
                  ? { background: 'linear-gradient(135deg, #166534, #15803d)', border: '1px solid rgba(74,222,128,0.3)', boxShadow: '0 4px 20px rgba(74,222,128,0.2)' }
                  : { background: 'linear-gradient(135deg, #7f1d1d, #dc2626)', border: '1px solid rgba(239,68,68,0.4)', boxShadow: '0 4px 20px rgba(239,68,68,0.25)' }
                }>
                <i className={`fas fa-power-off mr-2`} />{config.killSwitch ? 'MATIKAN KILL SWITCH' : 'AKTIFKAN KILL SWITCH'}
              </button>
            </div>
          </div>

          {/* 2. System Audit Log */}
          <div className="god-panel">
            <h4 className="font-serif font-bold text-[#D4AF37] mb-3 flex items-center gap-2"><i className="fas fa-terminal icon-gold" />2. System Audit Log</h4>
            <div className="rounded-2xl p-4 max-h-[300px] overflow-y-auto custom-scroll font-mono text-xs"
              style={{ background: '#050302', border: '1px solid rgba(212,175,55,0.15)' }}>
              {audit.length === 0 && <div style={{ color: 'rgba(212,175,55,0.3)' }}>No entries yet...</div>}
              {audit.map(e => (
                <div key={e.id} className="flex gap-2 py-1" style={{ borderBottom: '1px solid rgba(212,175,55,0.06)' }}>
                  <span className="text-green-400/70 shrink-0">[{new Date(e.timestamp).toLocaleTimeString('id-ID')}]</span>
                  <span className="shrink-0" style={{ color: '#D4AF37' }}>{e.user}</span>
                  <span className="text-cyan-400/70">{e.action}</span>
                  {e.detail && <span className="truncate" style={{ color: 'rgba(212,175,55,0.4)' }}>{e.detail}</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
