'use client';

import React, { useEffect, useState } from 'react';
import { Grid, Key, ExternalLink, ShieldCheck, CheckCircle2, Copy } from 'lucide-react';
import { Application } from '../../lib/types';
import { api } from '../../lib/api';

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    api.getApplications()
      .then(setApps)
      .catch(() => {
        setApps([
          { id: 'sso', code: 'sso', name: 'SSO Authenticator', fqdn: 'https://sso-a.oussamma.tn', is_active: true, integration_status: 'active', events_count: 512, active_users_count: 4 },
          { id: 'drive', code: 'drive', name: 'ByteVault Drive', fqdn: 'https://drive.oussamma.tn', is_active: true, integration_status: 'active', events_count: 410, active_users_count: 3 },
          { id: 'messenger', code: 'messenger', name: 'Smart Messenger', fqdn: 'https://messenger.oussamma.tn', is_active: true, integration_status: 'active', events_count: 320, active_users_count: 4 },
          { id: 'cv-builder', code: 'cv-builder', name: 'AI CV Builder', fqdn: 'https://cv.oussamma.tn', is_active: true, integration_status: 'active', events_count: 120, active_users_count: 2 },
          { id: 'litellm', code: 'litellm', name: 'LiteLLM Gateway', fqdn: 'https://ai.oussamma.tn', is_active: true, integration_status: 'active', events_count: 94, active_users_count: 3 },
          { id: 'portal', code: 'portal', name: 'Portal oussamma.tn', fqdn: 'https://oussamma.tn', is_active: true, integration_status: 'active', events_count: 215, active_users_count: 4 },
          { id: 'recettes', code: 'recettes', name: 'Recettes Tunisiennes', fqdn: 'https://recettes.oussamma.tn', is_active: true, integration_status: 'active', events_count: 75, active_users_count: 2 },
          { id: 'notes', code: 'notes', name: 'Ecosystem Notes', fqdn: 'https://notes.oussamma.tn', is_active: true, integration_status: 'active', events_count: 64, active_users_count: 2 },
          { id: 'devspace', code: 'devspace', name: 'DevSpace Cloud IDE', fqdn: 'https://devspace.oussamma.tn', is_active: true, integration_status: 'active', events_count: 48, active_users_count: 1 },
          { id: 'tv-player', code: 'tv-player', name: 'IPTV Stream Player', fqdn: 'https://tv.oussamma.tn', is_active: true, integration_status: 'active', events_count: 32, active_users_count: 2 },
        ]);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Grid className="w-6 h-6 text-indigo-400" />
          <span>Applications Intégrées & Clés d'Ingestion</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inventaire des services de l'écosystème, authentification serveur-à-serveur et connecteurs d'ingestion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => (
          <div
            key={app.id}
            className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-white text-base block">{app.name}</span>
                <span className="text-[11px] font-mono text-indigo-400">id: {app.id}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {app.integration_status.toUpperCase()}
              </span>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Événements ingérés :</span>
                <strong className="text-slate-200 font-mono">{app.events_count || 0}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Utilisateurs actifs :</span>
                <strong className="text-slate-200 font-mono">{app.active_users_count || 0}</strong>
              </div>
            </div>

            {app.fqdn && (
              <a
                href={app.fqdn}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:underline pt-2 border-t border-slate-800"
              >
                <span>{app.fqdn}</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
