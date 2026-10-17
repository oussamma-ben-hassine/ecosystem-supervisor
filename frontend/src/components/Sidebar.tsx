'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Activity,
  HardDrive,
  Grid,
  BarChart3,
  Cpu,
  AlertTriangle,
  Bot,
  Settings,
  ShieldCheck,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react';
import { useMobileMenu } from './MobileMenuContext';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Utilisateurs 360°', href: '/users', icon: Users },
  { name: 'Journal Activités', href: '/events', icon: Activity },
  { name: 'Supervision Données', href: '/data', icon: HardDrive },
  { name: 'Applications', href: '/applications', icon: Grid },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Supervision IA', href: '/ai', icon: Cpu },
  { name: 'Alertes', href: '/alerts', icon: AlertTriangle },
  { name: 'Assistant IA', href: '/assistant', icon: Bot },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useMobileMenu();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={close}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 lg:w-64 bg-white dark:bg-[#121212] border-r border-slate-200 dark:border-white/10 flex flex-col shrink-0 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/10">
          <Link href="/" onClick={close} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight block">
                SUPERVISOR
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase block">
                oussamma.tn
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={close}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User / Logout Section */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs">
              OB
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                Oussamma B.
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block">
                Administrateur
              </span>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                await fetch('/api/v1/auth/logout', { method: 'POST' });
              } catch {}
              if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
                sessionStorage.clear();
                window.location.href = 'https://sso-a.oussamma.tn/logout';
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Se déconnecter"
            aria-label="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* System Status Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Écosystème actif
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-white/10 px-2 py-0.5 rounded font-mono font-medium">
              v1.0.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
