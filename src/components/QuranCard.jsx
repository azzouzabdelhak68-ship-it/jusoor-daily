import React, { useState } from 'react';
import { Card, SectionTitle, ProgressBar } from './ui.jsx';
import { QURAN_TOTAL, suggestedEnd, progressPercent, nextStart } from '../lib/quran.js';
import { yesterdayStr } from '../lib/time.js';

export default function QuranCard({ day, days, onSave }) {
  const [input, setInput] = useState('');

  if (!day) return null;
  const qStart = day.quran_start || 1;
  const qEndSuggest = suggestedEnd(qStart);
  const lastRead = day.quran_end != null ? day.quran_end : qStart - 1;
  const yesterday = (days || []).find((d) => d.date === yesterdayStr());

  const history = (days || [])
    .filter((d) => d.quran_end != null)
    .slice(-7);

  const submit = (e) => {
    e.preventDefault();
    const v = parseInt(input, 10);
    if (Number.isNaN(v) || v < qStart || v > QURAN_TOTAL) return;
    onSave({ quran_end: v });
    setInput('');
  };

  const pct = progressPercent(day.quran_end || lastRead);
  const tomorrow = nextStart(qStart, day.quran_end);

  return (
    <Card className="p-5 rounded-sm">
      <SectionTitle
        icon="📖"
        title="QURAN ADAPTIVE ENGINE"
        right={<span className="font-mono text-xs text-carbon-muted uppercase">603 pages</span>}
      />

      <ProgressBar value={pct} color="bg-blaze" className="mb-4" />

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-sm bg-[#0a0a0c] border border-carbon-border p-3">
          <p className="label text-emerald2/80">Suggestion</p>
          <p className="mt-1 font-mono font-bold text-sm text-carbon-text">{qStart} → {qEndSuggest}</p>
        </div>
        <div className="rounded-sm bg-[#0a0a0c] border border-carbon-border p-3">
          <p className="label text-blaze-bright">Read up to</p>
          <input
            type="number"
            min={qStart}
            max={QURAN_TOTAL}
            placeholder={day.quran_end ? String(day.quran_end) : '—'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit(e)}
            className="w-full mt-1 bg-transparent font-mono font-bold text-lg text-blaze outline-none placeholder:text-carbon-faint border-b border-dashed border-carbon-border focus:border-blaze"
          />
        </div>
        <div className="rounded-sm bg-blaze/10 border border-blaze/25 p-3">
          <p className="label text-blaze">% of 603</p>
          <p className="mt-1 font-mono font-bold text-lg text-blaze">{pct}%</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          onClick={submit}
          disabled={!input}
          className="font-mono text-[10px] font-extrabold uppercase tracking-wider bg-blaze hover:bg-blaze-hover text-black disabled:opacity-40 px-3 py-1.5 rounded-sm orange-glow"
        >
          ⚡ Save Progress
        </button>
        <span className="font-mono text-[10px] text-carbon-muted">
          {day.quran_end != null
            ? day.quran_end >= QURAN_TOTAL
              ? 'Khatm! wraps to page 1 tomorrow'
              : `tomorrow auto-starts at page ${tomorrow}`
            : 'tomorrow auto-starts at page 1'}
        </span>
      </div>

      {history.length > 0 && (
        <div className="mt-2">
          <p className="label mb-2">Last reads</p>
          <div className="flex items-end gap-1.5 h-14">
            {history.map((h) => (
              <div key={h.date} className="flex-1 flex flex-col justify-end" title={h.date}>
                <div
                  className="rounded-sm bg-gradient-to-t from-blaze/70 to-blaze/30"
                  style={{ height: `${Math.min(100, ((h.quran_end - h.quran_start + 1) / 50) * 100)}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}