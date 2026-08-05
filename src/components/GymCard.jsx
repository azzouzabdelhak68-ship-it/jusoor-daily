import React, { useState } from 'react';
import { Card, SectionTitle, ProgressBar } from './ui.jsx';

export default function GymCard({ day, split, prs, onToggleGym, onAddPr, onEditSplit }) {
  const [checked, setChecked] = useState({});
  const [pr, setPr] = useState({});

  if (!day) return null;
  const gymType = day.gym_type || '';
  const splitDay = (split?.days || []).find((d) => d.label === gymType);
  const isRest = gymType === 'Rest' || splitDay?.rest || (!splitDay && !gymType);

  const bestFor = (name) =>
    (prs || []).filter((p) => p.exercise_name === name).reduce((m, p) => Math.max(m, Number(p.weight) || 0), 0);

  const exercises = splitDay?.exercises || [];
  const doneCount = Object.values(checked).filter(Boolean).length;
  const exPct = exercises.length ? Math.round((doneCount / exercises.length) * 100) : 0;

  const logPr = (ex, i) => {
    const w = parseFloat(pr[i]?.weight);
    const r = parseInt(pr[i]?.reps, 10);
    if (Number.isNaN(w)) return;
    onAddPr({ exercise_name: ex.name, weight: w, reps: Number.isNaN(r) ? 1 : r });
    setPr((p) => ({ ...p, [i]: { weight: '', reps: '' } }));
  };

  if (isRest) {
    return (
      <Card className="p-5 rounded-sm">
        <SectionTitle icon="💤" title="GYM ROTATION // REST" />
        <div className="rounded-sm bg-[#0a0a0c] border border-carbon-border p-6 text-center">
          <p className="text-4xl mb-2">🧘</p>
          <p className="font-display font-extrabold tracking-tight">RECOVERY DAY</p>
          <p className="text-xs text-carbon-muted mt-1">Let the body rebuild — light walk or mobility work only.</p>
          <div className="flex justify-center gap-2 mt-4">
            <button className="font-mono text-[10px] font-extrabold uppercase tracking-wider bg-carbon-hover hover:bg-carbon-border text-carbon-text border border-carbon-border px-3 py-1.5 rounded-sm" onClick={onEditSplit}>
              Edit Split
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 rounded-sm">
      <SectionTitle
        icon="💪"
        title={`GYM // ${gymType || '?'}`}
        right={
          <button className="font-mono text-[10px] font-bold uppercase tracking-wider text-blaze hover:text-blaze-hover" onClick={onEditSplit}>
            Edit split ✎
          </button>
        }
      />

      {day.gym_done ? (
        <div className="rounded-sm bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
          <p className="text-2xl">🏆</p>
          <p className="font-bold text-emerald2 mt-1">Workout logged — nice work!</p>
          <button className="btn-ghost mt-3 text-[10px]" onClick={() => onToggleGym()}>Undo</button>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {exercises.map((ex, i) => {
              const done = !!checked[i];
              const best = bestFor(ex.name);
              return (
                <div key={`${ex.name}-${i}`} className={`rounded-sm border px-3 py-2 ${done ? 'bg-blaze/10 border-blaze/30' : 'bg-[#0a0a0c] border-carbon-border'}`}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
                      className={`w-5 h-5 rounded-sm border flex items-center justify-center text-xs shrink-0 ${done ? 'bg-blaze border-blaze text-black font-black' : 'border-carbon-border'}`}
                    >
                      {done ? '✓' : ''}
                    </button>
                    <span className="text-base">{ex.icon || '🏋️'}</span>
                    <span className={`flex-1 text-sm truncate ${done ? 'line-through text-carbon-muted' : 'text-carbon-text'}`}>{ex.name}</span>
                    <span className="text-[10px] font-mono text-carbon-faint hidden sm:inline">{ex.equipment}</span>
                    <span className="text-[11px] font-mono text-carbon-muted">{ex.sets}×{ex.reps}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 ml-9">
                    <span className="font-mono text-[10px] text-carbon-faint w-28 shrink-0 uppercase">Best PR: {best > 0 ? `${best} kg` : '—'}</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="kg today"
                      value={pr[i]?.weight || ''}
                      onChange={(e) => setPr((p) => ({ ...p, [i]: { ...p[i], weight: e.target.value } }))}
                      className="w-20 bg-carbon-panel border border-carbon-border rounded-sm px-2 py-1 font-mono text-xs text-carbon-text focus:outline-none focus:border-blaze/60 placeholder:text-carbon-faint"
                    />
                    <button
                      onClick={() => logPr(ex, i)}
                      className="font-mono text-[10px] font-extrabold uppercase tracking-wider bg-blaze/15 hover:bg-blaze/25 text-blaze border border-blaze/30 px-2 py-1 rounded-sm"
                    >
                      PR
                    </button>
                  </div>
                </div>
              );
            })}
            {!exercises.length && (
              <p className="text-xs text-carbon-faint text-center py-2">No exercises in this split day yet — edit the split to add some.</p>
            )}
          </div>

          {exercises.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-[11px] font-mono text-carbon-muted mb-1">
                <span>{doneCount}/{exercises.length} exercises</span>
                <span>{exPct}%</span>
              </div>
              <ProgressBar value={exPct} color="bg-blaze" />
            </div>
          )}

          <div className="flex gap-2">
            <button className="btn-primary flex-1 text-[10px]" onClick={() => onToggleGym()}>
              ✓ Log workout
            </button>
            <button className="btn-ghost text-[10px]" onClick={onEditSplit}>Edit</button>
          </div>
        </>
      )}

      <p className="font-mono text-[10px] text-carbon-faint mt-3">
        Rotation follows your active split (rest days included).
      </p>
    </Card>
  );
}