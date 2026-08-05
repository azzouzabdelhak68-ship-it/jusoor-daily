import React, { useState } from 'react';
import { Card, SectionTitle, Switch } from './ui.jsx';

export default function SettingsView({ online, notifOn, onNotif, onRefresh, onReset }) {
  const [syncing, setSyncing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    setMsg(null);
    try {
      await onRefresh();
      setMsg({ ok: true, text: 'Data reloaded. ' + (online ? 'Connected to cloud.' : 'Still in demo mode.') });
    } catch {
      setMsg({ ok: false, text: 'Sync failed — API unreachable.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleReset = async () => {
    const ok = window.confirm(
      'Delete ALL data — every day, task, book, workout split, PR record, habit log, and reset the Quran back to page 1. This cannot be undone. Today and tomorrow will regenerate from a clean state.'
    );
    if (!ok) return;
    setResetting(true);
    setMsg(null);
    try {
      await onReset();
      setMsg({ ok: true, text: 'All data wiped. Fresh state loaded.' });
    } catch {
      setMsg({ ok: false, text: 'Reset failed — try again.' });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card className="p-6">
        <SectionTitle icon="⚙️" title="Settings" />
        <Switch checked={notifOn} onChange={onNotif} label="Desktop notifications & reminders" />

        <div className="pt-2">
          <Switch checked={online} onChange={handleSync} label="Cloud sync (Netlify Database)" />
          <p className="text-[11px] text-carbon-muted -mt-2">
            {syncing ? 'Syncing…' : 'Toggle to reconnect & reload from the cloud.'}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-carbon-border">
          <p className="label mb-2">Status</p>
          <div className="rounded-xl bg-carbon-panel border border-carbon-border p-4 text-xs text-carbon-muted space-y-1">
            <p><span className="text-emerald2 font-semibold">{online ? '● Connected' : '● Demo mode'}</span> — {online ? 'data is stored in your Netlify Database.' : 'API unreachable; using local demo data. Deploy to Netlify to go live.'}</p>
            <p>Prayer times: AlAdhan · Bousaada, Algeria · Method 19</p>
            <p>Timezone: Africa/Algiers (GMT+1)</p>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button className="btn-ghost text-xs" onClick={handleSync} disabled={syncing}>
              {syncing ? '⟳ Syncing…' : '⟳ Reload data'}
            </button>
          </div>
          {msg && (
            <p className={`text-xs mt-2 ${msg.ok ? 'text-emerald2' : 'text-red-400'}`}>{msg.text}</p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <SectionTitle icon="🤖" title="Automation" />
        <div className="space-y-2 text-xs text-carbon-muted leading-relaxed">
          <p>• A GitHub Actions workflow runs daily at <b className="text-carbon-text">23:55 GMT+1</b> and prepares tomorrow: prayer times, wake/sleep, Quran start page, gym rotation, and routine tasks.</p>
          <p>• The dashboard also self-heals: if you open it and today/tomorrow are missing, they're created automatically.</p>
          <p>• Reminders fire as browser notifications while this tab is open.</p>
        </div>
      </Card>

      <Card className="p-6 border-red-500/20">
        <SectionTitle icon="⚠️" title="Danger zone" />
        <p className="text-xs text-carbon-muted mb-3">
          Permanently delete every day, task, book, workout split, PR record, habit and log entry. Quran progress resets to page 1. Today and tomorrow will be recreated fresh.
        </p>
        <button
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500/90 hover:bg-red-500 disabled:opacity-50 transition-colors"
          onClick={handleReset}
          disabled={resetting}
        >
          {resetting ? 'Resetting…' : 'Reset all data'}
        </button>
      </Card>
    </div>
  );
}
