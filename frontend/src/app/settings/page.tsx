'use client';

import React from 'react';
import { Settings, Shield, Clock, Database, Lock, Server } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Paramètres & Politiques de Rétention</span>
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Gouvernance des données, cycle de purge, sécurité des endpoints et conformité RGPD.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Retention Policies */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Politiques de Rétention & Purge Automatique</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Événements d'Audit Globaux
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">activity_events</span>
              </div>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">365 jours</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Journal d'Authentification
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">auth_events</span>
              </div>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">180 jours</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Télémétrie IA & Tokens
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">ai_usage_events</span>
              </div>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">90 jours</span>
            </div>
          </div>
        </div>

        {/* Security Parameters */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Sécurité & Confidentialité</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Ingestion Serveur-à-Serveur
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">En-tête X-Supervisor-Key</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                Activé & Strict
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Confidentialité des Contenus
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Pas de stockage des corps privés</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
                Conforme
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Fournisseur SSO Unique
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">sso-a.oussamma.tn</span>
              </div>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">OIDC Verifié</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
