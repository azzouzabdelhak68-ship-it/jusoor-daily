import React, { useState, useEffect, useMemo } from 'react';
import { Card, SectionTitle } from './ui.jsx';
import { api } from '../lib/api.js';

const MUSCLES = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Cardio', 'Full Body'];
const DEFAULTS = { sets: 3, reps: 10 };

function ExerciseLibrary({ library, onPick }) {
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState('');
  const filtered = useMemo(() => {
    return (library || []).filter((e) => {
      if (muscle && e.muscle !== muscle) return false;
      if (q && !e.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [library, q, muscle]);

  return (
    <div className="rounded-sm bg-[#0a0a0c] border border-carbon-border p-3">
      <div className="flex gap-2 mb-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search exercises…"
          className="flex-1 bg-carbon-panel border border-carbon-border rounded-sm px-3 py-1.5 font-mono text-xs text-carbon-text focus:outline-none focus:border-blaze/60 placeholder:text-carbon-faint"
        />
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        <button onClick={() => setMuscle('')} className={`font-mono text-[9px] uppercase px-2 py-0.5 rounded-sm border ${!muscle ? 'bg-blaze/20 border-blaze/40 text-blaze' : 'border-carbon-border text-carbon-muted hover:text-carbon-text'}`}>All</button>
        {MUSCLES.map((m) => (
          <button key={m} onClick={() => setMuscle(m)} className={`font-mono text-[9px] uppercase px-2 py-0.5 rounded-sm border ${muscle === m ? 'bg-blaze/20 border-blaze/40 text-blaze' : 'border-carbon-border text-carbon-muted hover:text-carbon-text'}`}>{m}</button>
        ))}
      </div>
      <div className="max-h-56 overflow-y-auto space-y-1">
        {filtered.map((e) => (
          <button
            key={e.id}
            onClick={() => onPick(e)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-left border border-transparent hover:border-blaze/40 hover:bg-carbon-panel transition-colors"
          >
            <span>{e.icon}</span>
            <span className="text-xs flex-1 truncate">{e.name}</span>
            <span className="font-mono text-[9px] text-carbon-faint uppercase">{e.muscle}</span>
          </button>
        ))}
        {!filtered.length && <p className="text-[11px] text-carbon-faint text-center py-3">No matches.</p>}
      </div>
    </div>
  );
}

export default function WorkoutSplitView({ splits, prs, onSaveSplit, onDeleteSplit, online }) {
  const [library, setLibrary] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [days, setDays] = useState([]);
  const [pickerFor, setPickerFor] = useState(null);
  const [forecastN, setForecastN] = useState(14);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    api.fetchJson('/exercises.json').then(setLibrary).catch(() => setLibrary([]));
  }, []);

  const active = (splits || []).find((s) => s.is_active);
  const editing = splits.find((s) => s.id === editingId);

  const selectSplit = (id) => {
    const s = splits.find((x) => x.id === id);
    setEditingId(id);
    setName(s.name);
    setDays(JSON.parse(JSON.stringify(s.days || [])));
    setPickerFor(null);
  };

  const newSplit = () => {
    setEditingId(null);
    setName('My Split');
    setDays([{ label: 'Push', rest: false, exercises: [] }, { label: 'Rest', rest: true, exercises: [] }]);
  };

  const save = async () => {
    const isActive = editingId ? (editing?.is_active ?? false) : !(splits || []).some((s) => s.is_active);
    const cleaned = days.map((d) => ({ label: d.label, rest: !!d.rest, exercises: d.rest ? [] : d.exercises }));
    const saved = await onSaveSplit(editingId ? { id: editingId, name, days: cleaned, is_active: isActive } : { name, days: cleaned, is_active: isActive });
    selectSplit(saved?.id || editingId || saved.id);
  };

  const updateDay = (i, patch) => setDays((d) => d.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i, dir) => setDays((d) => {
    const j = i + dir;
    if (j < 0 || j >= d.length) return d;
    const copy = [...d];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return copy;
  });
  const addDay = () => setDays((d) => [...d, { label: `Day ${d.length + 1}`, rest: false, exercises: [] }]);
  const removeDay = (i) => setDays((d) => d.filter((_, j) => j !== i));

  const addExercise = (e) => {
    if (pickerFor == null) return;
    updateDay(pickerFor, { exercises: [...days[pickerFor].exercises, { name: e.name, muscle: e.muscle, equipment: e.equipment, icon: e.icon, sets: DEFAULTS.sets, reps: DEFAULTS.reps }] });
    setPickerFor(null);
  };
  const updEx = (di, ei, key, val) => updateDay(di, { exercises: days[di].exercises.map((x, k) => (k === ei ? { ...x, [key]: val } : x)) });
  const removeEx = (di, ei) => updateDay(di, { exercises: days[di].exercises.filter((_, k) => k !== ei) });

  const bestFor = (name) => (prs || []).filter((p) => p.exercise_name === name).reduce((m, p) => Math.max(m, Number(p.weight) || 0), 0);

  const runForecast = async () => {
    const f = await api.forecastSplit(forecastN);
    setForecast(f || []);
  };

  const downloadJson = (file, fallback) => {
    const blob = new Blob([JSON.stringify(fallback, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Card className="p-5 rounded-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <SectionTitle icon="🏋️" title="SPLIT BUILDER" />
          <div className="flex gap-2">
            <button onClick={downloadJson('exercises.json', library)} disabled={!library.length} className="btn-ghost text-[10px]">⬇ exercises.json</button>
            <button onClick={newSplit} className="btn-ghost text-[10px]">+ New split</button>
            <button onClick={save} className="btn-primary text-[10px]">💾 Save split</button>
          </div>
        </div>

        {/* Split selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(splits || []).map((s) => (
            <button
              key={s.id}
              onClick={() => selectSplit(s.id)}
              className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-sm border ${editingId === s.id ? 'bg-blaze/20 border-blaze/50 text-blaze font-extrabold' : 'border-carbon-border text-carbon-muted hover:text-carbon-text'}`}
            >
              {s.name} {s.is_active ? '⚡' : ''}
            </button>
          ))}
          {!(splits || []).length && <p className="text-xs text-carbon-faint">No splits yet — create one.</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Days editor */}
          <div>
            <p className="label mb-2">DAYS (ORDER = CYCLE)</p>
            <div className="space-y-2">
              {days.map((d, i) => (
                <div key={i} className={`rounded-sm border p-3 ${d.rest ? 'border-carbon-border bg-carbon-panel/40' : 'border-carbon-border bg-[#0a0a0c]'}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-carbon-faint">{String(i + 1).padStart(2, '0')}</span>
                    <input
                      value={d.label}
                      onChange={(e) => updateDay(i, { label: e.target.value })}
                      className="flex-1 bg-transparent font-display font-bold text-sm text-carbon-text outline-none border-b border-dashed border-carbon-border focus:border-blaze"
                    />
                    <label className="flex items-center gap-1 font-mono text-[9px] uppercase text-carbon-muted cursor-pointer">
                      <input type="checkbox" checked={!!d.rest} onChange={(e) => updateDay(i, { rest: e.target.checked, exercises: e.target.checked ? [] : d.exercises })} className="accent-[#ff3b00]" />
                      Rest
                    </label>
                    <button onClick={() => move(i, -1)} className="text-carbon-faint hover:text-carbon-text text-xs" title="Move up">▲</button>
                    <button onClick={() => move(i, 1)} className="text-carbon-faint hover:text-carbon-text text-xs" title="Move down">▼</button>
                    <button onClick={() => removeDay(i)} className="text-carbon-faint hover:text-blaze text-xs" title="Delete">✕</button>
                  </div>

                  {!d.rest && (
                    <div className="mt-2 space-y-1">
                      {d.exercises.map((ex, ei) => (
                        <div key={ei} className="flex items-center gap-2 pl-5">
                          <span>{ex.icon}</span>
                          <span className="text-xs flex-1 truncate">{ex.name}</span>
                          <input type="number" value={ex.sets} onChange={(e) => updEx(i, ei, 'sets', e.target.value)} className="w-10 bg-carbon-panel border border-carbon-border rounded-sm px-1 py-0.5 font-mono text-[10px] text-carbon-text text-center focus:outline-none" />
                          <span className="text-[10px] text-carbon-faint">×</span>
                          <input type="number" value={ex.reps} onChange={(e) => updEx(i, ei, 'reps', e.target.value)} className="w-10 bg-carbon-panel border border-carbon-border rounded-sm px-1 py-0.5 font-mono text-[10px] text-carbon-text text-center focus:outline-none" />
                          <span className="font-mono text-[9px] text-emerald2 hidden sm:inline">best {bestFor(ex.name) || '—'}</span>
                          <button onClick={() => removeEx(i, ei)} className="text-carbon-faint hover:text-blaze text-[10px]">✕</button>
                        </div>
                      ))}
                      <button onClick={() => setPickerFor(pickerFor === i ? null : i)} className="font-mono text-[10px] uppercase tracking-wider text-blaze hover:text-blaze-hover pl-5">
                        {pickerFor === i ? '− Close library' : '+ Add exercise'}
                      </button>
                      {pickerFor === i && <ExerciseLibrary library={library} onPick={addExercise} />}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addDay} className="mt-3 w-full font-mono text-[10px] font-extrabold uppercase tracking-wider border border-dashed border-carbon-border text-carbon-muted hover:text-carbon-text hover:border-blaze/50 py-2 rounded-sm">+ Add day to cycle</button>
          </div>

          {/* Right column: extend + PR board */}
          <div className="space-y-4">
            <div>
              <p className="label mb-2">AUTO-EXTEND SCHEDULE</p>
              <div className="flex gap-2 mb-2">
                <select value={forecastN} onChange={(e) => setForecastN(Number(e.target.value))} className="bg-carbon-panel border border-carbon-border rounded-sm px-2 py-1.5 font-mono text-xs text-carbon-text focus:outline-none">
                  {[7, 14, 30, 60, 90].map((n) => <option key={n} value={n}>{n} days</option>)}
                </select>
                <button onClick={runForecast} className="btn-primary text-[10px]">⟳ Preview pattern</button>
              </div>
              {forecast.length > 0 && (
                <div className="rounded-sm bg-[#0a0a0c] border border-carbon-border p-2 max-h-56 overflow-y-auto">
                  {forecast.map((f) => (
                    <div key={f.date} className="flex items-center gap-2 py-1 border-b border-carbon-border/40 last:border-0">
                      <span className="font-mono text-[10px] text-carbon-faint w-20">{f.date.slice(5)}</span>
                      <span className={`font-mono text-[10px] font-bold uppercase ${f.rest ? 'text-carbon-muted' : 'text-blaze'}`}>
                        {f.rest ? '▩ REST' : `💪 ${f.label}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="label mb-2">PR BOARD</p>
              <div className="rounded-sm bg-[#0a0a0c] border border-carbon-border p-2 max-h-56 overflow-y-auto">
                {(prs || []).slice(0, 40).map((p) => (
                  <div key={p.id} className="flex items-center gap-2 py-1 border-b border-carbon-border/40 last:border-0">
                    <span className="font-mono text-[10px] text-carbon-faint w-20">{String(p.date).slice(5)}</span>
                    <span className="text-[11px] flex-1 truncate">{p.exercise_name}</span>
                    <span className="font-mono text-[10px] text-blaze font-bold">{p.weight}kg ×{p.reps}</span>
                  </div>
                ))}
                {!(prs || []).length && <p className="text-[11px] text-carbon-faint text-center py-3">No PRs logged yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}