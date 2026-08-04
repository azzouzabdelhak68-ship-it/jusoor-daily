import React from 'react';
import { minutesUntil } from '../lib/time.js';
import { Card, SectionTitle } from './ui.jsx';

const PRAYERS = [
  { key: 'fajr', name: 'Fajr', icon: '🌅' },
  { key: 'dhuhr', name: 'Dhuhr', icon: '☀️' },
  { key: 'asr', name: 'Asr', icon: '🌤️' },
  { key: 'maghrib', name: 'Maghrib', icon: '🌇' },
  { key: 'isha', name: 'Isha', icon: '🌙' },
];

export default function PrayerCard({ day }) {
  const list = PRAYERS.map((p) => {
    const time = day ? day[p.key] : null;
    const mins = time ? minutesUntil(time) : null;
    return { ...p, time, mins };
  });
  const next = list.find((p) => p.mins !== null && p.mins > 0) || null;
  const nextTime = next ? minutesUntil(next.time) : null;

  return (
    <Card className="p-5">
      <SectionTitle
        icon="🕌"
        title="Prayer Times"
        right={
          next ? (
            <span className="badge bg-blaze/20 text-blaze-bright border border-blaze/30">
              Next {next.name} in {nextTime >= 60 ? `${Math.floor(nextTime / 60)}h ${nextTime % 60}m` : `${nextTime}m`}
            </span>
          ) : null
        }
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {list.map((p) => {
          const active = next && next.name === p.name;
          return (
            <div
              key={p.key}
              className={`rounded-xl border p-3 text-center transition-all ${
                active
                  ? 'bg-blaze/15 border-blaze/40 shadow-glow'
                  : 'bg-carbon-panel border-carbon-border'
              }`}
            >
              <p className="text-sm">{p.icon}</p>
              <p className={`text-xs font-bold mt-1 ${active ? 'text-blaze-bright' : 'text-carbon-muted'}`}>{p.name}</p>
              <p className="font-mono text-base font-bold mt-0.5 text-carbon-text">{p.time || '—'}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
