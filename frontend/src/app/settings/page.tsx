'use client';

import React from 'react';
import { Settings, Shield, Clock, Database, Lock, Server } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>Paramètres & Politiques de Rétention</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Gouvernance des données, cycle de purge, sécurité des endpoints et conformité RGPD.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Retention Policies */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Politiques de Rétention & Purge Automatique</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Événements d'Audit Globaux</span>
                <span className="text-[11px] text-slate-400">activity_events</span>
              </div>
              <span className="font-mono text-indigo-400 font-bold">365 jours</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Journal d'Authentification</span>
                <span className="text-[11px] text-slate-400">auth_events</span>
              </div>
              <span className="font-mono text-indigo-400 font-bold">180 jours</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Télémétrie IA & Tokens</span>
                <span className="text-[11px] text-slate-400">ai_usage_events</span>
              </div>
              <span className="font-mono text-indigo-400 font-bold">90 jours</span>
            </div>
          </div>
        </div>

        {/* Security Parameters */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Sécurité & Confidentialité</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Minimisation des données personnelles</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Aucun mot de passe, secret de session, token d'accès ou corps de message privé n'est collecté.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
              <Server className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Authentification technique serveur-à-serveur</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Chaque application possède sa propre clé API d'ingestion vérifiée côté backend avec hachage SHA-256.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
