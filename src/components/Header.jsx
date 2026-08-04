import React, { useState, useEffect } from 'react';
import { fmtClock, fmtDateNice, greet } from '../lib/time.js';
import { Pill } from './ui.jsx';

export default function Header({ data, online, onExport }) {
  const [clock, setClock] = useState(fmtClock());
  const [copied, setCopied] = useState(false);
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

  async function handleExport() {
    const ok = await onExport?.();
    setCopied(ok);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <header className="sticky top-0 z-30 bg-carbon-bg/90 backdrop-blur border-b border-carbon-border px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-sm bg-blaze flex items-center justify-center shadow orange-glow shrink-0">
          <span className="font-display font-black text-black text-sm">J</span>
        </div>
        <div className="min-w-0">
          <h1 className="font-display font-extrabold tracking-tight text-sm sm:text-base truncate">
            JUSOOR <span className="text-carbon-muted font-medium">// DAILY OS</span>
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-carbon-faint truncate">
            {data?.today ? fmtDateNice(data.today) : '—'} · {greet()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {next && (
          <div className="hidden md:flex items-center gap-2 rounded-sm bg-carbon-panel border border-carbon-border px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blaze opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blaze" />
            </span>
            <span className="font-mono text-[11px] font-semibold text-carbon-text uppercase">
              <span className="text-carbon-muted">{next.name}</span> in{' '}
              <span className="text-blaze font-bold">
                {Math.floor(next.diff / 60)}h {next.diff % 60}m
              </span>
            </span>
          </div>
        )}

        <div className="rounded-sm bg-carbon-panel border border-carbon-border px-2.5 py-1 text-center">
          <p className="font-mono font-bold text-sm text-blaze tracking-wider">{clock}</p>
          <p className="font-mono text-[8px] uppercase tracking-widest text-carbon-faint">GMT+1</p>
        </div>

        <button
          onClick={handleExport}
          className="hidden sm:inline-flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-wider bg-blaze hover:bg-blaze-hover text-black px-3 py-1.5 rounded-sm orange-glow transition-colors"
        >
          ⚡ {copied ? 'Copied!' : 'Export for Groq'}
        </button>

        <Pill className={online ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gold/10 text-gold border border-gold/20'}>
          <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
          {online ? 'Cloud' : 'Demo'}
        </Pill>
      </div>
    </header>
  );
}
