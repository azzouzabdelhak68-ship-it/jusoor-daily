import React, { useState } from 'react';
import { Card, SectionTitle } from './ui.jsx';
import { minutesOf, fmtDuration } from '../lib/time.js';

export default function SleepCard({ day, onSave }) {
  const [wake, setWake] = useState('');
  const [bed, setBed] = useState('');
  if (!day) return null;

  const wakeM = minutesOf(day.wake_time);
  const sleepM = minutesOf(day.sleep_time);
  let dur = null;
  if (wakeM !== null && sleepM !== null) {
    dur = ((sleepM - wakeM) % 1440 + 1440) % 1440;
  }
  const hours = dur ? dur / 60 : 0;
  const battery = Math.max(0, Math.min(100, Math.round(((hours - 4.5) / 4) * 100)));

  const batteryWarn = battery < 55;
  const batteryColor = batteryWarn ? 'bg-gold' : 'bg-emerald2';

  return (
    <Card className="p-5 rounded-sm">
      <SectionTitle
        icon="😴"
        title="SLEEP ENGINE"
        right={
          <span className={`font-mono text-xs font-bold uppercase ${batteryWarn ? 'text-gold' : 'text-emerald2'}`}>
            ⚡ {battery}%
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-sm bg-[#0a0a0c] border border-carbon-border p-3">
          <p className="label text-blaze-bright">Wake (Fajr −10m)</p>
          <div className="flex items-center gap-1 mt-1">
            <input
              type="time"
              value={wake || day.wake_time || ''}
              onChange={(e) => setWake(e.target.value)}
              onBlur={(e) => e.target.value && onSave({ wake_time: e.target.value })}
              className="w-full bg-transparent font-mono text-lg font-black text-carbon-text outline-none"
            />
          </div>
        </div>
        <div className="rounded-sm bg-[#0a0a0c] border border-carbon-border p-3">
          <p className="label text-violet2">Sleep (Isha +1h30)</p>
          <div className="flex items-center gap-1 mt-1">
            <input
              type="time"
              value={bed || day.sleep_time || ''}
              onChange={(e) => setBed(e.target.value)}
              onBlur={(e) => e.target.value && onSave({ sleep_time: e.target.value })}
              className="w-full bg-transparent font-mono text-lg font-black text-carbon-text outline-none"
            />
          </div>
        </div>
      </div>

      {dur !== null && (
        <p className="font-mono text-[10px] text-carbon-muted mb-2">
          Target duration: <span className="font-bold text-carbon-text">{fmtDuration(dur)}</span>
        </p>
      )}

      <div className="w-full h-2 bg-carbon-hover border border-carbon-border overflow-hidden mb-1">
        <div
          className={`h-full ${batteryColor} transition-all`}
          style={{ width: `${battery}%` }}
        />
      </div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-carbon-faint flex justify-between">
        <span>{batteryWarn ? 'LOW BATTERY — LIGHT WORKOUT ADVISED' : 'BATTERY CHARGED'}</span>
        <span>{dur ? fmtDuration(dur) : '—'}</span>
      </div>
    </Card>
  );
}