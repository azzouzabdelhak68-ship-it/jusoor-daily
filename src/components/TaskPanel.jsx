import React from 'react';
import { Card, SectionTitle, Empty } from './ui.jsx';

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

export default function TaskPanel({ today, tomorrow, tasksToday, tasksTomorrow, onAdd, onToggle, onEdit, onDelete }) {
  const sortTasks = (list) =>
    [...(list || [])].sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority || 'Medium'] ?? 2;
      const pb = PRIORITY_ORDER[b.priority || 'Medium'] ?? 2;
      if (pa !== pb) return pa - pb;
      return (a.start_time || '99').localeCompare(b.start_time || '99');
    });

  const renderList = (tasks) => {
    const sorted = sortTasks(tasks);
    if (!sorted.length) return <Empty text="No tasks. Add one below." />;
    return (
      <div className="space-y-1.5">
        {sorted.map((t) => (
          <div
            key={t.id}
            className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
              t.status === 'done' ? 'bg-carbon-panel border-carbon-border opacity-60' : 'bg-carbon-card border-carbon-border hover:bg-carbon-hover'
            }`}
          >
            <button
              onClick={() => onToggle(t.id, t.status === 'done' ? 'todo' : 'done')}
              className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs shrink-0 ${
                t.status === 'done' ? 'bg-emerald2 border-emerald2 text-black' : 'border-carbon-faint hover:border-blaze'
              }`}
            >
              {t.status === 'done' ? '✓' : ''}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${t.status === 'done' ? 'line-through text-carbon-muted' : 'text-carbon-text'}`}>{t.title}</p>
              <p className="text-[11px] text-carbon-faint">
                {t.project} · {t.start_time ? `${t.start_time}${t.end_time ? '–' + t.end_time : ''}` : 'no time'}
                {t.is_daily && ' · routine'}
              </p>
            </div>
            <span className={`badge ${t.priority === 'High' ? 'bg-blaze/15 text-blaze-bright' : t.priority === 'Medium' ? 'bg-gold/15 text-gold' : 'bg-carbon-hover text-carbon-muted'}`}>
              {t.priority}
            </span>
            <button onClick={() => onEdit(t)} className="text-carbon-faint hover:text-carbon-text text-xs opacity-0 group-hover:opacity-100">✎</button>
            <button onClick={() => onDelete(t.id)} className="text-carbon-faint hover:text-blaze text-xs opacity-0 group-hover:opacity-100">🗑</button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-5">
        <SectionTitle
          icon="📌"
          title={`Today · ${today}`}
          right={<button className="btn-primary !py-1 !px-3 !text-xs" onClick={() => onAdd({ date: today })}>+ Add</button>}
        />
        {renderList(tasksToday)}
      </Card>

      <Card className="p-5">
        <SectionTitle
          icon="📌"
          title={`Tomorrow · ${tomorrow}`}
          right={<button className="btn-ghost !py-1 !px-3 !text-xs" onClick={() => onAdd({ date: tomorrow })}>+ Add</button>}
        />
        {renderList(tasksTomorrow)}
      </Card>
    </div>
  );
}
