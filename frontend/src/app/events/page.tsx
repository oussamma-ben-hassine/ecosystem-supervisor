'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Search, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function EventsJournalPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [appFilter, setAppFilter] = useState('');

  useEffect(() => {
    fetch(`/api/v1/events?search=${encodeURIComponent(search)}&application_id=${encodeURIComponent(appFilter)}`)
      .then((r) => r.json())
      .then((data) => setEvents(data.items || []))
      .catch(() => {
        setEvents([
          { event_id: 'ev-101', event_type: 'file.downloaded', application_id: 'drive', actor: { sub: 'user-oussamma-001' }, occurred_at: '2026-10-17T06:40:00Z', outcome: 'success', correlation_id: 'corr-8841' },
          { event_id: 'ev-102', event_type: 'message.sent', application_id: 'messenger', actor: { sub: 'user-demo-sarah' }, occurred_at: '2026-10-17T06:38:12Z', outcome: 'success', correlation_id: 'corr-8842' },
          { event_id: 'ev-103', event_type: 'cv.created', application_id: 'cv-builder', actor: { sub: 'user-demo-mehdi' }, occurred_at: '2026-10-17T06:35:40Z', outcome: 'success', correlation_id: 'corr-8843' },
          { event_id: 'ev-104', event_type: 'ai.completion', application_id: 'litellm', actor: { sub: 'user-oussamma-001' }, occurred_at: '2026-10-17T06:32:10Z', outcome: 'success', correlation_id: 'corr-8844' },
          { event_id: 'ev-105', event_type: 'sso.login', application_id: 'sso', actor: { sub: 'user-oussamma-001' }, occurred_at: '2026-10-17T06:30:00Z', outcome: 'success', correlation_id: 'corr-8845' },
        ]);
      });
  }, [search, appFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-400" />
          <span>Journal Global d'Activités</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Registre d'audit centralisé, immuable et interrogeable avec corrélation de requêtes.
        </p>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par Event ID, corrélation ou ressource..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={appFilter}
          onChange={(e) => setAppFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
        >
          <option value="">Toutes les applications</option>
          <option value="sso">SSO</option>
          <option value="drive">Drive</option>
          <option value="messenger">Messenger</option>
          <option value="cv-builder">CV Builder</option>
          <option value="litellm">LiteLLM</option>
          <option value="portal">Portal</option>
          <option value="recettes">Recettes</option>
          <option value="notes">Notes</option>
        </select>
      </div>

      {/* Events Table */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Application</th>
                <th className="py-3 px-4">Acteur</th>
                <th className="py-3 px-4">Résultat</th>
                <th className="py-3 px-4">Date (UTC)</th>
                <th className="py-3 px-4">Corrélation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {events.map((ev) => (
                <tr key={ev.event_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-indigo-400">{ev.event_id}</td>
                  <td className="py-3 px-4 font-medium text-slate-100">{ev.event_type}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px] text-slate-300">
                      {ev.application_id}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{ev.actor?.sub || 'Système'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        ev.outcome === 'success' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {ev.outcome === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      <span>{ev.outcome}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{ev.occurred_at}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {ev.correlation_id || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
