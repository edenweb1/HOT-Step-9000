import React, { useState, useEffect } from 'react';
import { llmApi, LlmProviderInfo } from '../../services/api';

interface ProviderSelectorProps {
  selectedProvider: string;
  selectedModel: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  label?: string;
  compact?: boolean;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  label = 'LLM Provider',
  compact = false,
}) => {
  const [providers, setProviders] = useState<LlmProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    llmApi.getProviders()
      .then(res => {
        setProviders(res.providers.filter(p => p.available));
        // Auto-select first available provider if none selected
        if (!selectedProvider && res.providers.length > 0) {
          const first = res.providers.find(p => p.available);
          if (first) {
            onProviderChange(first.id);
            if (first.default_model) onModelChange(first.default_model);
          }
        }
      })
      .catch(err => console.error('Failed to load LLM providers:', err))
      .finally(() => setLoading(false));
  }, []);

  const currentProvider = providers.find(p => p.id === selectedProvider);
  const models = currentProvider?.models || [];

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-xs text-zinc-500 ${compact ? '' : 'mb-3'}`}>
        <div className="w-3 h-3 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
        Loading providers…
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className={`text-xs text-amber-400 ${compact ? '' : 'mb-3'}`}>
        ⚠ No LLM providers configured. Open Settings → LLM to add one.
      </div>
    );
  }

  return (
    <div className={`flex ${compact ? 'flex-row items-center gap-2' : 'flex-col gap-2'}`}>
      {!compact && <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</label>}
      <div className={`flex ${compact ? 'flex-row' : 'flex-row'} gap-2 flex-1`}>
        <select
          value={selectedProvider}
          onChange={e => {
            const pid = e.target.value;
            onProviderChange(pid);
            const prov = providers.find(p => p.id === pid);
            if (prov?.default_model) onModelChange(prov.default_model);
          }}
          className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-white/10 text-sm text-white focus:outline-none focus:border-pink-500/50 appearance-none cursor-pointer"
          title="LLM Provider"
        >
          {providers.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={selectedModel}
          onChange={e => onModelChange(e.target.value)}
          className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-white/10 text-sm text-white focus:outline-none focus:border-pink-500/50 appearance-none cursor-pointer"
          title="Model"
        >
          {models.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
          {models.length === 0 && <option value="">No models</option>}
        </select>
      </div>
    </div>
  );
};
