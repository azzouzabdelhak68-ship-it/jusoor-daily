import React, { useState } from 'react';
import { Card } from './ui.jsx';

export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} p-6 relative max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-carbon-muted hover:text-carbon-text text-xl leading-none">×</button>
        </div>
        {children}
      </Card>
    </div>
  );
}

export function TaskModal({ initial, date, onSave, onClose }) {
  const [f, setF] = useState({
    title: initial?.title || '',
    project: initial?.project || 'Jusoor',
    start_time: initial?.start_time || '',
    end_time: initial?.end_time || '',
    priority: initial?.priority || 'Medium',
    reminder_before: initial?.reminder_before || 0,
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <Modal title={initial ? 'Edit task' : 'New task'} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!f.title.trim()) return;
          onSave(f);
        }}
        className="space-y-3"
      >
        <input className="input" placeholder="Task title" value={f.title} onChange={set('title')} autoFocus />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label block mb-1">Project</label>
            <select className="input" value={f.project} onChange={set('project')}>
              <option>Jusoor</option>
              <option>Routine</option>
              <option>Quran</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="label block mb-1">Priority</label>
            <select className="input" value={f.priority} onChange={set('priority')}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div>
            <label className="label block mb-1">Start</label>
            <input type="time" className="input" value={f.start_time} onChange={set('start_time')} />
          </div>
          <div>
            <label className="label block mb-1">End</label>
            <input type="time" className="input" value={f.end_time} onChange={set('end_time')} />
          </div>
        </div>
        <div>
          <label className="label block mb-1">Remind (minutes before start)</label>
          <select className="input" value={f.reminder_before} onChange={set('reminder_before')}>
            <option value={0}>At start</option>
            <option value={5}>5 min before</option>
            <option value={15}>15 min before</option>
            <option value={30}>30 min before</option>
            <option value={60}>1 hour before</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}

export function BookModal({ initial, onSave, onClose }) {
  const [f, setF] = useState({
    title: initial?.title || '',
    author: initial?.author || '',
    total_pages: initial?.total_pages || '',
    current_page: initial?.current_page || '',
    daily_target: initial?.daily_target || 15,
    status: initial?.status || 'To Read',
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <Modal title={initial ? 'Edit book' : 'Add book'} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!f.title.trim()) return;
          onSave({
            ...f,
            total_pages: Number(f.total_pages) || 0,
            current_page: Number(f.current_page) || 0,
            daily_target: Number(f.daily_target) || 15,
          });
        }}
        className="space-y-3"
      >
        <input className="input" placeholder="Title" value={f.title} onChange={set('title')} autoFocus />
        <input className="input" placeholder="Author" value={f.author} onChange={set('author')} />
        <div className="grid grid-cols-3 gap-3">
          <input type="number" className="input" placeholder="Pages" value={f.total_pages} onChange={set('total_pages')} />
          <input type="number" className="input" placeholder="Current" value={f.current_page} onChange={set('current_page')} />
          <input type="number" className="input" placeholder="Day target" value={f.daily_target} onChange={set('daily_target')} />
        </div>
        <div>
          <label className="label block mb-1">Status</label>
          <select className="input" value={f.status} onChange={set('status')}>
            <option>To Read</option>
            <option>Reading</option>
            <option>Done</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}

export function WorkoutModal({ initial, onSave, onClose }) {
  const [type, setType] = useState(initial?.type || 'Push');
  const [name, setName] = useState(initial?.name || '');
  const [duration, setDuration] = useState(initial?.duration_min || 60);
  const [exs, setExs] = useState(initial?.exercises || [{ name: '', sets: 3, reps: 10, weight: '' }]);

  const updateEx = (i, patch) => setExs(exs.map((e, j) => (j === i ? { ...e, ...patch } : e)));

  return (
    <Modal title={`${type} plan`} onClose={onClose} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            type,
            name: name || `${type} Day`,
            duration_min: Number(duration) || 60,
            exercises: exs.filter((x) => x.name.trim()).map((x) => ({
              ...x,
              sets: Number(x.sets) || 0,
              reps: Number(x.reps) || 0,
              weight: x.weight === '' ? null : Number(x.weight),
            })),
          });
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label block mb-1">Type</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              {['Push', 'Pull', 'Legs', 'Cardio'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <input className="input" placeholder="Plan name" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="number" className="input" placeholder="Duration min" value={duration} onChange={(e) => setDuration(e.target.value)} />
        </div>

        <div className="space-y-2">
          <p className="label">Exercises</p>
          {exs.map((ex, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="input flex-1" placeholder="Exercise name" value={ex.name} onChange={(e) => updateEx(i, { name: e.target.value })} />
              <input type="number" className="input w-16" placeholder="Sets" value={ex.sets} onChange={(e) => updateEx(i, { sets: e.target.value })} />
              <input type="number" className="input w-16" placeholder="Reps" value={ex.reps} onChange={(e) => updateEx(i, { reps: e.target.value })} />
              <input type="number" className="input w-20" placeholder="kg" value={ex.weight} onChange={(e) => updateEx(i, { weight: e.target.value })} />
              <button type="button" className="text-carbon-faint hover:text-blaze" onClick={() => setExs(exs.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
          <button type="button" className="btn-ghost text-xs" onClick={() => setExs([...exs, { name: '', sets: 3, reps: 10, weight: '' }])}>
            + Add exercise
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Save plan</button>
        </div>
      </form>
    </Modal>
  );
}
