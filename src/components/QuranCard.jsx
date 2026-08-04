import React, { useState } from 'react';
import { Card, SectionTitle, ProgressBar } from './ui.jsx';
import { QURAN_TOTAL, suggestedEnd, progressPercent } from '../lib/quran.js';
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
    .slice(-7)
    .map((d) => ({ date: d.date, start: d.quran_start, end: d.quran_end }));

  const submit = (e) => {
    e.preventDefault();
    const v = parseInt(input, 10);
    if (Number.isNaN(v) || v < qStart || v > QURAN_TOTAL) return;
    onSave({ quran_end: v });
    setInput('');
  };

  return (
    <Card className="p-5">
      <SectionTitle
        icon="📖"
        title="Quran — 603 pages"
        right={
          <span className="font-mono text-xs text-carbon-muted">
            {progressPercent(day.quran_end || lastRead)}%
          </span>
        }
      />
      <ProgressBar value={progressPercent(day.quran_end || lastRead)} color="bg-emerald2" className="mb-4" />

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-xl bg-carbon-panel border border-carbon-border p-3">
          <p className="label text-emerald2/80">Yesterday</p>
          <p className="mt-1 font-mono font-bold text-sm">
            {yesterday && yesterday.quran_start
              ? `${yesterday.quran_start} → ${yesterday.quran_end || '—'}`
              : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-blaze/10 border border-blaze/25 p-3">
          <p className="label text-blaze-bright">Today's suggestion</p>
          <p className="mt-1 font-mono font-bold text-sm text-blaze-bright">
            {qStart} → {qEndSuggest}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="flex gap-2 mb-4">
        <input
          type="number"
          min={qStart}
          max={QURAN_TOTAL}
          placeholder={`End page (${qStart}–${QURAN_TOTAL})`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input"
        />
        <button type="submit" className="btn-primary shrink-0">
          Save
        </button>
      </form>

      {day.quran_end != null ? (
        <p className="text-xs text-emerald2 mb-3">
          ✓ Logged today: {qStart} → {day.quran_end}
          {day.quran_end >= QURAN_TOTAL ? ' — Khatm! Wraps back to page 1 tomorrow 🎉' : ` — tomorrow starts at ${day.quran_end + 1}`}
        </p>
      ) : (
        <p className="text-xs text-carbon-muted mb-3">
          After you log, tomorrow's start page is auto-set to page {lastRead >= QURAN_TOTAL ? 1 : lastRead + 1}.
        </p>
      )}

      {history.length > 0 && (
        <div>
          <p className="label mb-2">Last reads</p>
          <div className="flex items-end gap-1.5 h-14">
            {history.map((h) => (
              <div key={h.date} className="flex-1 flex flex-col justify-end">
                <div
                  className="rounded-t bg-gradient-to-t from-emerald2/70 to-emerald2/30"
                  style={{ height: `${Math.min(100, ((h.end - h.start + 1) / 50) * 100)}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
