import React, { useState } from 'react';
import { Card, SectionTitle, ProgressBar } from './ui.jsx';
import { nextType, TYPE_COLORS, TYPE_ICON } from '../lib/gym.js';

export default function GymCard({ day, plans, onToggleGym, onCardio, onEditPlan }) {
  const [checked, setChecked] = useState({});
  const [cardio, setCardio] = useState('');

  if (!day) return null;
  const gymType = day.gym_type || 'Push';
  const plan = (plans || []).find((p) => p.type === gymType);
  const exercises = plan?.exercises || [];
  const doneCount = Object.values(checked).filter(Boolean).length;
  const exPct = exercises.length ? Math.round((doneCount / exercises.length) * 100) : 0;

  const submitCardio = (e) => {
    e.preventDefault();
    const v = parseInt(cardio, 10);
    if (Number.isNaN(v) || v < 0) return;
    onCardio(v);
    setCardio('');
  };

  return (
    <Card className="p-5 rounded-sm">
      <SectionTitle
        icon="💪"
        title={`GYM ROTATION // ${gymType}`}
        right={
          <span className={`badge border`} style={{ color: TYPE_COLORS[gymType], borderColor: `${TYPE_COLORS[gymType]}55`, background: `${TYPE_COLORS[gymType]}18` }}>
            {TYPE_ICON[gymType]} {gymType}
          </span>
        }
      />

      {day.gym_done ? (
        <div className="rounded-sm bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
          <p className="text-2xl">🏆</p>
          <p className="font-bold text-emerald2 mt-1">Workout logged — nice work!</p>
          {day.cardio_min > 0 && <p className="text-xs text-carbon-muted mt-1">+ {day.cardio_min} min cardio</p>}
          <button className="btn-ghost mt-3" onClick={() => onToggleGym()}>Undo</button>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {exercises.map((ex, i) => (
              <button
                key={i}
                onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
                className={`w-full flex items-center gap-3 rounded-sm border px-3 py-2 text-left transition-colors ${
                  checked[i] ? 'bg-blaze/10 border-blaze/30' : 'bg-carbon-panel border-carbon-border hover:bg-carbon-hover'
                }`}
              >
                <span className={`w-5 h-5 rounded-sm border flex items-center justify-center text-xs shrink-0 ${checked[i] ? 'bg-blaze border-blaze text-white' : 'border-carbon-border'}`}>
                  {checked[i] ? '✓' : ''}
                </span>
                <span className={`flex-1 text-sm ${checked[i] ? 'line-through text-carbon-muted' : 'text-carbon-text'}`}>{ex.name}</span>
                <span className="text-[11px] font-mono text-carbon-muted">
                  {ex.sets}×{ex.reps}
                  {ex.weight ? ` · ${ex.weight}kg` : ''}
                </span>
              </button>
            ))}
            {!exercises.length && <p className="text-xs text-carbon-faint text-center py-2">No exercises saved yet.</p>}
          </div>

          {exercises.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-[11px] text-carbon-muted mb-1">
                <span>{doneCount}/{exercises.length} exercises</span>
                <span>{exPct}%</span>
              </div>
              <ProgressBar value={exPct} color="bg-blaze" />
            </div>
          )}

          <form onSubmit={submitCardio} className="flex gap-2 mb-4">
            <input
              type="number"
              min="0"
              placeholder="Cardio minutes (optional)"
              value={cardio}
              onChange={(e) => setCardio(e.target.value)}
              className="input"
            />
            <button type="submit" className="btn-ghost shrink-0">+</button>
          </form>

          <div className="flex gap-2">
            <button className="btn-primary flex-1" onClick={() => onToggleGym()}>
              ✓ Log workout
            </button>
            <button className="btn-ghost" onClick={() => onEditPlan(plan)}>
              Edit
            </button>
          </div>
        </>
      )}

      <p className="text-[11px] text-carbon-muted mt-3 flex items-center gap-2">
        <span>Next:</span>
        <span className="badge bg-carbon-hover text-carbon-muted">{nextType(gymType)}</span>
        <span className="badge bg-carbon-hover text-carbon-muted">{nextType(nextType(gymType))}</span>
      </p>
    </Card>
  );
}
