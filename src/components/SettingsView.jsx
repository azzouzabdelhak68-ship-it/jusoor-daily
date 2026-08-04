import React from 'react';
import { Card, SectionTitle, Switch } from './ui.jsx';

export default function SettingsView({ online, notifOn, onNotif, onRefresh }) {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card className="p-6">
        <SectionTitle icon="⚙️" title="Settings" />
        <Switch checked={notifOn} onChange={onNotif} label="Desktop notifications & reminders" />
        <Switch checked={online} onChange={() => {}} label="Cloud sync (Netlify Database)" />

        <div className="mt-4 pt-4 border-t border-carbon-border">
          <p className="label mb-2">Status</p>
          <div className="rounded-xl bg-carbon-panel border border-carbon-border p-4 text-xs text-carbon-muted space-y-1">
            <p><span className="text-emerald2 font-semibold">{online ? '● Connected' : '● Demo mode'}</span> — {online ? 'data is stored in your Netlify Database.' : 'API unreachable; using local demo data. Deploy to Netlify to go live.'}</p>
            <p>Prayer times: AlAdhan · Bousaada, Algeria · Method 19</p>
            <p>Timezone: Africa/Algiers (GMT+1)</p>
          </div>
          <button className="btn-ghost mt-3 text-xs" onClick={onRefresh}>⟳ Reload data</button>
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
    </div>
  );
}
