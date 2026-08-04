// Frontend API layer.
// Uses Netlify Functions when reachable; falls back to a localStorage demo
// mode so the UI works instantly in `npm run dev` before you deploy.

import { todayStr, addDaysISO } from './time.js';

const LS_KEY = 'jusoor_daily_demo';
let mode = null; // 'server' | 'local'

async function serverRequest(path, opts = {}) {
  const res = await fetch(`/api/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`API ${path} ${res.status}`);
  return res.json();
}

// ---------- local demo store ----------
function readLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeLocal(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function seedDemo() {
  const today = todayStr();
  const tomorrow = addDaysISO(today, 1);
  const last = addDaysISO(today, -1);
  const last2 = addDaysISO(today, -2);
  const last3 = addDaysISO(today, -3);
  const mkDay = (date, { fajr = '04:17', maghrib = '19:41', isha = '21:10', qs, qe, gym, done = false }) => ({
    date,
    fajr,
    dhuhr: '12:47',
    asr: '16:32',
    maghrib,
    isha,
    wake_time: '04:07',
    sleep_time: '22:40',
    quran_start: qs,
    quran_end: qe,
    gym_type: gym,
    gym_done: done,
    cardio_min: done && gym === 'Cardio' ? 30 : 0,
    book_pages: 15,
    mood: 4,
    weight: null,
    steps: 8000,
    calories: null,
    notes: '',
  });
  const days = [
    mkDay(last3, { qs: 181, qe: 220, gym: 'Cardio', done: true }),
    mkDay(last2, { qs: 221, qe: 270, gym: 'Push', done: true }),
    mkDay(last, { qs: 271, qe: 320, gym: 'Pull', done: true }),
    mkDay(today, { qs: 321, gym: 'Legs' }),
    mkDay(tomorrow, { qs: 361, gym: 'Cardio' }),
  ];
  const tasksToday = [
    { id: 1, date: today, title: 'Wake up', project: 'Routine', start_time: '04:07', end_time: '04:17', priority: 'High', status: 'todo', is_daily: true },
    { id: 2, date: today, title: 'Fajr', project: 'Routine', start_time: '04:17', end_time: '04:27', priority: 'High', status: 'todo', is_daily: true },
    { id: 3, date: today, title: 'Jusoor — Deep Work', project: 'Jusoor', start_time: '08:00', end_time: '20:00', priority: 'High', status: 'todo', is_daily: true },
    { id: 4, date: today, title: 'Quran — pages 321–360', project: 'Quran', start_time: '19:41', end_time: '21:10', priority: 'Medium', status: 'todo', is_daily: true },
    { id: 5, date: today, title: 'Sleep — wind down', project: 'Routine', start_time: '22:40', end_time: '22:50', priority: 'Medium', status: 'todo', is_daily: true },
    { id: 6, date: today, title: 'Auth refactor', project: 'Jusoor', start_time: '09:30', end_time: '11:00', priority: 'High', status: 'todo', is_daily: false },
  ];
  const tasksTomorrow = tasksToday.map((t) => ({ ...t, id: t.id + 100, date: tomorrow }));
  const plans = [
    { id: 1, type: 'Push', name: 'Push Day', exercises: [{ name: 'Bench Press', sets: 4, reps: 8 }, { name: 'Overhead Press', sets: 4, reps: 8 }, { name: 'Lateral Raises', sets: 4, reps: 12 }, { name: 'Tricep Dips', sets: 3, reps: 12 }], duration_min: 75 },
    { id: 2, type: 'Pull', name: 'Pull Day', exercises: [{ name: 'Deadlift', sets: 4, reps: 6 }, { name: 'Barbell Row', sets: 4, reps: 8 }, { name: 'Pull-Ups', sets: 4, reps: 8 }, { name: 'Bicep Curls', sets: 3, reps: 12 }], duration_min: 75 },
    { id: 3, type: 'Legs', name: 'Legs Day', exercises: [{ name: 'Squats', sets: 4, reps: 8 }, { name: 'Romanian Deadlift', sets: 4, reps: 10 }, { name: 'Leg Press', sets: 3, reps: 12 }, { name: 'Calf Raises', sets: 4, reps: 15 }], duration_min: 75 },
    { id: 4, type: 'Cardio', name: 'Cardio', exercises: [{ name: 'Run / Treadmill', sets: 1, reps: 30 }, { name: 'Core Circuit', sets: 3, reps: 15 }], duration_min: 45 },
  ];
  const habits = [
    { id: 1, name: 'Fajr on time', icon: '🌅', color: '#f59e0b', sort: 1 },
    { id: 2, name: 'Quran pages', icon: '📖', color: '#22c55e', sort: 2 },
    { id: 3, name: 'Gym / workout', icon: '💪', color: '#ef4444', sort: 3 },
    { id: 4, name: 'Read book', icon: '📚', color: '#3b82f6', sort: 4 },
    { id: 5, name: 'Sleep early', icon: '😴', color: '#8b5cf6', sort: 5 },
    { id: 6, name: 'Water', icon: '💧', color: '#06b6d4', sort: 6 },
  ];
  const books = [
    { id: 1, title: 'Atomic Habits', author: 'James Clear', total_pages: 320, current_page: 118, status: 'Reading', daily_target: 15 },
    { id: 2, title: 'Deep Work', author: 'Cal Newport', total_pages: 296, current_page: 0, status: 'To Read', daily_target: 15 },
  ];
  return {
    today,
    tomorrow,
    todayRow: days.find((d) => d.date === today),
    tomorrowRow: days.find((d) => d.date === tomorrow),
    days,
    tasksToday,
    tasksTomorrow,
    books,
    plans,
    habits,
    habitLog: [
      { date: last, habit_id: 2 },
      { date: last, habit_id: 3 },
      { date: last2, habit_id: 2 },
      { date: last2, habit_id: 3 },
      { date: last3, habit_id: 2 },
    ],
  };
}

const local = {
  state() {
    let s = readLocal();
    if (!s) {
      s = seedDemo();
      writeLocal(s);
    }
    return s;
  },
  saveDay(date, patch, ensure) {
    const s = local.state();
    if (ensure && !s.days.find((d) => d.date === date)) {
      const t = todayStr();
      const base = s.days.find((d) => d.date === t) || s.todayRow;
      const nextQ = base.quran_end != null ? (base.quran_end >= 603 ? 1 : base.quran_end + 1) : 1;
      s.days.push({
        date, fajr: '04:17', dhuhr: '12:47', asr: '16:32', maghrib: '19:41', isha: '21:10',
        wake_time: '04:07', sleep_time: '22:40', quran_start: nextQ, gym_type: 'Push', gym_done: false,
        cardio_min: 0, book_pages: 0, notes: '',
      });
      s.days.sort((a, b) => a.date.localeCompare(b.date));
    }
    let row = s.days.find((d) => d.date === date);
    if (!row) {
      row = { date, fajr: null, dhuhr: null, asr: null, maghrib: null, isha: null, wake_time: null, sleep_time: null, quran_start: null, quran_end: null, gym_type: null, gym_done: false, cardio_min: 0, book_pages: 0, mood: null, weight: null, steps: null, calories: null, notes: '' };
      s.days.push(row);
      s.days.sort((a, b) => a.date.localeCompare(b.date));
    }
    Object.assign(row, patch);
    if (date === s.today) s.todayRow = row;
    if (date === s.tomorrow) s.tomorrowRow = row;
    writeLocal(s);
    return row;
  },
  addTask(task) {
    const s = local.state();
    const created = { id: Date.now(), status: 'todo', project: 'Jusoor', priority: 'Medium', is_daily: false, ...task };
    const list = created.date === s.tomorrow ? s.tasksTomorrow : s.tasksToday;
    list.push(created);
    writeLocal(s);
    return created;
  },
  updateTask(id, patch) {
    const s = local.state();
    for (const list of [s.tasksToday, s.tasksTomorrow]) {
      const t = list.find((x) => x.id === id);
      if (t) {
        Object.assign(t, patch);
        writeLocal(s);
        return t;
      }
    }
    return null;
  },
  deleteTask(id) {
    const s = local.state();
    s.tasksToday = s.tasksToday.filter((x) => x.id !== id);
    s.tasksTomorrow = s.tasksTomorrow.filter((x) => x.id !== id);
    writeLocal(s);
    return { id, deleted: true };
  },
  addBook(book) {
    const s = local.state();
    const created = { id: Date.now(), status: 'To Read', daily_target: 15, author: '', total_pages: 0, current_page: 0, ...book };
    s.books.push(created);
    writeLocal(s);
    return created;
  },
  updateBook(id, patch) {
    const s = local.state();
    const b = s.books.find((x) => x.id === id);
    if (b) {
      Object.assign(b, patch);
      writeLocal(s);
      return b;
    }
    return null;
  },
  deleteBook(id) {
    const s = local.state();
    s.books = s.books.filter((x) => x.id !== id);
    writeLocal(s);
    return { id, deleted: true };
  },
  updatePlan(id, patch) {
    const s = local.state();
    const p = s.plans.find((x) => x.id === id);
    if (p) {
      Object.assign(p, patch);
      writeLocal(s);
      return p;
    }
    return null;
  },
  toggleHabit(date, habitId) {
    const s = local.state();
    const idx = s.habitLog.findIndex((h) => h.date === date && h.habit_id === habitId);
    if (idx >= 0) {
      s.habitLog.splice(idx, 1);
      writeLocal(s);
      return { date, habit_id: habitId, done: false };
    }
    s.habitLog.push({ date, habit_id: habitId });
    writeLocal(s);
    return { date, habit_id: habitId, done: true };
  },
};

// ---------- exported API ----------
export const api = {
  async state() {
    try {
      const res = await serverRequest('state');
      mode = 'server';
      return { online: true, data: res };
    } catch (e) {
      mode = 'local';
      return { online: false, data: local.state() };
    }
  },
  async saveDay(date, patch, ensure) {
    if (mode === 'local') return local.saveDay(date, patch, ensure);
    try {
      return await serverRequest('days', { method: 'POST', body: JSON.stringify({ date, patch, ensure }) });
    } catch {
      mode = 'local';
      return local.saveDay(date, patch, ensure);
    }
  },
  async addTask(task) {
    if (mode === 'local') return local.addTask(task);
    try {
      return await serverRequest('tasks', { method: 'POST', body: JSON.stringify(task) });
    } catch {
      mode = 'local';
      return local.addTask(task);
    }
  },
  async updateTask(id, patch) {
    if (mode === 'local') return local.updateTask(id, patch);
    try {
      return await serverRequest('tasks', { method: 'PUT', body: JSON.stringify({ id, patch }) });
    } catch {
      mode = 'local';
      return local.updateTask(id, patch);
    }
  },
  async deleteTask(id) {
    if (mode === 'local') return local.deleteTask(id);
    try {
      return await serverRequest('tasks', { method: 'DELETE', body: JSON.stringify({ id }) });
    } catch {
      mode = 'local';
      return local.deleteTask(id);
    }
  },
  async addBook(book) {
    if (mode === 'local') return local.addBook(book);
    try {
      return await serverRequest('books', { method: 'POST', body: JSON.stringify(book) });
    } catch {
      mode = 'local';
      return local.addBook(book);
    }
  },
  async updateBook(id, patch) {
    if (mode === 'local') return local.updateBook(id, patch);
    try {
      return await serverRequest('books', { method: 'PUT', body: JSON.stringify({ id, patch }) });
    } catch {
      mode = 'local';
      return local.updateBook(id, patch);
    }
  },
  async deleteBook(id) {
    if (mode === 'local') return local.deleteBook(id);
    try {
      return await serverRequest('books', { method: 'DELETE', body: JSON.stringify({ id }) });
    } catch {
      mode = 'local';
      return local.deleteBook(id);
    }
  },
  async updatePlan(id, patch) {
    if (mode === 'local') return local.updatePlan(id, patch);
    try {
      return await serverRequest('workouts', { method: 'PUT', body: JSON.stringify({ id, patch }) });
    } catch {
      mode = 'local';
      return local.updatePlan(id, patch);
    }
  },
  async toggleHabit(date, habitId) {
    if (mode === 'local') return local.toggleHabit(date, habitId);
    try {
      return await serverRequest('habits', { method: 'POST', body: JSON.stringify({ toggle: true, date, habit_id: habitId }) });
    } catch {
      mode = 'local';
      return local.toggleHabit(date, habitId);
    }
  },
};
