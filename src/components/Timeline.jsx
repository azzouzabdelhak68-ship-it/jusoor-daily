import React from 'react';
import { nowMinutes, minutesOf, hm } from '../lib/time.js';
import { Card, SectionTitle } from './ui.jsx';

const COLORS = {
  High: 'bg-blaze',
  Medium: 'bg-gold',
  Low: 'bg-carbon-faint',
};

export default function Timeline({ tasks, onComplete }) {
  const now = nowMinutes();
  const rows = (tasks || [])
    .map((t) => {
      const m = minutesOf(t.start_time);
      return { ...t, m: m === null ? Infinity : m };
    })
    .sort((a, b) => a.m - b.m);

  return (
    <Card className="p-5">
      <SectionTitle icon="🗓" title="Today's Timeline" />
      <div className="relative pl-6">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-carbon-border" />
        <div className="absolute left-[3px]" style={{ top: `${Math.min(100, (now / 1440) * 100)}%` }}>
          <span className="block w-2.5 h-2.5 rounded-full bg-blaze shadow-glow" />
        </div>
        <div className="space-y-1">
          {rows.map((t) => {
            const m = minutesOf(t.start_time);
            const past = m !== null && m < now;
            const ongoing = m !== null && t.start_time && t.end_time && minutesOf(t.start_time) <= now && minutesOf(t.end_time) >= now;
            const done = t.status === 'done';
            const dot = done ? 'bg-emerald2' : ongoing ? 'bg-gold' : past ? 'bg-carbon-faint' : 'bg-blaze';
            return (
              <button
                key={t.id}
                onClick={() => onComplete(t.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                  done ? 'opacity-50' : 'hover:bg-carbon-hover'
                }`}
              >
                <span className="w-3 h-3 rounded-full border-2 border-carbon-border shrink-0 relative z-10" style={{ background: dot, borderColor: dot }} />
                <span className="font-mono text-[11px] text-carbon-muted w-10 shrink-0">{t.start_time || '—'}</span>
                <span className="flex-1 min-w-0">
                  <span className={`text-sm block truncate ${done ? 'line-through text-carbon-muted' : 'font-medium text-carbon-text'}`}>{t.title}</span>
                  <span className="text-[10px] text-carbon-faint">{t.project}</span>
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${COLORS[t.priority] || 'bg-carbon-faint'}`} />
              </button>
            );
          })}
          {!rows.length && (
            <p className="text-xs text-carbon-faint py-3 text-center">No tasks scheduled today.</p>
          )}
        </div>
      </div>
    </Card>
  );
}
