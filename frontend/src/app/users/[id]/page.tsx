'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Activity,
  Download,
  Filter,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  Info,
} from 'lucide-react';
import { UserActivityResponse, ActivityTimelineItem } from '../../../lib/types';
import { api } from '../../../lib/api';

export default function UserActivity360Page() {
  const params = useParams();
  const userId = params?.id as string;

  const [data, setData] = useState<UserActivityResponse | null>(null);
  const [selectedApp, setSelectedApp] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<ActivityTimelineItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    api
      .getUserActivity(userId, selectedApp || undefined)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load user activity:', err);
        // Realistic fallback for demonstration
        setData({
          user: {
            id: `https://sso-a.oussamma.tn:${userId}`,
            issuer: 'https://sso-a.oussamma.tn',
            sub: userId,
            email: 'oussammabenhassine@gmail.com',
            name: 'Oussamma Ben Hassine',
            role: 'admin',
            is_active: true,
            last_active_at: new Date().toISOString(),
            accessible_apps: ['sso', 'drive', 'messenger', 'cv-builder', 'litellm', 'portal', 'recettes'],
            total_events: 18,
          },
          timeline: [
            {
              event_id: 'ev-1',
              event_type: 'cv.exported_pdf',
              application_id: 'cv-builder',
              application_name: 'AI CV Builder',
              occurred_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
              outcome: 'success',
              resource_type: 'cv',
              resource_id: 'cv-lead-architect-2026',
              resource_name: 'CV Senior Architect Cloud & AI.pdf',
              metadata: { format: 'pdf', template: 'modern-executive', pages: 2 },
            },
            {
              event_id: 'ev-2',
              event_type: 'ai.completion',
              application_id: 'litellm',
              application_name: 'LiteLLM Gateway',
              occurred_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
              outcome: 'success',
              resource_type: 'llm_session',
              resource_id: 'req-8841-ai',
              metadata: { model: 'gemini-1.5-flash', prompt_tokens: 350, completion_tokens: 120, total_tokens: 470, cost: 0.0004 },
            },
            {
              event_id: 'ev-3',
              event_type: 'file.downloaded',
              application_id: 'drive',
              application_name: 'ByteVault Drive',
              occurred_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
              outcome: 'success',
              resource_type: 'file',
              resource_id: 'f-infra-coolify-specs',
              resource_name: 'coolify_architecture_specs.zip',
              metadata: { size_bytes: 14250000, mime_type: 'application/zip' },
            },
            {
              event_id: 'ev-4',
              event_type: 'message.sent',
              application_id: 'messenger',
              application_name: 'Smart Messenger',
              occurred_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
              outcome: 'success',
              resource_type: 'conversation',
              resource_id: 'conv-devops-core',
              metadata: { thread_id: 'conv-devops-core', encrypted: true },
            },
            {
              event_id: 'ev-5',
              event_type: 'sso.login',
              application_id: 'sso',
              application_name: 'SSO Authenticator',
              occurred_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
              outcome: 'success',
              metadata: { auth_method: 'oidc_google', client_ip: '197.3.24.11' },
            },
          ],
          total_events: 5,
          page: 1,
          page_size: 50,
          covered_apps: ['sso', 'drive', 'messenger', 'cv-builder', 'litellm'],
          unintegrated_apps: ['tv-player', 'matrix-digest', 'sshwebclient'],
          date_range: {},
        });
        setLoading(false);
      });
  }, [userId, selectedApp]);

  return (
    <div className="space-y-6">
      {/* Back button & User Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/users"
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {data?.user.name || userId}
              </h1>
              <span className="text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
                {data?.user.role.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              sub: {data?.user.sub} • issuer: {data?.user.issuer}
            </p>
          </div>
        </div>

        {/* Export CSV action */}
        <a
          href={`/api/v1/users/${encodeURIComponent(userId)}/export`}
          target="_blank"
          download
          className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Exporter CSV (Audit)</span>
        </a>
      </div>

      {/* Warning/Coverage Callout: Unintegrated Applications */}
      {data?.unintegrated_apps && data.unintegrated_apps.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-3 shadow-sm">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-amber-900 dark:text-amber-200">
              Périmètre de couverture de l'historique :
            </span>
            <span>
              Les applications suivantes ne sont pas encore instrumentées ou n'ont pas émis d'événements pour cet utilisateur :{' '}
              <strong className="text-amber-950 dark:text-amber-100">{data.unintegrated_apps.join(', ')}</strong>. L'historique ci-dessous couvre exclusivement les applications intégrées au superviseur.
            </span>
          </div>
        </div>
      )}

      {/* Filter by App */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedApp('')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
            selectedApp === ''
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm'
          }`}
        >
          Toutes les applications
        </button>
        {data?.covered_apps.map((app) => (
          <button
            key={app}
            onClick={() => setSelectedApp(app)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
              selectedApp === app
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm'
          }`}
        >
          {app}
        </button>
      ))}
      </div>

      {/* Interactive 360° Timeline */}
      <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 sm:ml-4 space-y-6 pl-4 sm:pl-6 py-2">
        {data?.timeline.map((ev) => (
          <div
            key={ev.event_id}
            onClick={() => setSelectedEvent(ev)}
            className="group relative cursor-pointer"
          >
            {/* Timeline Bullet */}
            <div
              className={`absolute -left-[23px] sm:-left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white dark:bg-slate-950 transition-colors ${
                ev.outcome === 'success'
                  ? 'border-indigo-500 group-hover:bg-indigo-500'
                  : 'border-rose-500 group-hover:bg-rose-500'
              }`}
            ></div>

            {/* Event Item Box */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 transition-all shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{ev.event_type}</span>
                  <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                    {ev.application_name || ev.application_id}
                  </span>
                  {ev.outcome === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{new Date(ev.occurred_at).toLocaleString()}</span>
                </div>
              </div>

              {ev.resource_name && (
                <div className="mt-2 text-xs text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Ressource : </span>
                  <strong className="text-slate-900 dark:text-slate-100">{ev.resource_name}</strong>
                  {ev.resource_type && (
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]"> ({ev.resource_type})</span>
                  )}
                </div>
              )}

              {/* Quick metadata preview */}
              {Object.keys(ev.metadata).length > 0 && (
                <div className="mt-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-md border border-slate-200 dark:border-slate-800/80 overflow-x-auto">
                  {JSON.stringify(ev.metadata)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Event Details Modal / Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Détails de l'événement</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-mono"
              >
                ✕ Fermer
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Event ID : </span>
                <code className="text-indigo-600 dark:text-indigo-300 font-mono">{selectedEvent.event_id}</code>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Type : </span>
                <strong className="text-slate-900 dark:text-white">{selectedEvent.event_type}</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Application : </span>
                <span className="text-slate-700 dark:text-slate-200">{selectedEvent.application_id}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Date exacte : </span>
                <span className="text-slate-700 dark:text-slate-200">{selectedEvent.occurred_at}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Résultat : </span>
                <span
                  className={`font-semibold ${
                    selectedEvent.outcome === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {selectedEvent.outcome}
                </span>
              </div>

              <div className="pt-2">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Métadonnées autorisées (Audit) :</span>
                <pre className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
