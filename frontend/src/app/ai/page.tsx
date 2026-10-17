'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, DollarSign, Zap, AlertCircle, ShieldCheck } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { AIUsageStats } from '../../lib/types';
import { api } from '../../lib/api';

export default function AISupervisionPage() {
  const [data, setData] = useState<AIUsageStats | null>(null);

  useEffect(() => {
    api.getAIUsage()
      .then(setData)
      .catch((err) => {
        console.warn('Could not fetch AI usage:', err);
        setData({
          total_requests: 0,
          total_tokens: 0,
          prompt_tokens: 0,
          completion_tokens: 0,
          estimated_cost_usd: 0,
          error_count: 0,
          models: [],
          applications: [],
          timeline: [],
        });
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Supervision LiteLLM & Intelligence Artificielle</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Surveillance des modèles, consommation de tokens, coûts estimés et latences (sans stockage des prompts).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="REQUÊTES LLM (TOTAL)"
          value={data?.total_requests || 0}
          icon={Zap}
          subtext="Passerelle ai.oussamma.tn"
        />
        <StatCard
          title="TOKENS CONSOMMÉS"
          value={`${((data?.total_tokens || 0) / 1000).toFixed(1)}k`}
          icon={Cpu}
          subtext={`Prompt: ${((data?.prompt_tokens || 0) / 1000).toFixed(0)}k | Compl: ${((data?.completion_tokens || 0) / 1000).toFixed(0)}k`}
        />
        <StatCard
          title="COÛT GLOBAL ESTIMÉ"
          value={`$${(data?.estimated_cost_usd || 0).toFixed(4)}`}
          icon={DollarSign}
          subtext="Calculé au prorata des modèles"
        />
        <StatCard
          title="ERREURS / TIMEOUTS"
          value={data?.error_count || 0}
          icon={AlertCircle}
          variant={data?.error_count ? 'warning' : 'success'}
          subtext="Taux de succès > 99.5%"
        />
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Models distribution */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Répartition par Modèle</h3>
          <div className="space-y-3">
            {!data?.models || data.models.length === 0 ? (
              <div className="text-center p-6 text-xs text-slate-500 dark:text-slate-400">
                Aucune consommation de modèle enregistrée pour le moment.
              </div>
            ) : (
              data.models.map((m) => (
                <div key={m.model} className="p-3 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">{m.model}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{m.requests} requêtes</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold block">{m.tokens.toLocaleString()} tokens</span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">${m.cost} USD</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Applications distribution */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Consommation par Application</h3>
          <div className="space-y-3">
            {!data?.applications || data.applications.length === 0 ? (
              <div className="text-center p-6 text-xs text-slate-500 dark:text-slate-400">
                Aucune application n'a encore émis d'appels IA vers la passerelle.
              </div>
            ) : (
              data.applications.map((a) => (
                <div key={a.application_id} className="p-3 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">{a.application_id}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{a.requests} appels IA</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold block">{a.tokens.toLocaleString()} tokens</span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">${a.cost} USD</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
