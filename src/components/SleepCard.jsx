import React, { useState } from 'react';
import { Card, SectionTitle } from './ui.jsx';
import { minutesOf, fmtDuration } from '../lib/time.js';

export default function SleepCard({ day, onSave }) {
  const [fields, setFields] = useState({});
  if (!day) return null;

  const wakeM = minutesOf(day.wake_time);
  const sleepM = minutesOf(day.sleep_time);
  let dur = null;
  if (wakeM !== null && sleepM !== null) {
    dur = ((sleepM - wakeM) % 1440 + 1440) % 1440;
  }

  const commit = (key, value) => {
    if (value === '' || value === null) return;
    onSave({ [key]: value });
    setFields({});
  };

  const quick = [
    { key: 'weight', label: 'Weight (kg)', type: 'number', step: '0.1', value: day.weight },
    { key: 'steps', label: 'Steps', type: 'number', value: day.steps },
    { key: 'calories', label: 'Calories', type: 'number', value: day.calories },
  ];

  return (
    <Card className="p-5">
      <SectionTitle icon="😴" title="Sleep & Body" />

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-xl bg-carbon-panel border border-carbon-border p-3 text-center">
          <p className="label text-blaze-bright">Wake</p>
          <p className="mt-1 font-mono text-2xl font-black text-carbon-text">{day.wake_time || '—'}</p>
          <p className="text-[10px] text-carbon-faint mt-1">Fajr − 10 min</p>
        </div>
        <div className="rounded-xl bg-carbon-panel border border-carbon-border p-3 text-center">
          <p className="label text-violet2">Sleep</p>
          <p className="mt-1 font-mono text-2xl font-black text-carbon-text">{day.sleep_time || '—'}</p>
          <p className="text-[10px] text-carbon-faint mt-1">Isha + 1h30</p>
        </div>
      </div>

      {dur !== null && (
        <p className="text-center text-xs text-carbon-muted mb-4">
          Target duration: <span className="font-mono font-bold text-carbon-text">{fmtDuration(dur)}</span>
        </p>
      )}

      <div className="space-y-2">
        {quick.map((q) => (
          <div key={q.key} className="flex items-center gap-2">
            <input
              type={q.type}
              step={q.step}
              placeholder={`${q.label}${q.value != null ? ` (${q.value})` : ''}`}
              value={fields[q.key] ?? ''}
              onChange={(e) => setFields((f) => ({ ...f, [q.key]: e.target.value }))}
              className="input"
            />
            <button
              className="btn-ghost shrink-0 text-xs"
              onClick={() => commit(q.key, fields[q.key])}
            >
              Save
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <p className="label mb-1.5">Mood</p>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((m) => (
            <button
              key={m}
              onClick={() => onSave({ mood: m })}
              className={`flex-1 py-1.5 rounded-lg text-sm transition-all ${
                day.mood === m
                  ? 'bg-blaze/20 border border-blaze/40'
                  : 'bg-carbon-panel border border-carbon-border hover:bg-carbon-hover'
              }`}
            >
              {['😞', '🙁', '😐', '🙂', '😄'][m - 1]}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
