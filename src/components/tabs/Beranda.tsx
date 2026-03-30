'use client';
import { useState, useEffect } from 'react';

export default function Beranda({ eventDate }: { eventDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(eventDate).getTime();
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [eventDate]);

  return (
    <div className="animate-fadeIn space-y-5">
      {/* Hero Card */}
      <div className="glass-card-royal p-8 text-center overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />
        {/* Decorative batik corners */}
        <div className="absolute top-3 left-3 text-yellow-600/20 text-2xl">✦</div>
        <div className="absolute top-3 right-3 text-yellow-600/20 text-2xl">✦</div>

        <div className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #3d2800, #6b4300)', border: '2px solid rgba(212,175,55,0.4)', boxShadow: '0 0 30px rgba(212,175,55,0.15)' }}>
          <i className="fas fa-monument text-4xl" style={{ color: '#D4AF37', filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.5))' }}></i>
        </div>
        <h2 className="text-4xl font-serif font-bold mb-2" style={{ color: '#D4AF37', textShadow: '0 0 30px rgba(212,175,55,0.35)' }}>
          Trah Martodinaman
        </h2>
        <p className="text-yellow-600/60 text-base italic">&ldquo;Menjaga Tali Silaturahmi, Merawat Warisan Leluhur&rdquo;</p>
        <div className="flex items-center justify-center gap-3 mt-5">
          <div className="flex-1 max-w-24 h-px bg-gradient-to-r from-transparent to-yellow-600/50" />
          <span className="text-yellow-600/50 text-sm">✦</span>
          <div className="flex-1 max-w-24 h-px bg-gradient-to-l from-transparent to-yellow-600/50" />
        </div>
      </div>

      {/* Countdown */}
      <div className="glass-card p-6">
        <h3 className="font-serif text-lg font-bold text-[#D4AF37] mb-5 text-center flex items-center justify-center gap-2">
          <i className="fas fa-hourglass-half icon-gold" />Hitung Mundur Silaturahmi Akbar
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Hari', value: timeLeft.days },
            { label: 'Jam', value: timeLeft.hours },
            { label: 'Menit', value: timeLeft.minutes },
            { label: 'Detik', value: timeLeft.seconds },
          ].map((t) => (
            <div key={t.label} className="rounded-2xl p-4 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #3d2800, #6b4300)', border: '1px solid rgba(212,175,55,0.35)', boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.08)' }}>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
              <div className="text-4xl md:text-5xl font-bold font-serif" style={{ color: '#F0C040', textShadow: '0 0 20px rgba(212,175,55,0.5)' }}>
                {String(t.value).padStart(2, '0')}
              </div>
              <div className="text-yellow-600/60 text-xs mt-1 font-semibold tracking-widest uppercase">{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: 'fa-users', title: 'Anggota Keluarga', value: '13+', desc: 'Terdaftar di Portal' },
          { icon: 'fa-globe-asia', title: 'Kota Sebaran', value: '7', desc: 'Di seluruh Indonesia' },
          { icon: 'fa-tree', title: 'Generasi', value: '4', desc: 'Sejak Mbah Marto' },
        ].map((s) => (
          <div key={s.title} className="glass-card p-5 text-center hover:scale-105 transition-transform cursor-default">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <i className={`fas ${s.icon} text-xl icon-gold`}></i>
            </div>
            <div className="text-3xl font-bold font-serif" style={{ color: '#D4AF37' }}>{s.value}</div>
            <div className="text-yellow-500/80 font-semibold text-sm mt-1">{s.title}</div>
            <div className="text-yellow-700/50 text-xs mt-0.5">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="glass-card p-6">
        <h3 className="font-serif font-bold text-[#D4AF37] mb-4 flex items-center gap-2">
          <i className="fas fa-scroll icon-gold" />Sejarah Singkat
        </h3>
        <div className="h-px w-full mb-4 bg-gradient-to-r from-yellow-600/30 via-yellow-600/10 to-transparent" />
        <p className="text-[#c8b07a] leading-relaxed text-sm">
          Keluarga besar Trah Martodinaman bermula dari <strong className="text-[#D4AF37]">Mbah Marto Dinaman</strong> yang lahir di Yogyakarta pada tahun 1920. 
          Beliau dikenal sebagai sosok yang bijaksana, pekerja keras, dan sangat menjaga nilai-nilai kebersamaan keluarga. 
          Kini, keturunan beliau telah tersebar di berbagai kota di Indonesia, namun tetap menjaga tali silaturahmi melalui portal keluarga ini.
        </p>
      </div>
    </div>
  );
}
