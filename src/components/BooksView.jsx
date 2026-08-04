import React from 'react';
import { Card, ProgressBar, Empty } from './ui.jsx';

const STATUS_STYLE = {
  'Reading': 'bg-sky2/15 text-sky2',
  'To Read': 'bg-carbon-hover text-carbon-muted',
  'Done': 'bg-emerald-500/15 text-emerald2',
};

export default function BooksView({ books, onAdd, onEdit, onDelete }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <span className="text-blaze">📚</span> Library
        </h3>
        <button className="btn-primary !py-1 !px-3 !text-xs" onClick={() => onAdd()}>+ Add book</button>
      </div>

      {!books?.length ? (
        <Empty text="No books yet — add your first one." />
      ) : (
        <div className="space-y-2">
          {books.map((b) => {
            const pct = b.total_pages ? Math.min(100, Math.round((b.current_page / b.total_pages) * 100)) : 0;
            return (
              <div key={b.id} className="group rounded-xl border border-carbon-border bg-carbon-panel p-4">
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
                    <span>{b.daily_target} pages/day goal</span>
                  </div>
                  <ProgressBar value={pct} color="bg-sky2" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
