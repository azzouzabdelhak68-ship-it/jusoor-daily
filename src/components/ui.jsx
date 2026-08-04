import React from 'react';

export function Card({ children, className = '', style }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

export function SectionTitle({ icon, title, right, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h3 className="text-sm font-bold text-carbon-text flex items-center gap-2">
        {icon && <span className="text-blaze">{icon}</span>}
        <span className="tracking-tight">{title}</span>
      </h3>
      {right}
    </div>
  );
}

export function ProgressBar({ value, color = 'bg-blaze', className = '', track = '' }) {
  const pct = Math.max(0, Math.min(100, value || 0));
  return (
    <div className={`progress-track ${track || ''} ${className}`}>
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Pill({ children, className = '' }) {
  return <span className={`badge ${className}`}>{children}</span>;
}

export function Stat({ label, value, sub, accent = 'text-carbon-text' }) {
  return (
    <div className="rounded-xl bg-carbon-panel border border-carbon-border p-3">
      <p className="label">{label}</p>
      <p className={`mt-1 text-lg font-extrabold tracking-tight ${accent}`}>{value}</p>
      {sub && <p className="text-[11px] text-carbon-muted mt-0.5">{sub}</p>}
    </div>
  );
}

export function Empty({ text }) {
  return (
    <p className="text-xs text-carbon-faint py-4 text-center">{text}</p>
  );
}

export function TimeDot({ time, color = 'bg-blaze', past = false }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-carbon-muted">
      <span className={`w-1.5 h-1.5 rounded-full ${past ? 'bg-carbon-faint' : color}`} />
      {time}
    </span>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between py-3 cursor-pointer select-none">
      <span className="text-sm font-medium">{label}</span>
      <span
        onClick={() => onChange(!checked)}
        className={`relative inline-flex w-10 h-5.5 rounded-full transition-colors ${checked ? 'bg-blaze' : 'bg-carbon-hover'}`}
        style={{ height: '22px', width: '40px' }}
      >
        <span
          className="absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(18px)' : 'translateX(0)' }}
        />
      </span>
    </label>
  );
}
