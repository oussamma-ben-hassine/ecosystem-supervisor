'use client';

import React, { useEffect, useState } from 'react';
import { HardDrive, FileText, Download, Share2, Trash2, ShieldAlert } from 'lucide-react';

export default function DataSupervisionPage() {
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/data/resources')
      .then((r) => r.json())
      .then((data) => setResources(data.items || []))
      .catch(() => {
        setResources([
          { id: 'file:f-4421', resource_type: 'file', name: 'architecture_2026.pdf', application_id: 'drive', owner_sub: 'user-oussamma-001', size_bytes: 4200000, mime_type: 'application/pdf', is_deleted: false, last_action_at: '2026-10-17T06:12:00Z' },
          { id: 'cv:cv-lead', resource_type: 'cv', name: 'CV Architecte Cloud.pdf', application_id: 'cv-builder', owner_sub: 'user-oussamma-001', size_bytes: 840000, mime_type: 'application/pdf', is_deleted: false, last_action_at: '2026-10-17T05:50:00Z' },
          { id: 'note:n-devops', resource_type: 'note', name: 'Coolify Deployment Guide', application_id: 'notes', owner_sub: 'user-demo-sarah', size_bytes: 12000, mime_type: 'text/markdown', is_deleted: false, last_action_at: '2026-10-17T04:20:00Z' },
          { id: 'recipe:r-couscous', resource_type: 'recipe', name: 'Couscous Tunisien Royal', application_id: 'recettes', owner_sub: 'user-demo-sarah', size_bytes: 5400, mime_type: 'application/json', is_deleted: false, last_action_at: '2026-10-16T19:30:00Z' },
        ]);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Supervision des Données & Cycle de Vie</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Surveillance des créations, partages, téléchargements et suppressions (zéro stockage des contenus privés).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Ressources Référencées</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">{resources.length}</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Volume Total Manipulé</span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">5.05 Mo</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Politique de Confidentialité</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2 block">Métadonnées seules</span>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Ressource</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Application</th>
                <th className="py-3 px-4">Propriétaire</th>
                <th className="py-3 px-4">Taille</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Dernière Opération</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {resources.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{r.name}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">{r.resource_type}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{r.application_id}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{r.owner_sub}</td>
                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                    {(r.size_bytes / 1024).toFixed(1)} Ko
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                      Actif
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{r.last_action_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
