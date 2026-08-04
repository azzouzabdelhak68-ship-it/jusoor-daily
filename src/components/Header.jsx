import React, { useState, useEffect } from 'react';
import { fmtClock, fmtDateNice, greet } from '../lib/time.js';
import { Card, Pill } from './ui.jsx';

export default function Header({ data, online }) {
  const [clock, setClock] = useState(fmtClock());
  useEffect(() => {
    const iv = setInterval(() => setClock(fmtClock()), 1000);
    return () => clearInterval(iv);
  }, []);

  const day = data?.todayRow;
  const nowM = Number(clock.split(':')[0]) * 60 + Number(clock.split(':')[1]);
  const prayerChain = day
    ? [['Fajr', day.fajr], ['Dhuhr', day.dhuhr], ['Asr', day.asr], ['Maghrib', day.maghrib], ['Isha', day.isha]]
    : [];
  let next = null;
  let minDiff = Infinity;
  for (const [name, t] of prayerChain) {
    if (!t) continue;
    const [h, m] = t.split(':').map(Number);
    let diff = (h * 60 + m) - nowM;
    if (diff < 0) diff += 1440;
    if (diff < minDiff) {
      minDiff = diff;
      next = { name, time: t, diff };
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-carbon-bg/85 backdrop-blur border-b border-carbon-border px-5 lg:px-8 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blaze to-blaze-hover flex items-center justify-center shadow-glow shrink-0">
          <span className="font-black text-white text-sm">J</span>
        </div>
        <div className="min-w-0">
          <h1 className="font-display font-extrabold tracking-tight text-sm sm:text-base truncate">
            {greet()}, Tiamat
          </h1>
          <p className="text-[11px] text-carbon-muted truncate">
            {data?.today ? fmtDateNice(data.today) : '—'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {next && (
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-carbon-card border border-carbon-border px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blaze opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blaze" />
            </span>
            <span className="text-xs font-semibold text-carbon-text">
              {next.name} in <span className="text-blaze font-mono">{Math.floor(next.diff / 60)}h {next.diff % 60}m</span>
            </span>
          </div>
        )}

        <div className="rounded-xl bg-carbon-card border border-carbon-border px-3 py-1.5 text-center">
          <p className="font-mono font-bold text-sm sm:text-base text-blaze tracking-wider">{clock}</p>
          <p className="text-[9px] uppercase tracking-widest text-carbon-faint">GMT+1</p>
        </div>

        <Pill className={online ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gold/10 text-gold border border-gold/20'}>
          <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
          {online ? 'Cloud' : 'Demo'}
        </Pill>
      </div>
    </header>
  );
}
