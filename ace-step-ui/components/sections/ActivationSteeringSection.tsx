import React, { useState, useEffect } from 'react';
import { Sliders, ChevronDown, Plus, Trash2, Cpu, FileText, Check, Loader2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { steeringApi, SteeringStatus } from '../../services/api';
import { EditableSlider } from '../EditableSlider';

interface ActivationSteeringSectionProps {
    customMode: boolean;
    isOpen: boolean;
    onToggle: () => void;
    onSteeringChange: (enabled: boolean, loadedConcepts: string[], alphas: Record<string, number>) => void;
}

export const ActivationSteeringSection: React.FC<ActivationSteeringSectionProps> = ({
    customMode,
    isOpen,
    onToggle,
    onSteeringChange,
}) => {
    const { token } = useAuth();
    const [status, setStatus] = useState<SteeringStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Compute form state
    const [isComputeMode, setIsComputeMode] = useState(false);
    const [isComputing, setIsComputing] = useState(false);
    const [steeringMsg, setSteeringMsg] = useState('');

    // Bulk queue state
    const [steeringSelectedConcept, setSteeringSelectedConcept] = useState('');
    const [steeringCustomConcepts, setSteeringCustomConcepts] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ace-steeringCustomConcepts') || '""'); } catch { return ''; }
    });
    const [steeringSteps, setSteeringSteps] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ace-steeringSteps') || '30'); } catch { return 30; }
    });
    const [steeringSamples, setSteeringSamples] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ace-steeringSamples') || '50'); } catch { return 50; }
    });

    // Custom base overrides
    const [steeringCustomBase, setSteeringCustomBase] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ace-steeringCustomBase') || 'false'); } catch { return false; }
    });
    const [steeringBasePromptsText, setSteeringBasePromptsText] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ace-steeringBasePromptsText') || '""'); } catch { return ''; }
    });

    const fetchStatus = async () => {
        if (!token) return;
        try {
            const data = await steeringApi.getConcepts(token);
            setStatus(data);
            notifyParent(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch steering status');
        }
    };

    useEffect(() => {
        if (isOpen && !status) {
            fetchStatus();
        }
    }, [isOpen, status, token]);

    const notifyParent = (data: SteeringStatus) => {
        const alphas: Record<string, number> = {};
        for (const concept of data.loaded_concepts) {
            alphas[concept] = data.config[concept]?.alpha || 10.0;
        }
        onSteeringChange(data.enabled, data.loaded_concepts, alphas);
    };

    const handleEnableToggle = async () => {
        if (!token || !status) return;
        setIsLoading(true);
        try {
            const result = await steeringApi.enable(!status.enabled, token);
            setStatus(result);
            notifyParent(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadConcept = async (concept: string) => {
        if (!token) return;
        setIsLoading(true);
        try {
            const result = await steeringApi.load(concept, token);
            setStatus(result);
            notifyParent(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnloadConcept = async (concept: string) => {
        if (!token) return;
        setIsLoading(true);
        try {
            const result = await steeringApi.unload(concept, token);
            setStatus(result);
            notifyParent(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAlphaChange = async (concept: string, alpha: number) => {
        if (!token || !status) return;
        try {
            // Optimistic update
            const newStatus = { ...status };
            if (!newStatus.config[concept]) newStatus.config[concept] = { alpha, layers: 'all', mode: 'add' };
            else newStatus.config[concept].alpha = alpha;
            setStatus(newStatus);
            notifyParent(newStatus);

            await steeringApi.config({ concept, alpha }, token);
        } catch (err) {
            // Background failure silently ignored or could flash error
        }
    };

    const handleComputeQueue = async () => {
        if (!token) return;
        setIsComputing(true);
        setError(null);
        setSteeringMsg('');

        const builtinQueue = steeringSelectedConcept.split(',').filter(Boolean);
        const customLines = steeringCustomConcepts.split('\n').map((s: string) => s.trim()).filter(Boolean);

        const allJobs: { concept: string; positive_template?: string; negative_template?: string }[] = [];
        for (const c of builtinQueue) {
            allJobs.push({ concept: c });
        }
        for (const line of customLines) {
            // Slugify the line into a concept name for the filename
            const slug = line.replace(/^with\s+/i, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '').toLowerCase();
            allJobs.push({
                concept: slug,
                positive_template: `{p} ${line}`,
                negative_template: `{p}`,
            });
        }

        if (allJobs.length === 0) {
            setIsComputing(false);
            return;
        }

        for (let i = 0; i < allJobs.length; i++) {
            const job = allJobs[i];
            const estTime = Math.round((steeringSamples * 2 * steeringSteps) / 27);
            setSteeringMsg(`Computing ${i + 1}/${allJobs.length}: '${job.concept}' (~${estTime}s)...`);

            try {
                const computeBody: Record<string, any> = {
                    concept: job.concept,
                    num_steps: steeringSteps,
                    num_samples: steeringSamples,
                };
                if (job.positive_template) {
                    computeBody.positive_template = job.positive_template;
                    computeBody.negative_template = job.negative_template;
                }
                if (steeringCustomBase && steeringBasePromptsText.trim()) {
                    computeBody.custom_base_prompts = steeringBasePromptsText.split('\n').map((s: string) => s.trim()).filter(Boolean);
                    computeBody.num_samples = computeBody.custom_base_prompts.length;
                }

                const result = await steeringApi.compute(computeBody as any, token);
                setStatus(result);
                notifyParent(result);
            } catch (err: any) {
                setError(`Error on '${job.concept}': ${err.message}`);
                break;
            }
        }

        if (!error && allJobs.length > 0) {
            setSteeringMsg(`✅ Computed ${allJobs.length} concept${allJobs.length > 1 ? 's' : ''}`);
            try {
                const finalStatus = await steeringApi.getConcepts(token);
                setStatus(finalStatus);
                notifyParent(finalStatus);
            } catch (err) { }
            setTimeout(() => {
                setIsComputeMode(false);
                setSteeringMsg('');
            }, 2500);
        }
        setSteeringSelectedConcept('');
        setIsComputing(false);
    };

    const handleDeleteConcept = async (concept: string) => {
        if (!confirm(`Are you sure you want to permanently delete the computed vectors for '${concept}'? This cannot be undone.`)) {
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const result = await steeringApi.delete(concept, token);
            setStatus(result);
            notifyParent(result);
        } catch (err: any) {
            setError(err.message || 'Failed to delete concept');
        } finally {
            setIsLoading(false);
        }
    };

    if (!customMode) return null;

    const availableToLoad = status?.available_concepts.filter(c => !status.loaded_concepts.includes(c)) || [];

    return (
        <div>
            <button
                type="button"
                onClick={onToggle}
                className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-suno-card border border-zinc-200 dark:border-white/5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors ${isOpen ? 'rounded-t-xl rounded-b-none border-b-0' : 'rounded-xl'}`}
            >
                <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-indigo-500" />
                    <span>Activation Steering (TADA)</span>
                    {status?.loaded_concepts.length ? (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            {status.loaded_concepts.length} LOADED
                        </span>
                    ) : null}
                </div>
                <ChevronDown size={18} className={`text-indigo-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="bg-white dark:bg-suno-card rounded-b-xl rounded-t-none border border-t-0 border-zinc-200 dark:border-white/5 p-4 space-y-4">

                    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${status?.enabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className={`text-xs font-medium ${status?.enabled ? 'text-green-600 dark:text-green-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                {status?.enabled ? 'Steering Enabled' : 'Steering Disabled'}
                            </span>
                        </div>
                        <button
                            onClick={handleEnableToggle}
                            disabled={isLoading || !status}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${status?.enabled
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20'
                                : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
                                }`}
                        >
                            {status?.enabled ? 'Disable' : 'Enable'}
                        </button>
                    </div>

                    {error && (
                        <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1.5 rounded flex items-start gap-2">
                            <span className="mt-0.5">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {isComputeMode ? (
                        <div className="bg-zinc-50 dark:bg-black/20 rounded-lg p-3 space-y-3 border border-indigo-200 dark:border-indigo-500/20">
                            <div className="flex items-center justify-between">
                                <h4 className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                    <span>⚡ Compute Vectors</span>
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => setIsComputeMode(false)}
                                    className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                >
                                    Cancel
                                </button>
                            </div>

                            <p className="text-[10px] text-zinc-500">
                                Generate steering vectors for a concept. Takes ~15-30 min per concept.
                            </p>

                            {/* Multi-select concept grid */}
                            <div className="flex flex-wrap gap-1.5">
                                {(status?.builtin_concepts || []).map(c => {
                                    const isQueued = steeringSelectedConcept.split(',').filter(Boolean).includes(c);
                                    const isComputed = status?.available_concepts.includes(c);
                                    return (
                                        <button
                                            key={c}
                                            type="button"
                                            disabled={isComputing}
                                            onClick={() => {
                                                const current = steeringSelectedConcept.split(',').filter(Boolean);
                                                const next = isQueued ? current.filter(x => x !== c) : [...current, c];
                                                setSteeringSelectedConcept(next.join(','));
                                            }}
                                            className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-all ${isQueued
                                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-400'
                                                : 'bg-white dark:bg-black/20 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-amber-500/30 dark:hover:border-amber-500/30'
                                                }`}
                                        >
                                            {c} {isComputed ? '✓' : ''}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex gap-2 items-center">
                                <button
                                    type="button"
                                    disabled={(!steeringSelectedConcept && !steeringCustomConcepts.trim()) || isComputing}
                                    onClick={handleComputeQueue}
                                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1"
                                >
                                    {isComputing ? (
                                        <><Loader2 size={12} className="animate-spin" /> Computing...</>
                                    ) : (() => {
                                        const builtinCount = steeringSelectedConcept.split(',').filter(Boolean).length;
                                        const customCount = steeringCustomConcepts.split('\n').map((s: string) => s.trim()).filter(Boolean).length;
                                        const total = builtinCount + customCount;
                                        return <><Cpu size={12} /> Compute{total > 1 ? ` (${total})` : ''}</>;
                                    })()}
                                </button>
                                {steeringSelectedConcept && !isComputing && (
                                    <button
                                        type="button"
                                        onClick={() => setSteeringSelectedConcept('')}
                                        className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Compute options */}
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                    <label className="text-[10px] font-medium text-zinc-500 dark:text-zinc-500">Inference Steps</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={500}
                                        value={steeringSteps}
                                        onChange={(e) => { const v = Number(e.target.value); setSteeringSteps(v); localStorage.setItem('ace-steeringSteps', JSON.stringify(v)); }}
                                        disabled={isComputing}
                                        className="w-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-md px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-medium text-zinc-500 dark:text-zinc-500">Samples (pairs)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={50}
                                        value={steeringSamples}
                                        onChange={(e) => { const v = Number(e.target.value); setSteeringSamples(v); localStorage.setItem('ace-steeringSamples', JSON.stringify(v)); }}
                                        disabled={isComputing}
                                        className="w-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-md px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Steps should match your generation settings. More samples = better vectors but slower.</p>

                            {/* Custom concepts textarea */}
                            <div className="mt-2">
                                <label className="text-[10px] font-medium text-zinc-500 dark:text-zinc-500">Custom Concepts (one per line)</label>
                                <p className="text-[10px] text-zinc-400 mb-1">Each line is a separate vector. Example: <code className="bg-zinc-200 dark:bg-white/10 px-0.5 rounded">with heavy distorted guitar</code></p>
                                <textarea
                                    value={steeringCustomConcepts}
                                    onChange={(e) => { setSteeringCustomConcepts(e.target.value); localStorage.setItem('ace-steeringCustomConcepts', JSON.stringify(e.target.value)); }}
                                    placeholder={`with heavy distorted guitar\nwith gang vocals`}
                                    disabled={isComputing}
                                    rows={4}
                                    className="w-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-md px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none placeholder:text-zinc-400 font-mono resize-y"
                                />
                                {steeringCustomConcepts.trim() && (
                                    <p className="text-[10px] text-zinc-400 mt-0.5">{steeringCustomConcepts.split('\n').filter((s: string) => s.trim()).length} custom concepts</p>
                                )}
                            </div>

                            {/* Custom base prompts */}
                            <label className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-500 mt-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={steeringCustomBase}
                                    onChange={() => { const v = !steeringCustomBase; setSteeringCustomBase(v); localStorage.setItem('ace-steeringCustomBase', JSON.stringify(v)); }}
                                    disabled={isComputing}
                                />
                                Custom base prompts (override default genres)
                            </label>
                            {steeringCustomBase && (
                                <div className="mt-1">
                                    <p className="text-[10px] text-zinc-400 mb-1">One genre/style per line. These replace the default 50 base genres.</p>
                                    <textarea
                                        value={steeringBasePromptsText}
                                        onChange={(e) => { setSteeringBasePromptsText(e.target.value); localStorage.setItem('ace-steeringBasePromptsText', JSON.stringify(e.target.value)); }}
                                        placeholder={`a rock song\na metal song\nelectronic music`}
                                        disabled={isComputing}
                                        rows={5}
                                        className="w-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-md px-2 py-1 text-xs text-zinc-900 dark:text-white focus:outline-none placeholder:text-zinc-400 font-mono resize-y"
                                    />
                                    <p className="text-[10px] text-zinc-400 mt-0.5">{steeringBasePromptsText.split('\n').filter((s: string) => s.trim()).length} base prompts</p>
                                </div>
                            )}

                            {steeringMsg && (
                                <p className="text-[10px] text-zinc-500 italic mt-2">{steeringMsg}</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Load Concepts */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Available Concepts</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsComputeMode(true)}
                                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                    >
                                        <Plus size={10} /> Compute New
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {/* Built-in Concepts First */}
                                    {(status?.builtin_concepts || []).map(concept => {
                                        const isComputed = status?.available_concepts.includes(concept);
                                        const isLoaded = (status?.loaded_concepts || []).includes(concept);

                                        // Only show built-in concepts if they have been computed
                                        if (!isComputed) return null;

                                        return (
                                            <button
                                                key={`builtin-${concept}`}
                                                type="button"
                                                onClick={() => isLoaded ? handleUnloadConcept(concept) : handleLoadConcept(concept)}
                                                disabled={isLoading}
                                                className={`px-2 py-1 rounded text-xs font-medium border transition-colors flex items-center gap-1 ${isLoaded
                                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500/30 dark:text-indigo-300'
                                                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-black/20 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                {concept}
                                                {isLoaded && <Check size={12} />}
                                            </button>
                                        );
                                    })}

                                    {/* Custom Concepts Second */}
                                    {(status?.available_concepts || []).filter(c => !(status?.builtin_concepts || []).includes(c)).map(concept => {
                                        const isLoaded = (status?.loaded_concepts || []).includes(concept);

                                        return (
                                            <div key={`custom-wrap-${concept}`} className="flex rounded overflow-hidden border border-zinc-200 dark:border-white/10 group">
                                                <button
                                                    type="button"
                                                    onClick={() => isLoaded ? handleUnloadConcept(concept) : handleLoadConcept(concept)}
                                                    disabled={isLoading}
                                                    className={`px-2 py-1 flex-1 text-left text-xs font-medium transition-colors flex items-center gap-1 ${isLoaded
                                                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                        : 'bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-black/20 dark:text-zinc-400 dark:hover:bg-white/5'
                                                        }`}
                                                    title="Custom Concept"
                                                >
                                                    <span>⚡ {concept}</span>
                                                    {isLoaded && <Check size={12} />}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isLoading || isLoaded}
                                                    onClick={() => handleDeleteConcept(concept)}
                                                    className="px-1.5 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-l border-zinc-200 dark:border-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                                    title={isLoaded ? "Unload to delete" : "Delete concept from disk"}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {(!(status?.available_concepts || []).length) && (
                                        <span className="text-xs text-zinc-400 italic">No computed concepts. Go to "Compute New" to create some.</span>
                                    )}
                                </div>
                            </div>

                            {/* Loaded Concepts Sliders */}
                            {status?.loaded_concepts.length ? (
                                <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-white/5">
                                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Active Concept Strengths</label>
                                    {status.loaded_concepts.map(concept => (
                                        <div key={concept} className="bg-zinc-50 dark:bg-black/20 rounded-lg p-3 space-y-2 border border-zinc-200 dark:border-white/5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{concept}</span>
                                                <button
                                                    type="button"
                                                    disabled={isLoading}
                                                    onClick={() => handleUnloadConcept(concept)}
                                                    className="text-zinc-400 hover:text-red-500 transition-colors"
                                                    title="Unload Concept"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            <div className={!status.enabled ? 'opacity-40 pointer-events-none' : ''}>
                                                <EditableSlider
                                                    label="Alpha (Strength)"
                                                    value={status.config[concept]?.alpha ?? 10.0}
                                                    min={-100}
                                                    max={100}
                                                    step={1}
                                                    onChange={(val) => handleAlphaChange(concept, val)}
                                                    formatDisplay={(val) => val.toFixed(0)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
