'use client';

import React, { useState } from 'react';
import { Bot, Send, Sparkles, Database, Shield, Clock } from 'lucide-react';
import { api } from '@/lib/api';

const samplePrompts = [
  "Qu'a fait cet utilisateur aujourd'hui ?",
  "Combien d'utilisateurs se sont connectés ces dernières 24 heures ?",
  "Quelles sont les applications les plus utilisées dans l'écosystème ?",
  "Quelle est la consommation IA de la semaine sur LiteLLM ?",
  "Quelles activités inhabituelles ou alertes ont été détectées ?",
];

export default function AssistantPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content:
        "Bonjour Oussamma. Je suis votre Assistant de Supervision IA. Je peux interroger les journaux d'activité, les métriques d'authentification SSO, les consommations LiteLLM et les alertes de sécurité en temps réel.",
      tools: [],
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.queryAssistant(q);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.answer,
          tools: res.tool_calls || [],
          execution_time_ms: res.execution_time_ms,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "Erreur lors de la communication avec le superviseur. Vérifiez la disponibilité du backend.",
          tools: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Bot className="w-6 h-6 text-indigo-400" />
          <span>Assistant IA Superviseur</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Interrogez l'écosystème en langage naturel (LiteLLM + requêtes analytiques sécurisées).
        </p>
      </div>

      {/* Suggested chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 text-left transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              m.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-2.5 ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              {/* Tool Execution Badges if assistant used tools */}
              {m.tools && m.tools.length > 0 && (
                <div className="space-y-1 pb-2 border-b border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span>Outils de supervision exécutés :</span>
                  </span>
                  {m.tools.map((t: any, tidx: number) => (
                    <div
                      key={tidx}
                      className="text-[11px] font-mono text-slate-400 bg-slate-900 p-1.5 rounded border border-slate-800/80"
                    >
                      • <strong>{t.tool}</strong>: {t.result_summary}
                    </div>
                  ))}
                </div>
              )}

              <p className="whitespace-pre-line">{m.content}</p>

              {m.execution_time_ms !== undefined && (
                <div className="text-[10px] text-slate-500 font-mono text-right flex items-center justify-end gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{m.execution_time_ms} ms</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Consultation des bases de télémétrie en cours...</span>
          </div>
        )}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Posez une question sur l'écosystème (ex: Qu'a fait cet utilisateur aujourd'hui ?)..."
          className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white p-2 rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
