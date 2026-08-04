import React from 'react';
import { Card, SectionTitle } from './ui.jsx';
import { addDaysISO, todayStr } from '../lib/time.js';

function streakFor(habitId, log, today) {
  const days = new Set(log.filter((h) => h.habit_id === habitId).map((h) => h.date));
  let streak = 0;
  let d = today;
  if (!days.has(d)) d = addDaysISO(d, -1); // allow "current streak" even if not done today yet
  while (days.has(d)) {
    streak++;
    d = addDaysISO(d, -1);
  }
  return streak;
}

export default function HabitsCard({ habits, habitLog, today, onToggle }) {
  const doneSet = new Set(habitLog.filter((h) => h.date === today).map((h) => h.habit_id));

  return (
    <Card className="p-5 rounded-sm">
      <SectionTitle icon="🔥" title="HABITS & STREAKS" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(habits || []).map((h) => {
          const done = doneSet.has(h.id);
          const streak = streakFor(h.id, habitLog || [], today);
          return (
            <button
              key={h.id}
              onClick={() => onToggle(h.id)}
              className={`flex items-center gap-3 rounded-sm border px-3 py-2.5 text-left transition-all ${
                done
                  ? 'bg-blaze/10 border-blaze/30'
                  : 'bg-carbon-panel border-carbon-border hover:bg-carbon-hover'
              }`}
            >
              <span className="text-lg">{h.icon}</span>
              <span className="flex-1 min-w-0">
                <span className={`block text-sm truncate ${done ? 'line-through text-carbon-muted' : 'text-carbon-text'}`}>{h.name}</span>
                <span className="text-[10px] text-carbon-muted">🔥 {streak} day streak</span>
              </span>
              <span
                className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs shrink-0 ${
                  done ? 'bg-blaze border-blaze text-white' : 'border-carbon-border'
                }`}
              >
                {done ? '✓' : ''}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
