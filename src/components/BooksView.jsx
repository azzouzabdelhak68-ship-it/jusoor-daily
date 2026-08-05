import React, { useState, useEffect, useMemo } from 'react';
import { Card, ProgressBar, Empty } from './ui.jsx';
import { api } from '../lib/api.js';

const STATUS_STYLE = {
  'Reading': 'bg-sky2/15 text-sky2',
  'To Read': 'bg-carbon-hover text-carbon-muted',
  'Done': 'bg-emerald-500/15 text-emerald2',
};

export default function BooksView({ books, onAdd, onEdit, onDelete }) {
  const [tab, setTab] = useState('shelf');
  const [library, setLibrary] = useState([]);
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState('');

  useEffect(() => {
    api.fetchJson('/books.json').then(setLibrary).catch(() => setLibrary([]));
  }, []);

  const genres = useMemo(() => [...new Set(library.map((b) => b.g))].sort(), [library]);
  const filtered = useMemo(() => {
    return library.filter((b) => {
      if (genre && b.g !== genre) return false;
      if (q && !(b.t + ' ' + b.a).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [library, q, genre]);

  const added = useMemo(() => new Set((books || []).map((b) => b.title.toLowerCase())), [books]);

  const downloadLibrary = () => {
    const blob = new Blob([JSON.stringify(library, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'books-library.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="p-5 rounded-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-display text-sm font-extrabold flex items-center gap-2">
            <span className="text-blaze">📚</span> BOOKS
          </h3>
          <div className="flex gap-2">
            <button className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-sm border ${tab === 'shelf' ? 'bg-blaze/20 border-blaze/50 text-blaze font-extrabold' : 'border-carbon-border text-carbon-muted'}`} onClick={() => setTab('shelf')}>My shelf</button>
            <button className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-sm border ${tab === 'library' ? 'bg-blaze/20 border-blaze/50 text-blaze font-extrabold' : 'border-carbon-border text-carbon-muted'}`} onClick={() => setTab('library')}>Library ({library.length})</button>
            <button className="btn-ghost text-[10px]" onClick={downloadLibrary}>⬇ books.json</button>
          </div>
        </div>

        {tab === 'shelf' ? (
          <>
            <div className="flex justify-end mb-3">
              <button className="btn-primary !py-1 !px-3 !text-[10px]" onClick={() => onAdd()}>+ Add book</button>
            </div>
            {!books?.length ? (
              <Empty text="No books yet — add one or browse the library." />
            ) : (
              <div className="space-y-2">
                {books.map((b) => {
                  const pct = b.total_pages ? Math.min(100, Math.round((b.current_page / b.total_pages) * 100)) : 0;
                  return (
                    <div key={b.id} className="group rounded-sm border border-carbon-border bg-[#0a0a0c] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{b.title}</p>
                          <p className="text-xs text-carbon-faint">{b.author || '—'}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`badge ${STATUS_STYLE[b.status] || STATUS_STYLE['To Read']}`}>{b.status}</span>
                          <button onClick={() => onEdit(b)} className="text-carbon-faint hover:text-carbon-text text-xs opacity-0 group-hover:opacity-100">✎</button>
                          <button onClick={() => onDelete(b.id)} className="text-carbon-faint hover:text-blaze text-xs opacity-0 group-hover:opacity-100">🗑</button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] text-carbon-muted mb-1">
                          <span className="font-mono">{b.current_page}/{b.total_pages || '?'} pages</span>
                          <span>{b.daily_target} pages/day</span>
                        </div>
                        <ProgressBar value={pct} color="bg-sky2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title or author…"
                className="flex-1 min-w-[200px] bg-[#0a0a0c] border border-carbon-border rounded-sm px-3 py-1.5 font-mono text-xs text-carbon-text focus:outline-none focus:border-blaze/60 placeholder:text-carbon-faint"
              />
              <select value={genre} onChange={(e) => setGenre(e.target.value)} className="bg-[#0a0a0c] border border-carbon-border rounded-sm px-2 py-1.5 font-mono text-xs text-carbon-text focus:outline-none">
                <option value="">All genres ({genres.length})</option>
                {genres.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {!library.length ? (
              <Empty text="Library not loaded yet." />
            ) : filtered.length === 0 ? (
              <Empty text="No books match." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                {filtered.map((b, i) => {
                  const already = added.has(b.t.toLowerCase());
                  return (
                    <div key={`${b.t}-${i}`} className="rounded-sm border border-carbon-border bg-[#0a0a0c] p-3 flex flex-col">
                      <p className="font-semibold text-sm leading-snug">{b.t}</p>
                      <p className="text-xs text-carbon-faint mt-0.5">{b.a}</p>
                      <p className="font-mono text-[9px] uppercase tracking-wider text-blaze/70 mt-1">{b.g}</p>
                      <div className="mt-2">
                        <button
                          disabled={already}
                          onClick={() => onAdd({ title: b.t, author: b.a, status: 'To Read', total_pages: 0, current_page: 0, daily_target: 15 })}
                          className={`font-mono text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-sm ${already ? 'bg-emerald-500/10 text-emerald2 border border-emerald-500/20' : 'bg-blaze hover:bg-blaze-hover text-black'}`}
                        >
                          {already ? '✓ Added' : '+ Add'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}