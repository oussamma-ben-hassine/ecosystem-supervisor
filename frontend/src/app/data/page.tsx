'use client';

import React, { useEffect, useState } from 'react';
import { HardDrive, FileText, Download, Share2, Trash2, ShieldAlert } from 'lucide-react';

export default function DataSupervisionPage() {
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/data/resources')
      .then((r) => r.json())
      .then((data) => setResources(data.items || []))
      .catch((err) => {
        console.warn('Could not fetch resources:', err);
        setResources([]);
      });
  }, []);

  const totalBytes = resources.reduce((acc, r) => acc + (r.size_bytes || 0), 0);
  const formattedSize =
    totalBytes > 1024 * 1024
      ? `${(totalBytes / (1024 * 1024)).toFixed(2)} Mo`
      : `${(totalBytes / 1024).toFixed(1)} Ko`;

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
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">{formattedSize}</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Politique de Confidentialité</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2 block">Métadonnées seules</span>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {resources.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs space-y-2">
            <HardDrive className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto opacity-50" />
            <p className="font-medium text-slate-700 dark:text-slate-300">Aucune ressource répertoriée pour le moment</p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Les métadonnées des documents et fichiers (Drive, Notes, CV Builder, etc.) apparaîtront ici automatiquement dès leur manipulation.
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
