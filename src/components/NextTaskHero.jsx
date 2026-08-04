import React from 'react';
import { nowMinutes, minutesOf, minutesUntil } from '../lib/time.js';
import { Card } from './ui.jsx';

export default function NextTaskHero({ tasks, onComplete, onOpen }) {
  const now = nowMinutes();
  const open = (tasks || []).filter((t) => t.status !== 'done' && minutesOf(t.start_time) !== null);
  const upcoming = open
    .map((t) => ({ ...t, m: minutesOf(t.start_time) }))
    .filter((t) => t.m >= now)
    .sort((a, b) => a.m - b.m);

  const inHour = upcoming.filter((t) => t.m <= now + 60);
  const next = inHour[0] || upcoming[0];

  const renderBox = () => {
    if (!next) {
      return (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-display text-lg font-bold">Nothing scheduled right now</p>
          <p className="text-sm text-carbon-muted mt-1">Use the time for Jusoor deep work or add a task.</p>
        </div>
      );
    }
    const until = next.m - now;
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="shrink-0 w-20 h-20 rounded-2xl bg-black/30 border border-white/10 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-black text-blaze-bright">{until < 60 ? `${until}m` : `${Math.floor(until / 60)}h${until % 60 ? ' ' + (until % 60) + 'm' : ''}`}</span>
          <span className="text-[9px] uppercase tracking-widest text-carbon-muted">from now</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge bg-blaze/20 text-blaze-bright border border-blaze/30">
              {inHour.length ? '⚡ Next in 1 hour' : '⏭ Next up'}
            </span>
            <span className="badge bg-white/5 text-carbon-muted">{next.project || 'Jusoor'}</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight mt-2 truncate">{next.title}</h2>
          <p className="text-sm text-carbon-muted mt-1 font-mono">
            {next.start_time}
            {next.end_time ? ` → ${next.end_time}` : ''}
            {next.priority && ` · ${next.priority}`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onComplete(next.id)}
            className="btn-primary"
          >
            ✓ Done
          </button>
          <button
            onClick={() => onOpen(next)}
            className="btn-ghost"
          >
            Open
          </button>
        </div>
      </div>
    );
  };

  return (
    <Card className="relative overflow-hidden p-5 sm:p-6 border-blaze/20">
      <div className="absolute inset-0 bg-gradient-to-r from-blaze-deep/40 via-blaze/10 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blaze/20 blur-3xl pointer-events-none" />
      <div className="relative">{renderBox()}</div>
    </Card>
  );
}
