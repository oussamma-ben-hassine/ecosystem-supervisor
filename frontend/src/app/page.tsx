'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Activity,
  Cpu,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import { AnalyticsOverview } from '@/lib/types';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial overview metrics
    api
      .getOverview()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load overview:', err);
        // Fallback default dataset for offline preview
        setData({
          total_users: 4,
          dau: 3,
          wau: 4,
          mau: 4,
          total_events_today: 142,
          total_events_all_time: 1890,
          active_alerts_count: 0,
          successful_logins_24h: 38,
          failed_logins_24h: 1,
          ai_tokens_today: 48920,
          ai_cost_today_usd: 0.082,
          top_applications: [
            { application_id: 'sso', name: 'SSO Authenticator', event_count: 512, user_count: 4, percentage: 35.2, status: 'active' },
            { application_id: 'drive', name: 'ByteVault Drive', event_count: 410, user_count: 3, percentage: 28.1, status: 'active' },
            { application_id: 'messenger', name: 'Smart Messenger', event_count: 320, user_count: 4, percentage: 22.0, status: 'active' },
            { application_id: 'cv-builder', name: 'AI CV Builder', event_count: 120, user_count: 2, percentage: 8.2, status: 'active' },
            { application_id: 'litellm', name: 'LiteLLM Gateway', event_count: 94, user_count: 3, percentage: 6.5, status: 'active' },
          ],
          activity_trend_7d: [
            { date: '11 Oct', count: 180 },
            { date: '12 Oct', count: 220 },
            { date: '13 Oct', count: 310 },
            { date: '14 Oct', count: 280 },
            { date: '15 Oct', count: 390 },
            { date: '16 Oct', count: 440 },
            { date: '17 Oct', count: 520 },
          ],
        });
        setLoading(false);
      });

    // 2. Setup Server-Sent Events (SSE) connection for real-time live feed
    try {
      const eventSource = new EventSource('/api/v1/stream/events');
      eventSource.addEventListener('activity', (e: any) => {
        try {
          const newEvents = JSON.parse(e.data);
          setLiveEvents(newEvents);
        } catch {}
      });
      return () => eventSource.close();
    } catch (e) {
      console.warn('SSE not supported or failed to connect:', e);
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Tableau de Bord Écosystème</h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervision temps réel, télémétrie multi-applications, consommation IA et sécurité.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/assistant"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-lg shadow-indigo-500/20 transition-all"
          >
            <span>Interroger l'Assistant IA</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="UTILISATEURS ACTIFS (DAU / MAU)"
          value={`${data?.dau || 0} / ${data?.mau || 0}`}
          subtext={`Total inscrits : ${data?.total_users || 0} utilisateurs SSO`}
          icon={Users}
          change="+12%"
          isPositive={true}
        />
        <StatCard
          title="ÉVÉNEMENTS (24H)"
          value={data?.total_events_today.toLocaleString() || '0'}
          subtext={`Cumul historique : ${data?.total_events_all_time.toLocaleString() || '0'}`}
          icon={Activity}
          change="+18%"
          isPositive={true}
        />
        <StatCard
          title="CONSOMMATION IA AUJOURD'HUI"
          value={`${((data?.ai_tokens_today || 0) / 1000).toFixed(1)}k tokens`}
          subtext={`Coût estimé : ~${data?.ai_cost_today_usd || 0} $ USD`}
          icon={Cpu}
          change="LiteLLM actif"
          isPositive={true}
        />
        <StatCard
          title="ALERTES DE SÉCURITÉ"
          value={data?.active_alerts_count || 0}
          subtext="Multiples échecs de login, anomalies"
          icon={AlertTriangle}
          variant={data?.active_alerts_count ? 'danger' : 'success'}
          change={data?.active_alerts_count ? 'Attention' : 'Sécurisé'}
          isPositive={!data?.active_alerts_count}
        />
      </div>

      {/* Secondary Metrics & Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Trend & App Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trend Card */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Tendance d'Activité Globale (7 Jours)</h3>
                <p className="text-[11px] text-slate-400">Événements cross-applications ingérés par jour</p>
              </div>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                Total : {data?.total_events_all_time || 0} actions
              </span>
            </div>

            {/* Custom Bar Visualization */}
            <div className="h-48 flex items-end gap-3 pt-6 px-2">
              {data?.activity_trend_7d.map((pt, idx) => {
                const max = Math.max(...(data?.activity_trend_7d.map((p) => p.count) || [100]));
                const heightPct = Math.max(12, Math.round((pt.count / (max || 1)) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {pt.count}
                    </span>
                    <div className="w-full bg-slate-800 rounded-t-md overflow-hidden h-36 flex items-end">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md group-hover:from-indigo-500 group-hover:to-violet-400 transition-all duration-300"
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{pt.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Applications Distribution */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Répartition par Application</h3>
              <Link href="/applications" className="text-xs text-indigo-400 hover:underline">
                Voir toutes
              </Link>
            </div>

            <div className="space-y-3">
              {data?.top_applications.map((app) => (
                <div key={app.application_id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{app.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono">{app.event_count} événements</span>
                      <span className="font-semibold text-indigo-400 font-mono w-12 text-right">
                        {app.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${app.percentage}%` }}
                      className="h-full bg-indigo-500 rounded-full"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Live Event Feed & SSO Auth Observability */}
        <div className="space-y-6">
          {/* SSO Auth Observability Card */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Authentification SSO (24h)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
                <span className="text-[11px] text-slate-400 block">Connexions réussies</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  {data?.successful_logins_24h || 0}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30">
                <span className="text-[11px] text-slate-400 block">Échecs / Rejets</span>
                <span className="text-xl font-bold text-rose-400 font-mono">
                  {data?.failed_logins_24h || 0}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3">
              Fournisseur OIDC central : <code className="text-slate-300">sso-a.oussamma.tn</code>
            </p>
          </div>

          {/* Real-Time Live Feed */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <h3 className="text-sm font-semibold text-white">Flux Direct (SSE)</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Temps réel</span>
            </div>

            <div className="space-y-2.5">
              {(liveEvents.length > 0
                ? liveEvents
                : [
                    { app: 'drive', type: 'file.downloaded', actor: 'user-oussamma-001', time: '12:04:12', outcome: 'success' },
                    { app: 'messenger', type: 'message.sent', actor: 'user-demo-sarah', time: '12:03:55', outcome: 'success' },
                    { app: 'cv-builder', type: 'cv.exported_pdf', actor: 'user-oussamma-001', time: '12:01:10', outcome: 'success' },
                    { app: 'sso', type: 'sso.login', actor: 'user-demo-amine', time: '11:59:40', outcome: 'success' },
                  ]
              ).map((ev, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    {ev.outcome === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-200 block">{ev.type}</span>
                      <span className="text-[10px] text-slate-400">
                        {ev.app} • {ev.actor}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{ev.time}</span>
                </div>
              ))}
            </div>

            <Link
              href="/events"
              className="mt-4 block text-center text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Consulter le journal global complet →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
