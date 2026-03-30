'use client';
import { useState, useEffect, useCallback } from 'react';
import Beranda from '@/components/tabs/Beranda';
import Silsilah from '@/components/tabs/Silsilah';
import RuangTengah from '@/components/tabs/RuangTengah';
import SowanMbah from '@/components/tabs/SowanMbah';
import PapanDoa from '@/components/tabs/PapanDoa';
import KitabResep from '@/components/tabs/KitabResep';
import GaleriPusaka from '@/components/tabs/GaleriPusaka';
import PollingDemokrasi from '@/components/tabs/PollingDemokrasi';
import KapsulWaktu from '@/components/tabs/KapsulWaktu';
import PetaSebaran from '@/components/tabs/PetaSebaran';
import RuangKomando from '@/components/tabs/RuangKomando';

type Role = 'member' | 'admin' | 'owner' | null;
type Tab = 'beranda' | 'silsilah' | 'ruang-tengah' | 'sowan-mbah' | 'papan-doa' | 'kitab-resep' | 'galeri' | 'polling' | 'kapsul' | 'peta' | 'ruang-komando';

const MEMBER_TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'beranda', icon: 'fa-home', label: 'Beranda' },
  { id: 'silsilah', icon: 'fa-sitemap', label: 'Silsilah' },
  { id: 'ruang-tengah', icon: 'fa-comments', label: 'Ruang Tengah' },
  { id: 'sowan-mbah', icon: 'fa-hat-wizard', label: 'Sowan Mbah' },
  { id: 'papan-doa', icon: 'fa-praying-hands', label: 'Papan Doa' },
  { id: 'kitab-resep', icon: 'fa-utensils', label: 'Kitab Resep' },
  { id: 'galeri', icon: 'fa-images', label: 'Galeri Pusaka' },
  { id: 'polling', icon: 'fa-poll', label: 'Demokrasi' },
  { id: 'kapsul', icon: 'fa-hourglass-half', label: 'Kapsul Waktu' },
  { id: 'peta', icon: 'fa-map-marked-alt', label: 'Peta Sebaran' },
];

const GAMELAN_NOTES = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];

// Gunungan Wayang SVG ornament
const GununganOrnament = () => (
  <svg viewBox="0 0 100 120" className="w-16 h-16 mx-auto mb-2 opacity-80" fill="none">
    <path d="M50 5 L90 100 H10 Z" stroke="#D4AF37" strokeWidth="1.5" fill="none" opacity="0.7" />
    <path d="M50 15 L80 95 H20 Z" stroke="#D4AF37" strokeWidth="1" fill="rgba(212,175,55,0.05)" opacity="0.5" />
    <circle cx="50" cy="35" r="8" stroke="#D4AF37" strokeWidth="1" fill="rgba(212,175,55,0.1)" />
    <path d="M35 60 Q50 50 65 60" stroke="#D4AF37" strokeWidth="1" fill="none" opacity="0.6" />
    <path d="M30 75 Q50 65 70 75" stroke="#D4AF37" strokeWidth="1" fill="none" opacity="0.5" />
    <path d="M25 90 Q50 80 75 90" stroke="#D4AF37" strokeWidth="1" fill="none" opacity="0.4" />
    <line x1="50" y1="5" x2="50" y2="100" stroke="#D4AF37" strokeWidth="0.75" opacity="0.3" strokeDasharray="3 4" />
  </svg>
);

export default function Home() {
  const [role, setRole] = useState<Role>(null);
  const [userName, setUserName] = useState('');
  const [tab, setTab] = useState<Tab>('beranda');
  const [killSwitch, setKillSwitch] = useState(false);
  const [megaphone, setMegaphone] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [eventDate] = useState('2026-06-15');
  const [loading, setLoading] = useState(true);
  const [gamelanPlaying, setGamelanPlaying] = useState(false);

  // Login state
  const [loginMode, setLoginMode] = useState<'member' | 'admin' | 'owner' | null>(null);
  const [selectedMember, setSelectedMember] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Member Management State
  const [members, setMembers] = useState<{ id: string; name: string; generation: number }[]>([]);
  const [gamelanLink, setGamelanLink] = useState('');
  const [manageForm, setManageForm] = useState({ id: '', name: '', location: '' });
  const [manageLoading, setManageLoading] = useState(false);
  const [manageMode, setManageMode] = useState<'list' | 'add' | 'edit' | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.members) setMembers(data.members);
      if (data.gamelanYoutubeLink !== undefined) setGamelanLink(data.gamelanYoutubeLink);
    } catch (err) {
      console.error('Failed fetching members/config', err);
    }
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check' }),
      });
      const data = await res.json();
      if (data.session) {
        setRole(data.session.role);
        setUserName(data.session.name);
      }
      setKillSwitch(data.killSwitch || false);
      setMegaphone(data.megaphone || null);
      setAiEnabled(data.aiEnabled !== false);
      await fetchMembers();
    } catch { /* ignore */ }
    setLoading(false);
  }, [fetchMembers]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { checkSession(); }, [checkSession]);
  useEffect(() => { const i = setInterval(checkSession, 8000); return () => clearInterval(i); }, [checkSession]);

  const handleManageMember = async (action: 'add' | 'edit' | 'delete', idx?: string) => {
    setManageLoading(true);
    try {
      const body = { action, id: idx || manageForm.id, member: { name: manageForm.name, location: manageForm.location } };
      const res = await fetch('/api/members', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        await fetchMembers();
        if (action !== 'delete') setManageMode('list');
      }
    } catch { /* ignore */ }
    setManageLoading(false);
  };

  const login = async (action: string, body: Record<string, string>) => {
    setLoginError('');
    const res = await fetch('/api/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body }),
    });
    const data = await res.json();
    if (data.error) { setLoginError(data.error); return; }
    setRole(data.role);
    setUserName(data.name);
    if (data.redirect) setTab('ruang-komando');
    setLoginMode(null);
  };

  const logout = async () => {
    await fetch('/api/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    setRole(null);
    setUserName('');
    setTab('beranda');
  };

  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const playGamelan = () => {
    if (gamelanPlaying) {
      setGamelanPlaying(false);
      return;
    }
    setGamelanPlaying(true);
    
    // Fallback to Tone Synth only if no valid YouTube link
    if (!extractYoutubeId(gamelanLink)) {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      GAMELAN_NOTES.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.3 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.3);
        osc.stop(ctx.currentTime + i * 0.3 + 0.8);
      });
      setTimeout(() => setGamelanPlaying(false), 3000);
    }
  };

  // Show tabs based on role + AI enabled
  const visibleTabs = MEMBER_TABS.filter(t => {
    if (t.id === 'sowan-mbah' && !aiEnabled) return false;
    return true;
  });

  const allTabs = role === 'admin' || role === 'owner'
    ? [...visibleTabs, { id: 'ruang-komando' as Tab, icon: 'fa-crown', label: 'Ruang Komando' }]
    : visibleTabs;

  // =========================================================
  // LOADING SCREEN
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center batik-bg" style={{ background: 'radial-gradient(ellipse at center, #1a1200 0%, #0a0800 60%, #040300 100%)' }}>
        <div className="text-center animate-fadeIn">
          <GununganOrnament />
          <h1 className="text-3xl font-serif font-bold text-[#D4AF37] tracking-wider mt-2" style={{ textShadow: '0 0 30px rgba(212,175,55,0.5)' }}>
            Portal Trah Martodinaman
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // LOGIN SCREEN
  // =========================================================
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 30% 40%, #1a1200 0%, #0a0800 50%, #040300 100%)' }}>
        
        {/* Batik watermark */}
        <div className="absolute inset-0 batik-bg opacity-100 pointer-events-none" />
        
        {/* Radial gold aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />
        
        {/* Corner ornaments */}
        <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-yellow-600/30 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 border-yellow-600/30 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-6 left-6 w-16 h-16 border-l-2 border-b-2 border-yellow-600/30 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-yellow-600/30 rounded-br-lg pointer-events-none" />

        <div className="relative z-10 w-full max-w-md animate-fadeIn">
          {/* Card */}
          <div className="glass-card-royal p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <GununganOrnament />
              <h1 className="text-4xl font-serif font-bold tracking-wider" style={{ color: '#D4AF37', textShadow: '0 0 30px rgba(212,175,55,0.45)' }}>
                Portal Trah
              </h1>
              <p className="text-[#D4AF37]/70 mt-1 text-sm font-semibold tracking-[0.35em] uppercase">Martodinaman</p>
              {/* Gold divider */}
              <div className="flex items-center gap-3 mt-5 px-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent" />
                <span className="text-yellow-700/60 text-xs">✦</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent" />
              </div>
            </div>

            {/* ── Default: member select + manage ── */}
            {!loginMode && !manageMode && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-yellow-600/70 mb-2 uppercase tracking-widest">Identitas Anggota</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-yellow-600/40">
                      <i className="fas fa-user-circle"></i>
                    </div>
                    <select
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-[#e8d5a3] appearance-none focus:outline-none transition-all cursor-pointer"
                      style={{
                        background: 'rgba(212,175,55,0.05)',
                        border: '1px solid rgba(212,175,55,0.25)',
                        boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.05)',
                      }}
                      value={selectedMember} onChange={e => setSelectedMember(e.target.value)}
                    >
                      <option value="" style={{ background: '#1a1200' }}>Pilih nama Anda...</option>
                      {members.map(m => <option key={m.id} value={m.name} style={{ background: '#1a1200' }}>{m.name}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-yellow-600/40">
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => selectedMember && login('login-member', { name: selectedMember })}
                  disabled={!selectedMember}
                  className="btn-emas w-full"
                >
                  <i className="fas fa-torii-gate mr-2 opacity-80" />
                  Masuk Portal
                </button>

                <button
                  onClick={() => setManageMode('list')}
                  className="w-full text-center py-2 text-sm text-yellow-600/60 hover:text-yellow-500 font-medium transition-colors"
                >
                  <i className="fas fa-users-cog mr-1.5 opacity-70"></i>Kelola Daftar Anggota
                </button>

                <div className="flex gap-3 mt-2 pt-5"
                  style={{ borderTop: '1px solid rgba(212,175,55,0.12)' }}>
                  <button
                    onClick={() => setLoginMode('admin')}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold font-serif transition-all text-yellow-700/70 hover:text-yellow-500"
                    style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}
                  >
                    <i className="fas fa-shield-alt mr-1.5 opacity-60" />Pengurus
                  </button>
                  <button
                    onClick={() => setLoginMode('owner')}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold font-serif transition-all text-yellow-600/80 hover:text-yellow-400"
                    style={{ background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)' }}
                  >
                    <i className="fas fa-crown mr-1.5 opacity-70" />Sang Arsitek
                  </button>
                </div>
              </div>
            )}

            {/* ── Manage Members ── */}
            {manageMode && (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
                  <h2 className="font-serif font-bold text-[#D4AF37]">
                    {manageMode === 'list' ? 'Daftar Anggota' : manageMode === 'add' ? 'Tambah Anggota' : 'Edit Anggota'}
                  </h2>
                  <button onClick={() => { if (manageMode === 'list') setManageMode(null); else setManageMode('list'); }}
                    className="text-yellow-700/50 hover:text-red-500 transition-colors w-7 h-7 flex items-center justify-center rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {manageMode === 'list' && (
                  <div className="space-y-3">
                    <button onClick={() => { setManageForm({ id: '', name: '', location: '' }); setManageMode('add'); }}
                      className="w-full py-2 text-sm font-semibold text-yellow-600 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-yellow-600/10"
                      style={{ border: '1px dashed rgba(212,175,55,0.3)' }}>
                      <i className="fas fa-plus" /> Tambah Anggota Baru
                    </button>
                    <div className="max-h-[220px] overflow-y-auto custom-scroll pr-1 space-y-1.5">
                      {members.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 rounded-xl"
                          style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#e8d5a3] text-sm">{m.name}</span>
                            {m.location && <span className="text-xs text-yellow-700/50"><i className="fas fa-map-marker-alt mr-1"></i>{m.location}</span>}
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => { setManageForm({ id: m.id, name: m.name, location: m.location || '' }); setManageMode('edit'); }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-400/70 hover:text-blue-300 transition-colors"
                              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}>
                              <i className="fas fa-pen text-xs"></i>
                            </button>
                            <button onClick={() => { if (confirm(`Hapus ${m.name}?`)) handleManageMember('delete', m.id); }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400/70 hover:text-red-400 transition-colors"
                              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}>
                              <i className="fas fa-trash text-xs"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                      {members.length === 0 && <p className="text-center text-sm text-yellow-700/40 py-4">Belum ada anggota.</p>}
                    </div>
                    <p className="text-xs text-yellow-700/40 text-center italic">Semua perubahan dicatat dalam Audit Log Sistem.</p>
                  </div>
                )}

                {(manageMode === 'add' || manageMode === 'edit') && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-yellow-700/60 mb-1 uppercase tracking-wider">Nama Lengkap</label>
                      <input className="input-keraton" placeholder="Contoh: Budi Santoso"
                        value={manageForm.name} onChange={e => setManageForm({...manageForm, name: e.target.value})} autoFocus />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-yellow-700/60 mb-1 uppercase tracking-wider">Lokasi (Opsional)</label>
                      <input className="input-keraton" placeholder="Contoh: Jakarta"
                        value={manageForm.location} onChange={e => setManageForm({...manageForm, location: e.target.value})} />
                    </div>
                    <button onClick={() => handleManageMember(manageMode)} disabled={!manageForm.name.trim() || manageLoading}
                      className="btn-emas w-full mt-1">
                      {manageLoading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-save mr-1.5"></i>Simpan Profil</>}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Admin Login ── */}
            {loginMode === 'admin' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <i className="fas fa-shield-alt text-2xl text-blue-400"></i>
                </div>
                <div className="text-center mb-4">
                  <h2 className="font-serif font-bold text-[#e8d5a3]">Akses Pengurus</h2>
                  <p className="text-xs text-yellow-700/50 mt-1">Masukkan PIN keamanan</p>
                </div>
                <input type="password"
                  className="input-keraton w-full text-center tracking-[0.5em] font-mono text-xl"
                  placeholder="••••"
                  value={otpInput} onChange={e => setOtpInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && login('login-admin', { otp: otpInput })} autoFocus />
                {loginError && <p className="text-red-400 text-xs text-center rounded-lg py-2"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>{loginError}</p>}
                <button onClick={() => login('login-admin', { otp: otpInput })} disabled={!otpInput}
                  className="w-full py-3 rounded-xl font-bold font-serif text-white/90 transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', border: '1px solid rgba(59,130,246,0.3)' }}>
                  Otorisasi
                </button>
                <button onClick={() => { setLoginMode(null); setLoginError(''); setOtpInput(''); }}
                  className="text-yellow-700/40 text-sm w-full text-center hover:text-yellow-600/70 transition-colors">Batalkan</button>
              </div>
            )}

            {/* ── Owner Login ── */}
            {loginMode === 'owner' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
                  <i className="fas fa-crown text-2xl text-yellow-500"></i>
                </div>
                <div className="text-center mb-4">
                  <h2 className="font-serif font-bold text-[#D4AF37]">Sang Arsitek</h2>
                  <p className="text-xs text-yellow-700/50 mt-1">Akses level tertinggi</p>
                </div>
                <input type="password"
                  className="input-keraton w-full"
                  placeholder="Password Master"
                  value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && login('login-owner', { password: passwordInput })} autoFocus />
                {loginError && <p className="text-red-400 text-xs text-center rounded-lg py-2"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>{loginError}</p>}
                <button onClick={() => login('login-owner', { password: passwordInput })} disabled={!passwordInput}
                  className="btn-emas w-full disabled:opacity-40">
                  Override System
                </button>
                <button onClick={() => { setLoginMode(null); setLoginError(''); setPasswordInput(''); }}
                  className="text-yellow-700/40 text-sm w-full text-center hover:text-yellow-600/70 transition-colors">Batalkan</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // KILL SWITCH OVERLAY
  // =========================================================
  if (killSwitch && role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'radial-gradient(ellipse at center, #1a0000 0%, #050000 100%)' }}>
        <div className="text-center animate-fadeIn">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 0 40px rgba(239,68,68,0.15)' }}>
            <i className="fas fa-power-off text-4xl text-red-500"></i>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#D4AF37] mb-3" style={{ textShadow: '0 0 20px rgba(212,175,55,0.4)' }}>
            Portal Sedang Dipugar Sang Arsitek
          </h1>
          <p className="text-yellow-700/60 text-lg">Harap bersabar. Portal akan kembali segera.</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="flex-1 max-w-24 h-px bg-gradient-to-r from-transparent to-yellow-600/40" />
            <div className="w-2 h-2 rounded-full bg-yellow-600 animate-pulse" />
            <div className="flex-1 max-w-24 h-px bg-gradient-to-l from-transparent to-yellow-600/40" />
          </div>
          <button onClick={logout} className="mt-8 text-yellow-700/40 hover:text-yellow-600/70 text-sm underline transition-colors">Keluar</button>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN APP
  // =========================================================
  return (
    <div className="min-h-screen pb-20 md:pb-4 batik-bg" style={{ background: '#080600' }}>
      
      {/* Megaphone Banner */}
      {megaphone && (
        <div className="text-white py-3 px-4 text-center font-bold animate-slideDown shadow-lg font-serif"
          style={{ background: 'linear-gradient(90deg, #7f1d1d, #dc2626, #b91c1c)', borderBottom: '1px solid rgba(239,68,68,0.4)', boxShadow: '0 4px 20px rgba(239,68,68,0.3)' }}>
          <i className="fas fa-bullhorn mr-2 animate-bounce" />
          {megaphone}
        </div>
      )}

      {/* Desktop Top Navbar */}
      <nav className="hidden md:block sticky top-0 z-40"
        style={{ background: 'rgba(8,6,0,0.92)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16 gap-4">
            <div className="flex items-center gap-2.5 mr-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #5c3d00, #8b6300)', border: '1px solid rgba(212,175,55,0.35)' }}>
                <i className="fas fa-monument text-yellow-400 text-sm"></i>
              </div>
              <span className="font-serif font-bold text-[#D4AF37] text-lg tracking-wide">Trah Martodinaman</span>
            </div>
            <div className="flex-1 flex gap-1 overflow-x-auto custom-scroll py-1.5">
              {allTabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`tab-btn ${tab === t.id ? 'tab-btn-active' : 'tab-btn-inactive'}`}>
                  <i className={`fas ${t.icon} mr-1.5`} />{t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 ml-4" style={{ borderLeft: '1px solid rgba(212,175,55,0.15)', paddingLeft: '1rem' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                  style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}>
                  <i className={`fas ${role === 'owner' ? 'fa-crown text-yellow-500' : role === 'admin' ? 'fa-shield-alt text-blue-400' : 'fa-user text-yellow-600/50'}`}></i>
                </div>
                <span className="text-sm text-yellow-600/80 font-medium">{userName}</span>
              </div>
              <button onClick={logout} className="text-yellow-700/40 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                <i className="fas fa-sign-out-alt" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-40"
        style={{ background: 'rgba(8,6,0,0.95)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #5c3d00, #8b6300)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <i className="fas fa-monument text-yellow-400 text-xs"></i>
            </div>
            <span className="font-serif font-bold text-[#D4AF37] tracking-wide">Trah</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-yellow-600/60">{userName}</span>
            <button onClick={logout} className="text-yellow-700/40 hover:text-red-400 transition-colors p-2">
              <i className="fas fa-sign-out-alt" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-5">
        {tab === 'beranda' && <Beranda eventDate={eventDate} />}
        {tab === 'silsilah' && <Silsilah />}
        {tab === 'ruang-tengah' && <RuangTengah userName={userName} />}
        {tab === 'sowan-mbah' && <SowanMbah aiEnabled={aiEnabled} />}
        {tab === 'papan-doa' && <PapanDoa />}
        {tab === 'kitab-resep' && <KitabResep />}
        {tab === 'galeri' && <GaleriPusaka />}
        {tab === 'polling' && <PollingDemokrasi userName={userName} />}
        {tab === 'kapsul' && <KapsulWaktu />}
        {tab === 'peta' && <PetaSebaran />}
        {tab === 'ruang-komando' && (role === 'admin' || role === 'owner') && (
          <RuangKomando role={role} onConfigChange={checkSession} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 custom-scroll"
        style={{ background: 'rgba(8,6,0,0.97)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 -8px 32px rgba(0,0,0,0.6)' }}>
        <div className="flex overflow-x-auto custom-scroll">
          {allTabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[70px] py-2.5 flex flex-col items-center gap-0.5 transition-all ${tab === t.id ? 'text-[#D4AF37]' : 'text-yellow-700/35'}`}>
              {tab === t.id && (
                <div className="absolute bottom-0 w-8 h-0.5 rounded-full" style={{ background: '#D4AF37', boxShadow: '0 0 8px rgba(212,175,55,0.6)' }} />
              )}
              <i className={`fas ${t.icon} text-base`} style={tab === t.id ? { filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.6))' } : {}} />
              <span className="text-[10px] font-semibold font-serif">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Floating Gamelan Button */}
      <button onClick={playGamelan}
        className={`fixed bottom-20 md:bottom-6 right-4 w-14 h-14 rounded-full text-black shadow-xl z-50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all font-bold ${gamelanPlaying ? 'animate-pulse-glow' : ''}`}
        style={{
          background: 'linear-gradient(135deg, #b8860b, #D4AF37, #F0C040)',
          boxShadow: '0 4px 20px rgba(212,175,55,0.4), 0 0 0 1px rgba(212,175,55,0.4)'
        }}
        title="Mainkan Gamelan">
        <i className={`fas fa-music text-lg ${gamelanPlaying && extractYoutubeId(gamelanLink) ? 'animate-spin' : ''}`} style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3)' }} />
      </button>

      {/* Hidden Gamelan YouTube Player */}
      {gamelanPlaying && extractYoutubeId(gamelanLink) && (
        <iframe 
          src={`https://www.youtube.com/embed/${extractYoutubeId(gamelanLink)}?autoplay=1&loop=1&playlist=${extractYoutubeId(gamelanLink)}`} 
          allow="autoplay" 
          className="hidden opacity-0 pointer-events-none absolute w-0 h-0" 
        />
      )}
    </div>
  );
}
