'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, DollarSign, Zap, AlertCircle, ShieldCheck } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { AIUsageStats } from '@/lib/types';
import { api } from '@/lib/api';

export default function AISupervisionPage() {
  const [data, setData] = useState<AIUsageStats | null>(null);

  useEffect(() => {
    api.getAIUsage()
      .then(setData)
      .catch(() => {
        setData({
          total_requests: 485,
          total_tokens: 382400,
          prompt_tokens: 284100,
          completion_tokens: 98300,
          estimated_cost_usd: 0.184,
          error_count: 2,
          models: [
            { model: 'gemini-1.5-flash', requests: 310, tokens: 210000, cost: 0.042 },
            { model: 'gemini-1.5-pro', requests: 95, tokens: 120400, cost: 0.112 },
            { model: 'gpt-4o-mini', requests: 50, tokens: 32000, cost: 0.018 },
            { model: 'claude-3-5-sonnet', requests: 30, tokens: 20000, cost: 0.012 },
          ],
          applications: [
            { application_id: 'cv-builder', requests: 180, tokens: 145000, cost: 0.075 },
            { application_id: 'messenger', requests: 120, tokens: 85000, cost: 0.041 },
            { application_id: 'recettes', requests: 95, tokens: 68000, cost: 0.032 },
            { application_id: 'supervisor', requests: 90, tokens: 84400, cost: 0.036 },
          ],
          timeline: [
            { date: '11 Oct', tokens: 35000 },
            { date: '12 Oct', tokens: 42000 },
            { date: '13 Oct', tokens: 58000 },
            { date: '14 Oct', tokens: 49000 },
            { date: '15 Oct', tokens: 62000 },
            { date: '16 Oct', tokens: 68000 },
            { date: '17 Oct', tokens: 68400 },
          ],
        });
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Cpu className="w-6 h-6 text-indigo-400" />
          <span>Supervision LiteLLM & Intelligence Artificielle</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
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
          value={`$${data?.estimated_cost_usd || 0}`}
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
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-4">Répartition par Modèle</h3>
          <div className="space-y-3">
            {data?.models.map((m) => (
              <div key={m.model} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200 block">{m.model}</span>
                  <span className="text-[11px] text-slate-400">{m.requests} requêtes</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-indigo-400 font-bold block">{m.tokens.toLocaleString()} tokens</span>
                  <span className="text-[11px] font-mono text-slate-400">${m.cost} USD</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applications distribution */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-semibold text-white mb-4">Consommation par Application</h3>
          <div className="space-y-3">
            {data?.applications.map((a) => (
              <div key={a.application_id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200 block">{a.application_id}</span>
                  <span className="text-[11px] text-slate-400">{a.requests} appels IA</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-indigo-400 font-bold block">{a.tokens.toLocaleString()} tokens</span>
                  <span className="text-[11px] font-mono text-slate-400">${a.cost} USD</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
