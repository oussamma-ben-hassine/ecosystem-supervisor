'use client';

import React from 'react';
import { Bell, Search, ExternalLink, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Global Search Bar */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher utilisateur, événement, application..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* SSO Portal quick link */}
        <a
          href="https://sso-a.oussamma.tn"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors px-2.5 py-1.5 rounded-md hover:bg-slate-800/50"
        >
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span>SSO Auth</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>

        {/* Alerts Bell */}
        <Link
          href="/alerts"
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors relative"
          title="Alertes actives"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
            OB
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-medium text-slate-200 block">Oussamma B.</span>
            <span className="text-[10px] text-emerald-400 font-mono block">Administrateur</span>
          </div>
        </div>
      </div>
    </header>
  );
}
