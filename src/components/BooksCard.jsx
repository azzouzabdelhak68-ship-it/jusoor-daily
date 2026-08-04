import React, { useState } from 'react';
import { Card, SectionTitle, ProgressBar } from './ui.jsx';

export default function BooksCard({ day, books, onLogPages, onOpenLibrary }) {
  const [input, setInput] = useState('');
  const reading = (books || []).filter((b) => b.status === 'Reading');
  const target = 15;

  const submit = (e) => {
    e.preventDefault();
    const v = parseInt(input, 10);
    if (Number.isNaN(v) || v < 0) return;
    onLogPages(v);
    setInput('');
  };

  return (
    <Card className="p-5">
      <SectionTitle
        icon="📚"
        title="Books"
        right={
          <button onClick={onOpenLibrary} className="text-[11px] font-semibold text-blaze hover:text-blaze-bright">
            Library →
          </button>
        }
      />

      {reading.length === 0 && (
        <p className="text-xs text-carbon-faint py-3 text-center">
          No book marked as "Reading" — open the library to start one.
        </p>
      )}

      {reading.slice(0, 2).map((b) => {
        const pct = b.total_pages ? Math.min(100, Math.round((b.current_page / b.total_pages) * 100)) : 0;
        return (
          <div key={b.id} className="rounded-xl bg-carbon-panel border border-carbon-border p-3 mb-3">
            <div className="flex justify-between items-baseline">
              <p className="text-sm font-semibold truncate">{b.title}</p>
              <p className="text-[11px] font-mono text-carbon-muted">{b.current_page}/{b.total_pages || '?'}</p>
            </div>
            <p className="text-[11px] text-carbon-faint mb-2">{b.author}</p>
            <ProgressBar value={pct} color="bg-sky2" />
          </div>
        );
      })}

      <form onSubmit={submit} className="flex gap-2">
        <input
          type="number"
          min="0"
          placeholder={`Pages read today (goal ${target})`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input"
        />
        <button type="submit" className="btn-primary shrink-0">Log</button>
      </form>
      <div className="flex gap-2 mt-2">
        {[5, 10, 15].map((n) => (
          <button key={n} onClick={() => onLogPages((day?.book_pages || 0) + n)} className="btn-ghost flex-1 text-xs">
            +{n}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-carbon-muted mt-2 text-right font-mono">
        Today: {day?.book_pages || 0} / {target} pages
      </p>
    </Card>
  );
}
