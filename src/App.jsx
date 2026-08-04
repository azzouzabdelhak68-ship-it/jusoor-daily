import React, { useState, useEffect, useMemo } from 'react';
import { useAppData } from './hooks/useAppData.js';
import { startReminderEngine, requestPermission } from './lib/reminders.js';

import Header from './components/Header.jsx';
import NextTaskHero from './components/NextTaskHero.jsx';
import PrayerCard from './components/PrayerCard.jsx';
import ProgressBoard from './components/ProgressBoard.jsx';
import Timeline from './components/Timeline.jsx';
import QuranCard from './components/QuranCard.jsx';
import GymCard from './components/GymCard.jsx';
import BooksCard from './components/BooksCard.jsx';
import SleepCard from './components/SleepCard.jsx';
import HabitsCard from './components/HabitsCard.jsx';
import StatsPanel from './components/StatsPanel.jsx';
import TaskPanel from './components/TaskPanel.jsx';
import BooksView from './components/BooksView.jsx';
import SettingsView from './components/SettingsView.jsx';
import { TaskModal, BookModal, WorkoutModal } from './components/Modals.jsx';

const NAV = [
  { id: 'today', label: 'Dashboard', icon: '🏠' },
  { id: 'tasks', label: 'Tasks', icon: '📌' },
  { id: 'books', label: 'Books', icon: '📚' },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function App() {
  const app = useAppData();
  const [view, setView] = useState('today');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modal, setModal] = useState(null);
  const [notifOn, setNotifOn] = useState(() => localStorage.getItem('jusoor_notif') !== 'off');

  const { data, loading, online } = app;
  const todayRow = data?.todayRow;

  useEffect(() => {
    localStorage.setItem('jusoor_notif', notifOn ? 'on' : 'off');
  }, [notifOn]);

  useEffect(() => {
    if (notifOn && online) requestPermission();
  }, [notifOn, online]);

  useEffect(() => {
    const stop = startReminderEngine(() => data, () => notifOn);
    return stop;
  }, [notifOn, data]);

  const todayTasks = useMemo(() => data?.tasksToday || [], [data]);

  // ---------- handlers ----------
  const handleToggleTask = (id, status) => app.updateTask(id, { status });
  const handleSaveTask = (fields) => {
    const editing = modal?.task;
    if (editing) {
      app.updateTask(editing.id, fields);
    } else {
      app.addTask({ ...fields, date: modal?.date || data.today });
    }
    setModal(null);
  };
  const handleDeleteTask = (id) => app.deleteTask(id);

  const handleSaveBook = (fields) => {
    if (modal?.book) app.updateBook(modal.book.id, fields);
    else app.addBook(fields);
    setModal(null);
  };
  const handleSavePlan = (fields) => {
    if (modal?.plan) app.updatePlan(modal.plan.id, fields);
    setModal(null);
  };

  return (
    <div className="flex h-screen bg-carbon-bg text-carbon-text font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} transition-all duration-200 bg-carbon-panel border-r border-carbon-border flex flex-col z-20 shrink-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-carbon-border">
          <button className="btn-ghost !p-1.5" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          {sidebarOpen && <span className="text-[10px] font-mono text-carbon-faint">v1.0</span>}
        </div>
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                view === n.id ? 'bg-blaze/15 text-blaze-bright border border-blaze/25' : 'text-carbon-muted hover:bg-carbon-hover hover:text-carbon-text border border-transparent'
              }`}
            >
              <span className="text-base">{n.icon}</span>
              {sidebarOpen && <span className="truncate">{n.label}</span>}
            </button>
          ))}
        </nav>
        {sidebarOpen && (
          <div className="p-3 m-2 rounded-xl bg-carbon-card border border-carbon-border text-[11px] text-carbon-muted space-y-1">
            <p className="flex justify-between"><span>Quran total</span><b className="text-emerald2">603 pages</b></p>
            <p className="flex justify-between"><span>Rotation</span><b className="text-carbon-text">PPL + Cardio</b></p>
            <p className="flex justify-between"><span>Location</span><b className="text-carbon-text">Bousaada</b></p>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header data={data} online={online} />

        {loading ? (
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-br from-blaze to-blaze-hover animate-pulse shadow-glow" />
              <p className="mt-4 text-sm text-carbon-muted">Loading your day…</p>
            </div>
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {view === 'today' && (
              <div className="max-w-7xl mx-auto space-y-4">
                <NextTaskHero
                  tasks={todayTasks}
                  onComplete={(id) => handleToggleTask(id, 'done')}
                  onOpen={(t) => setModal({ type: 'task', task: t })}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-7 space-y-4">
                    <PrayerCard day={todayRow} />
                    <Timeline tasks={todayTasks} onComplete={(id) => handleToggleTask(id, 'done')} />
                  </div>
                  <div className="lg:col-span-5 space-y-4">
                    <ProgressBoard day={todayRow} tasks={todayTasks} />
                    <QuranCard
                      day={todayRow}
                      days={data.days}
                      onSave={app.saveDayPatch}
                    />
                    <GymCard
                      day={todayRow}
                      plans={data.plans}
                      onToggleGym={() => app.saveDayPatch({ gym_done: !todayRow.gym_done })}
                      onCardio={(m) => app.saveDayPatch({ cardio_min: m })}
                      onEditPlan={(plan) => setModal({ type: 'workout', plan })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <BooksCard
                    day={todayRow}
                    books={data.books}
                    onLogPages={(p) => app.saveDayPatch({ book_pages: p })}
                    onOpenLibrary={() => setView('books')}
                  />
                  <SleepCard day={todayRow} onSave={app.saveDayPatch} />
                  <HabitsCard
                    habits={data.habits}
                    habitLog={data.habitLog}
                    today={data.today}
                    onToggle={app.toggleHabit}
                  />
                </div>

                <StatsPanel days={data.days} tasksToday={todayTasks} />
              </div>
            )}

            {view === 'tasks' && (
              <div className="max-w-6xl mx-auto">
                <TaskPanel
                  today={data.today}
                  tomorrow={data.tomorrow}
                  tasksToday={data.tasksToday}
                  tasksTomorrow={data.tasksTomorrow}
                  onAdd={(d) => setModal({ type: 'task', date: d.date })}
                  onToggle={handleToggleTask}
                  onEdit={(t) => setModal({ type: 'task', task: t })}
                  onDelete={handleDeleteTask}
                />
              </div>
            )}

            {view === 'books' && (
              <div className="max-w-3xl mx-auto">
                <BooksView
                  books={data.books}
                  onAdd={() => setModal({ type: 'book' })}
                  onEdit={(b) => setModal({ type: 'book', book: b })}
                  onDelete={app.deleteBook}
                />
              </div>
            )}

            {view === 'stats' && (
              <div className="max-w-6xl mx-auto">
                <StatsPanel days={data.days} tasksToday={todayTasks} />
              </div>
            )}

            {view === 'settings' && (
              <SettingsView
                online={online}
                notifOn={notifOn}
                onNotif={(v) => setNotifOn(v)}
                onRefresh={app.refresh}
              />
            )}
          </main>
        )}
      </div>

      {/* Modals */}
      {modal?.type === 'task' && (
        <TaskModal initial={modal.task} date={modal.date} onSave={handleSaveTask} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'book' && (
        <BookModal initial={modal.book} onSave={handleSaveBook} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'workout' && (
        <WorkoutModal initial={modal.plan} onSave={handleSavePlan} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
