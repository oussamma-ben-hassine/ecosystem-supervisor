'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Search, Filter, Shield, Activity, ChevronRight, CheckCircle2 } from 'lucide-react';
import { UserSummary } from '../../lib/types';
import { api } from '../../lib/api';

export default function UsersDirectoryPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getUsers(search)
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load users:', err);
        setUsers([]);
        setLoading(false);
      });
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Annuaire Central des Utilisateurs</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Identités certifiées issues du SSO, sessions actives et couverture applicative.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email ou sub SSO..."
            className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0 self-start sm:self-auto">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Identification certifiée : <code className="text-slate-700 dark:text-slate-300 font-medium">issuer + sub</code></span>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-black/30 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4">Identifiant SSO (Sub)</th>
                <th className="py-3 px-4">Rôle</th>
                <th className="py-3 px-4">Applications Accessibles</th>
                <th className="py-3 px-4">Dernière Activité</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
                        {u.name?.slice(0, 2).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block">{u.name || 'Anonyme'}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{u.email || 'Aucun email'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {u.sub}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                        u.role === 'admin'
                          ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {u.accessible_apps.map((app) => (
                        <span
                          key={app}
                          className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                    {u.last_active_at ? new Date(u.last_active_at).toLocaleString() : 'Jamais'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/users/${encodeURIComponent(u.sub)}`}
                      className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-600/15 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 text-indigo-700 dark:text-indigo-400 font-medium px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-500/30 text-xs transition-colors"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Activité 360°</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
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
