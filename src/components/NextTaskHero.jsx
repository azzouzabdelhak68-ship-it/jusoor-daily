import React, { useState, useEffect, useRef } from 'react';
import { nowMinutes, minutesOf } from '../lib/time.js';
import { Card } from './ui.jsx';

const POMODORO_MS = 25 * 60;
const TAB_TIME = '00:00:00';

function pad(n) { return String(n).padStart(2, '0'); }
function hms(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
function mmss(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${pad(m)}:${pad(s)}`;
}

export default function NextTaskHero({ tasks, onComplete }) {
  const now = nowMinutes();
  const open = (tasks || []).filter((t) => t.status !== 'done' && minutesOf(t.start_time) !== null);
  const upcoming = open
    .map((t) => ({ ...t, m: minutesOf(t.start_time) }))
    .filter((t) => t.m >= now)
    .sort((a, b) => a.m - b.m);
  const inHour = upcoming.filter((t) => t.m <= now + 60);
  const next = inHour[0] || upcoming[0];

  // Pomodoro state
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(POMODORO_MS);
  const [focusSec, setFocusSec] = useState(0);
  const [session, setSession] = useState(1);
  const lastTick = useRef(null);

  useEffect(() => {
    if (!running) return;
    lastTick.current = Date.now();
    const iv = setInterval(() => {
      const nowMs = Date.now();
      const dt = (nowMs - lastTick.current) / 1000;
      lastTick.current = nowMs;
      setLeft((l) => Math.max(0, l - dt * 1000));
      setFocusSec((f) => f + dt);
    }, 250);
    return () => clearInterval(iv);
  }, [running]);

  useEffect(() => {
    if (left === 0 && running) {
      setRunning(false);
      setLeft(POMODORO_MS);
      setSession((s) => s + 1);
    }
  }, [left, running]);

  const totalFocusMin = Math.round(focusSec / 60);

  const ringR = 42;
  const ringC = 2 * Math.PI * ringR;
  const frac = left / POMODORO_MS;

  return (
    <Card className="relative overflow-hidden p-5 sm:p-6 border-blaze/20 rounded-sm">
      <div className="absolute inset-0 dot-matrix opacity-40 pointer-events-none" />
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-sm bg-blaze/15 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest bg-carbon-panel text-carbon-muted px-2 py-0.5 rounded-sm border border-carbon-border">
            ▸ Active Task // Focus Block
          </span>
          <span className="font-mono text-[10px] font-bold text-blaze uppercase">MODE: POMODORO</span>
        </div>

        {!next ? (
          <div className="text-center py-5">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-display text-lg font-bold">Nothing scheduled right now</p>
            <p className="text-sm text-carbon-muted mt-1">Use the time for Jusoor deep work or add a task.</p>
            <div className="inline-flex items-center gap-3 mt-4 font-mono text-xs">
              <span className="font-bold text-blaze">{mmss(Math.round(left / 1000))}</span>
              <button
                onClick={() => setRunning((r) => !r)}
                className="btn-primary text-[10px] px-3 py-1.5"
              >
                {running ? '⏸ PAUSE' : '▶ START'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="badge bg-blaze/15 text-blaze border border-blaze/30">
                  {inHour.length ? '⚡ Next in 1 hour' : '⏭ Next up'}
                </span>
                <span className="badge bg-white/5 text-carbon-muted border border-carbon-border">
                  {next.project || 'Jusoor'}
                </span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold tracking-tight truncate">{next.title}</h2>
              <p className="font-mono text-xs text-carbon-muted mt-1">
                {next.start_time}{next.end_time ? ` → ${next.end_time}` : ''}
                {next.priority ? ` · ${next.priority}` : ''}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button
                  onClick={() => setRunning((r) => !r)}
                  className="font-mono text-[10px] font-extrabold uppercase tracking-wider bg-blaze hover:bg-blaze-hover text-black px-3 py-1.5 rounded-sm orange-glow"
                >
                  {running ? '⏸ PAUSE' : '▶ START 25m'}
                </button>
                <button
                  onClick={() => onComplete(next.id)}
                  className="font-mono text-[10px] font-extrabold uppercase tracking-wider bg-carbon-hover hover:bg-carbon-border text-carbon-text border border-carbon-border px-3 py-1.5 rounded-sm"
                >
                  ✓ Done
                </button>
                <span className="font-mono text-[10px] text-carbon-muted hidden sm:inline">
                  session {session} · focus {totalFocusMin}m
                </span>
              </div>
            </div>

            <div className="relative w-28 h-28 shrink-0 mx-auto sm:mx-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={ringR} stroke="#1c1c22" strokeWidth="6" fill="none" />
                <circle
                  cx="50" cy="50" r={ringR} stroke="#ff3b00" strokeWidth="6" fill="none"
                  strokeLinecap="square" strokeDasharray={ringC} strokeDashoffset={ringC * (1 - frac)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-lg font-bold text-white">{mmss(Math.round(left / 1000))}</span>
                <span className="font-mono text-[8px] uppercase tracking-widest text-carbon-faint">
                  {running ? 'FOCUS' : 'IDLE'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}