import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  subtext?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
}

export default function StatCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  subtext,
  variant = 'default',
}: StatCardProps) {
  const borderStyles = {
    default: 'border-slate-800 hover:border-slate-700',
    danger: 'border-rose-900/40 bg-rose-950/10 hover:border-rose-800/60',
    warning: 'border-amber-900/40 bg-amber-950/10 hover:border-amber-800/60',
    success: 'border-emerald-900/40 bg-emerald-950/10 hover:border-emerald-800/60',
  }[variant];

  const iconColors = {
    default: 'text-indigo-400 bg-indigo-500/10',
    danger: 'text-rose-400 bg-rose-500/10',
    warning: 'text-amber-400 bg-amber-500/10',
    success: 'text-emerald-400 bg-emerald-500/10',
  }[variant];

  return (
    <div
      className={`p-5 rounded-xl bg-slate-900/60 border ${borderStyles} transition-all duration-200 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColors}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {change && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              isPositive
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-rose-400 bg-rose-500/10'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {subtext && <p className="mt-1 text-[11px] text-slate-500">{subtext}</p>}
    </div>
  );
}
