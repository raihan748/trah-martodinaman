'use client';
import { useState, useEffect } from 'react';

interface PollOption { id: string; text: string; votes: number; voters: string[]; }
interface Poll { id: string; question: string; options: PollOption[]; createdBy: string; timestamp: number; }

export default function PollingDemokrasi({ userName }: { userName: string }) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ question: '', options: ['', ''] });

  const load = () => fetch('/api/polling').then(r => r.json()).then(d => setPolls(d.polls || []));
  useEffect(() => { load(); }, []);

  const vote = async (pollId: string, optionId: string) => {
    await fetch('/api/polling', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'vote', pollId, optionId }),
    });
    load();
  };

  const create = async () => {
    const opts = form.options.filter(o => o.trim());
    if (!form.question || opts.length < 2) return;
    await fetch('/api/polling', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', question: form.question, options: opts }),
    });
    setForm({ question: '', options: ['', ''] });
    setShowCreate(false);
    load();
  };

  return (
    <div className="animate-fadeIn space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-heading flex items-center gap-2"><i className="fas fa-poll icon-gold" />Polling Demokrasi</h2>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-emas text-sm !px-4 !py-2">
          <i className="fas fa-plus mr-1" />Buat Polling
        </button>
      </div>

      {showCreate && (
        <div className="glass-card p-5 animate-fadeIn space-y-3">
          <input className="input-keraton" placeholder="Pertanyaan polling" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} />
          {form.options.map((opt, i) => (
            <input key={i} className="input-keraton" placeholder={`Pilihan ${i + 1}`} value={opt}
              onChange={e => { const o = [...form.options]; o[i] = e.target.value; setForm({ ...form, options: o }); }} />
          ))}
          <button onClick={() => setForm({ ...form, options: [...form.options, ''] })}
            className="text-yellow-600/70 text-sm font-semibold hover:text-yellow-500 transition-colors">
            <i className="fas fa-plus mr-1" />Tambah Pilihan
          </button>
          <button onClick={create} className="btn-emas w-full">Buat Polling</button>
        </div>
      )}

      <div className="space-y-4">
        {polls.map(poll => {
          const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0);
          const hasVoted = poll.options.some(o => o.voters.includes(userName));

          return (
            <div key={poll.id} className="glass-card p-5">
              <h3 className="font-serif font-bold text-lg text-[#D4AF37] mb-4 flex items-start gap-2">
                <i className="fas fa-question-circle icon-gold mt-1 text-base" />{poll.question}
              </h3>
              <div className="space-y-2">
                {poll.options.map(opt => {
                  const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  const isWinner = opt.votes === Math.max(...poll.options.map(o => o.votes)) && opt.votes > 0;
                  return (
                    <button key={opt.id} onClick={() => !hasVoted && vote(poll.id, opt.id)} disabled={hasVoted}
                      className={`w-full text-left rounded-xl p-3 transition-all relative overflow-hidden ${hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
                      style={{ background: 'rgba(212,175,55,0.04)', border: `1px solid ${isWinner && hasVoted ? 'rgba(212,175,55,0.4)' : 'rgba(212,175,55,0.12)'}` }}>
                      {/* Progress bar */}
                      <div className="absolute inset-0 rounded-xl" style={{
                        width: `${pct}%`,
                        background: isWinner ? 'linear-gradient(90deg, rgba(212,175,55,0.15), rgba(212,175,55,0.08))' : 'rgba(212,175,55,0.06)',
                        transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)'
                      }} />
                      <div className="relative flex justify-between items-center">
                        <span className="font-medium text-[#e8d5a3] font-serif">{opt.text}</span>
                        <span className="text-sm font-bold" style={{ color: '#D4AF37' }}>
                          {pct}% <span className="text-yellow-700/50 font-normal">({opt.votes})</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 text-xs flex justify-between" style={{ borderTop: '1px solid rgba(212,175,55,0.1)', color: 'rgba(212,175,55,0.45)' }}>
                <span>Total: {totalVotes} suara</span>
                <span>oleh {poll.createdBy}</span>
              </div>
              {hasVoted && (
                <div className="mt-2 text-xs font-semibold font-serif flex items-center gap-1.5" style={{ color: '#5a8a4a' }}>
                  <i className="fas fa-check-circle" />Suara sudah tercatat
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
