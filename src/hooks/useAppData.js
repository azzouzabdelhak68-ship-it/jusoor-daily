import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';

export function useAppData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { online: isOnline, data: d } = await api.state();
      setData(d);
      setOnline(isOnline);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => {
    return load();
  }, [load]);

  const resetData = useCallback(async () => {
    await api.reset();
    await load();
  }, [load]);

  // -------- mutation helpers (optimistic, then push) --------
  const mutateData = useCallback((fn) => {
    setData((prev) => (prev ? fn(prev) : prev));
  }, []);

  const saveDayPatch = useCallback(async (patch) => {
    if (!data) return;
    const date = data.today;
    mutateData((d) => ({
      ...d,
      todayRow: { ...d.todayRow, ...patch },
      days: d.days.map((row) => (row.date === date ? { ...row, ...patch } : row)),
    }));
    await api.saveDay(date, patch);
  }, [data, mutateData]);

  const addTask = useCallback(async (task) => {
    const created = await api.addTask({ ...task });
    mutateData((d) => {
      const list = created.date === d.tomorrow ? 'tasksTomorrow' : 'tasksToday';
      return { ...d, [list]: [...d[list], created] };
    });
    return created;
  }, [mutateData]);

  const updateTask = useCallback(async (id, patch) => {
    const updated = await api.updateTask(id, patch);
    mutateData((d) => ({
      ...d,
      tasksToday: d.tasksToday.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      tasksTomorrow: d.tasksTomorrow.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
    return updated;
  }, [mutateData]);

  const deleteTask = useCallback(async (id) => {
    await api.deleteTask(id);
    mutateData((d) => ({
      ...d,
      tasksToday: d.tasksToday.filter((t) => t.id !== id),
      tasksTomorrow: d.tasksTomorrow.filter((t) => t.id !== id),
    }));
  }, [mutateData]);

  const addBook = useCallback(async (book) => {
    const created = await api.addBook(book);
    mutateData((d) => ({ ...d, books: [...d.books, created] }));
    return created;
  }, [mutateData]);

  const updateBook = useCallback(async (id, patch) => {
    await api.updateBook(id, patch);
    mutateData((d) => ({ ...d, books: d.books.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  }, [mutateData]);

  const deleteBook = useCallback(async (id) => {
    await api.deleteBook(id);
    mutateData((d) => ({ ...d, books: d.books.filter((b) => b.id !== id) }));
  }, [mutateData]);

  const updatePlan = useCallback(async (id, patch) => {
    await api.updatePlan(id, patch);
    mutateData((d) => ({ ...d, plans: d.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  }, [mutateData]);

  const toggleHabit = useCallback(async (habitId) => {
    if (!data) return;
    const date = data.today;
    const existing = data.habitLog.some((h) => h.date === date && h.habit_id === habitId);
    const result = await api.toggleHabit(date, habitId);
    const done = result.done;
    mutateData((d) => ({
      ...d,
      habitLog: done
        ? [...d.habitLog.filter((h) => !(h.date === date && h.habit_id === habitId)), { date, habit_id: habitId }]
        : d.habitLog.filter((h) => !(h.date === date && h.habit_id === habitId)),
    }));
    void existing;
  }, [data, mutateData]);

  const saveSplit = useCallback(async (split) => {
    const saved = await api.saveSplit(split);
    mutateData((d) => {
      let splits = d.splits || [];
      if (split.id) {
        splits = splits.map((x) => (x.id === split.id ? { ...x, ...split } : x));
      } else {
        splits = [...splits, saved];
      }
      if (split.is_active) splits = splits.map((x) => (x.id !== saved.id ? { ...x, is_active: false } : x));
      return { ...d, splits };
    });
    return saved;
  }, [mutateData]);

  const deleteSplit = useCallback(async (id) => {
    await api.deleteSplit(id);
    mutateData((d) => ({ ...d, splits: (d.splits || []).filter((x) => x.id !== id) }));
  }, [mutateData]);

  const addPr = useCallback(async (entry) => {
    const created = await api.addPr({ date: data.today, ...entry });
    mutateData((d) => ({ ...d, prs: [created, ...(d.prs || [])].slice(0, 300) }));
    return created;
  }, [data, mutateData]);

  const forecastSplit = useCallback((n) => {
    return api.forecastSplit(n);
  }, []);

  return {
    data,
    loading,
    online,
    error,
    refresh,
    resetData,
    saveDayPatch,
    addTask,
    updateTask,
    deleteTask,
    addBook,
    updateBook,
    deleteBook,
    updatePlan,
    toggleHabit,
    saveSplit,
    deleteSplit,
    addPr,
    forecastSplit,
  };
}
