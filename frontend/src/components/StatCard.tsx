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
    default:
      'border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212] hover:border-slate-300 dark:hover:border-white/20',
    danger:
      'border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-800/60',
    warning:
      'border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 hover:border-amber-300 dark:hover:border-amber-800/60',
    success:
      'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-800/60',
  }[variant];

  const iconColors = {
    default: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10',
    danger: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10',
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10',
  }[variant];

  return (
    <div
      className={`p-5 rounded-xl border ${borderStyles} transition-all duration-200 shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColors}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10'
                : 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">{subtext}</p>
      )}
    </div>
  );
}
