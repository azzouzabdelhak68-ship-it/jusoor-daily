import React from 'react';
import { Card, SectionTitle, ProgressBar } from './ui.jsx';
import { suggestedEnd } from '../lib/quran.js';

export default function ProgressBoard({ day, tasks }) {
  if (!day) return <Card className="p-5"><SectionTitle icon="📊" title="Today's Progress" /></Card>;

  const qStart = day.quran_start || 1;
  const qTarget = suggestedEnd(qStart) - qStart + 1;
  const qRead = day.quran_end != null ? Math.max(0, day.quran_end - qStart + 1) : 0;
  const qPct = Math.min(100, Math.round((qRead / qTarget) * 100));

  const bookPct = Math.min(100, Math.round(((day.book_pages || 0) / 15) * 100));

  const gymPct = day.gym_done ? 100 : 0;

  const total = (tasks || []).length || 1;
  const done = (tasks || []).filter((t) => t.status === 'done').length;
  const taskPct = Math.round((done / total) * 100);

  const rows = [
    { label: 'Quran', value: day.quran_end != null ? `${qRead}/${qTarget} pages` : `${qRead}/${qTarget} pages`, pct: qPct, color: 'bg-emerald2' },
    { label: 'Books', value: `${day.book_pages || 0}/15 pages`, pct: bookPct, color: 'bg-sky2' },
    { label: 'Gym', value: day.gym_done ? 'Done 💪' : 'Pending', pct: gymPct, color: 'bg-blaze' },
    { label: 'Tasks', value: `${done}/${tasks?.length || 0} done`, pct: taskPct, color: 'bg-violet2' },
  ];

  const overall = Math.round(
    rows.reduce((acc, r) => acc + r.pct, 0) / rows.length
  );

  return (
    <Card className="p-5">
      <SectionTitle
        icon="📊"
        title="Today's Progress"
        right={
          <span className="font-mono text-2xl font-black text-blaze-bright">{overall}%</span>
        }
      />
      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs font-semibold text-carbon-muted">{r.label}</span>
              <span className="text-xs font-mono text-carbon-text">{r.value}</span>
            </div>
            <ProgressBar value={r.pct} color={r.color} />
          </div>
        ))}
      </div>
    </Card>
  );
}
