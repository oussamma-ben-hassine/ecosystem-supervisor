'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Clock, RefreshCw, XCircle } from 'lucide-react';
import { AlertItem } from '@/lib/types';
import { api } from '@/lib/api';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('open');

  const loadAlerts = () => {
    api.getAlerts(filterStatus || undefined)
      .then(setAlerts)
      .catch(() => {
        setAlerts([
          {
            id: 'al-01',
            rule_id: 'rule_failed_logins',
            application_id: 'sso',
            severity: 'critical',
            title: 'Multiple échecs de connexion SSO',
            message: '3 échecs consécutifs d’authentification détectés pour l’adresse IP 197.3.24.11',
            status: 'open',
            occurrence_count: 3,
            first_seen_at: '2026-10-17T06:15:00Z',
            last_seen_at: '2026-10-17T06:22:00Z',
            metadata: { ip: '197.3.24.11', actor: 'unknown' },
          },
          {
            id: 'al-02',
            rule_id: 'rule_high_downloads',
            application_id: 'drive',
            severity: 'warning',
            title: 'Téléchargements anormaux détectés',
            message: 'Plus de 10 téléchargements simultanés de fichiers volumineux sur ByteVault Drive.',
            status: 'open',
            occurrence_count: 12,
            first_seen_at: '2026-10-17T05:40:00Z',
            last_seen_at: '2026-10-17T05:50:00Z',
            metadata: { total_bytes: 48000000 },
          },
        ]);
      });
  };

  useEffect(() => {
    loadAlerts();
  }, [filterStatus]);

  const handleResolve = async (id: string) => {
    try {
      await api.resolveAlert(id);
      loadAlerts();
    } catch {
      setAlerts(alerts.map((a) => (a.id === id ? { ...a, status: 'resolved' } : a)));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
          <span>Moteur d'Alertes & Détection d'Anomalies</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Surveillance des échecs répétés, suppressions massives, téléchargements anormaux et pics IA.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {['open', 'resolved', ''].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterStatus === st
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {st === 'open' ? 'En cours (Ouvertes)' : st === 'resolved' ? 'Résolues' : 'Toutes'}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <span>Aucune alerte active dans ce périmètre. Tout est normal.</span>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-xl border transition-all ${
                alert.severity === 'critical'
                  ? 'bg-rose-950/20 border-rose-900/40'
                  : 'bg-amber-950/20 border-amber-900/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                      alert.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="font-bold text-white text-sm">{alert.title}</span>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                    {alert.application_id}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {alert.occurrence_count} occurrence(s)
                  </span>
                  {alert.status === 'open' && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                    >
                      Résoudre
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-2 text-xs text-slate-300">{alert.message}</p>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                <span>Première détection : {new Date(alert.first_seen_at).toLocaleTimeString()}</span>
                <span>Dernière récurrence : {new Date(alert.last_seen_at).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
