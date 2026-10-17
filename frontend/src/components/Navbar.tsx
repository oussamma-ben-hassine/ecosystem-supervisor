'use client';

import React from 'react';
import { Bell, Search, ExternalLink, Shield, Menu, Sun, Moon, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { useMobileMenu } from './MobileMenuContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { toggle: toggleMobileMenu } = useMobileMenu();

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      sessionStorage.clear();
      window.location.href = 'https://sso-a.oussamma.tn/logout';
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Menu Toggle & Brand for mobile */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (hidden on very small screens, visible on md+) */}
        <div className="hidden sm:flex items-center gap-3 w-64 md:w-96">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher utilisateur, événement..."
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-black/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-medium transition-all shadow-sm"
          title={theme === 'dark' ? 'Basculer en mode blanc' : 'Basculer en mode sombre'}
          aria-label="Basculer le thème"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Mode Clair</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Mode Sombre</span>
            </>
          )}
        </button>

        {/* SSO Portal quick link */}
        <a
          href="https://sso-a.oussamma.tn"
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/5"
        >
          <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>SSO Auth</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        {/* Alerts Bell */}
        <Link
          href="/alerts"
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors relative"
          title="Alertes actives"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#121212]"></span>
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            OB
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
              Oussamma B.
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block leading-tight">
              Admin
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-semibold transition-all shadow-xs"
          title="Se déconnecter"
          aria-label="Se déconnecter"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
