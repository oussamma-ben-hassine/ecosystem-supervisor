'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Search, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function EventsJournalPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [appFilter, setAppFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/events?search=${encodeURIComponent(search)}&application_id=${encodeURIComponent(appFilter)}`)
      .then((r) => r.json())
      .then((data) => {
        setEvents(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Could not fetch events:', err);
        setEvents([]);
        setLoading(false);
      });
  }, [search, appFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Journal Global d'Activités</span>
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Registre d'audit centralisé, immuable et interrogeable avec corrélation de requêtes (données de production en temps réel).
        </p>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par Event ID, corrélation ou ressource..."
            className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={appFilter}
          onChange={(e) => setAppFilter(e.target.value)}
          className="w-full sm:w-auto bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
        >
          <option value="">Toutes les applications</option>
          <option value="sso">SSO</option>
          <option value="drive">Drive</option>
          <option value="messenger">Messenger</option>
          <option value="cv-builder">CV Builder</option>
          <option value="litellm">LiteLLM</option>
          <option value="portal">Portail</option>
          <option value="recettes">Recettes</option>
          <option value="notes">Notes</option>
          <option value="devspace">DevSpace</option>
          <option value="tv-player">TV Player</option>
        </select>
      </div>

      {/* Events Table or Empty State */}
      <div className="rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        {events.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs space-y-2">
            <Activity className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto opacity-50" />
            <p className="font-medium text-slate-700 dark:text-slate-300">Aucun événement d'activité pour le moment</p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Les actions (connexions SSO, fichiers créés/partagés, requêtes IA, messages) apparaîtront ici automatiquement dès leur exécution par les utilisateurs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-black/30 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 uppercase tracking-wider font-semibold">
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
              <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {events.map((ev) => (
                  <tr key={ev.event_id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{ev.event_id}</td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">{ev.event_type}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {ev.application_id}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{ev.actor?.sub || 'Système'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          ev.outcome === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
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
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{ev.occurred_at}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {ev.correlation_id || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
