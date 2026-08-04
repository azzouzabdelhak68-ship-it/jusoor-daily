import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { Card, SectionTitle } from './ui.jsx';

export default function StatsPanel({ days, tasksToday }) {
  const last7 = (days || []).slice(-7).map((d) => {
    const pages = d.quran_end != null && d.quran_start != null ? d.quran_end - d.quran_start + 1 : 0;
    return {
      date: d.date.slice(5),
      pages,
      book: d.book_pages || 0,
      steps: d.steps || 0,
      cardio: d.cardio_min || 0,
      mood: d.mood || 0,
      gym: d.gym_done ? 1 : 0,
    };
  });

  const tooltipStyle = {
    background: '#161616',
    border: '1px solid #262626',
    borderRadius: 12,
    fontSize: 12,
    color: '#f5f5f5',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-5">
        <SectionTitle icon="📈" title="Quran pages — last 7 days" />
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#6b6b6b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b6b6b', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(239,68,68,0.06)' }} />
              <Bar dataKey="pages" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle icon="🏃" title="Cardio & book pages" />
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#6b6b6b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b6b6b', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(239,68,68,0.06)' }} />
              <Bar dataKey="cardio" name="Cardio (min)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              <Bar dataKey="book" name="Book pages" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle icon="😀" title="Mood — last 7 days" />
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#6b6b6b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: '#6b6b6b', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="mood" stroke="#fbbf24" strokeWidth={2} dot={{ fill: '#fbbf24', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle icon="⚡" title="Today's task health" />
        <div className="space-y-3 pt-1">
          {['High', 'Medium', 'Low'].map((p) => {
            const all = (tasksToday || []).filter((t) => (t.priority || 'Medium') === p);
            const d = all.filter((t) => t.status === 'done').length;
            return (
              <div key={p}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-carbon-muted">{p}</span>
                  <span className="font-mono">{d}/{all.length}</span>
                </div>
                <div className="h-2 rounded-full bg-carbon-hover overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blaze transition-all duration-500"
                    style={{ width: `${all.length ? (d / all.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
          <div className="pt-2 text-center text-xs text-carbon-muted">
            {(() => {
              const total = (tasksToday || []).length;
              const done = (tasksToday || []).filter((t) => t.status === 'done').length;
              return `Today: ${done}/${total} tasks completed ${total ? Math.round((done / total) * 100) : 0}%`;
            })()}
          </div>
        </div>
      </Card>
    </div>
  );
}
