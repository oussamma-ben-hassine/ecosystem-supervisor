'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { AnalyticsOverview } from '../../lib/types';
import { api } from '../../lib/api';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    api.getOverview().then(setData).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <span>Statistiques & Analytics Avancés</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Analyse des cohortes, taux d'engagement (DAU/WAU/MAU) et fréquences d'utilisation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="DAU (DAILY ACTIVE USERS)"
          value={data?.dau || 3}
          subtext="Utilisateurs uniques sur 24h"
          icon={Users}
        />
        <StatCard
          title="WAU (WEEKLY ACTIVE USERS)"
          value={data?.wau || 4}
          subtext="Utilisateurs uniques sur 7 jours"
          icon={Calendar}
        />
        <StatCard
          title="MAU (MONTHLY ACTIVE USERS)"
          value={data?.mau || 4}
          subtext="Utilisateurs uniques sur 30 jours"
          icon={TrendingUp}
        />
      </div>

      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <h3 className="text-sm font-semibold text-white mb-4">Volume d'Activité sur 7 Jours</h3>
        <div className="h-52 flex items-end gap-3 pt-6 px-2">
          {data?.activity_trend_7d.map((pt, idx) => {
            const max = Math.max(...(data?.activity_trend_7d.map((p) => p.count) || [100]));
            const heightPct = Math.max(12, Math.round((pt.count / (max || 1)) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-mono text-slate-400">{pt.count}</span>
                <div className="w-full bg-slate-800 rounded-t-md overflow-hidden h-36 flex items-end">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-indigo-600 rounded-t-md group-hover:bg-indigo-500 transition-all"
                  ></div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{pt.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
