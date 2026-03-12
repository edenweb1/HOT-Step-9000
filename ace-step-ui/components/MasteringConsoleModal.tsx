import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
    X, Save, RotateCcw, Loader2, ChevronDown, Plus
} from 'lucide-react';

// ---- Python API base ----
const PYTHON_API = (() => {
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        return `http://${host}:8001`;
    }
    return 'http://localhost:8001';
})();

// ---- Types ----

interface MasteringPreset {
    id: string;
    name: string;
    description: string;
    builtin: boolean;
    params: MasteringParams;
}

export interface MasteringParams {
    eq_bands?: Array<{
        type: string;
        freq_hz: number;
        gain_db: number;
        q: number;
    }>;
    exciter?: {
        estimated_drive: number;
        harmonic_increase?: number;
    };
    stereo?: {
        width_change: number;
        original_side_ratio?: number;
        processed_side_ratio?: number;
    };
    dynamics?: {
        estimated_ratio: number;
        estimated_threshold_db: number;
        dynamic_range_original_db?: number;
        dynamic_range_processed_db?: number;
        gain_change_db?: number;
    };
    overall_gain_db?: number;
    limiter_ceiling_db?: number;
    [key: string]: any;
}

// ---- EQ band definitions for simplified UI ----
const EQ_BAND_DEFS = [
    { label: 'Sub', freq: 150, color: 'from-red-500 to-orange-500', min: -6, max: 6, desc: 'Controls deep bass frequencies (<150Hz). Too much causes muddiness and eats headroom, leading to clipping.' },
    { label: 'Low', freq: 500, color: 'from-orange-500 to-amber-500', min: -6, max: 6, desc: 'Adds warmth or removes boxiness (150-500Hz). High values can clutter the mix.' },
    { label: 'Mid', freq: 6000, color: 'from-amber-500 to-yellow-500', min: -6, max: 6, desc: 'Controls presence of instruments and vocals (500-6kHz). Aggressive cuts hollow out the track.' },
    { label: 'Presence', freq: 10000, color: 'from-yellow-500 to-emerald-500', min: -6, max: 10, desc: 'Adds edge and clarity to upper mids (6kHz-10kHz). Excessive boost sounds harsh and fatiguing.' },
    { label: 'Air', freq: 16000, color: 'from-emerald-500 to-cyan-500', min: -6, max: 12, desc: 'Enhances high-end shimmer and openness (>10kHz). Too much makes the track thin and brittle.' },
];

// ---- Slider Component ----
const MasterSlider: React.FC<{
    label: string;
    description?: string;
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    color?: string;
}> = ({ label, description, value, onChange, min, max, step = 0.1, unit = 'dB', color = 'from-violet-500 to-purple-500' }) => {
    const pct = ((value - min) / (max - min)) * 100;
    const centerPct = min < 0 ? ((0 - min) / (max - min)) * 100 : 0;
    const isBipolar = min < 0;

    return (
        <div className="flex items-center gap-3 group">
            <div className="flex items-center gap-1 w-20 flex-shrink-0" title={description}>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate cursor-help border-b border-dotted border-zinc-400/50">{label}</span>
            </div>
            <div className="flex-1 relative h-6 flex items-center">
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden relative">
                    {isBipolar ? (
                        <>
                            <div
                                className="absolute top-0 h-full w-0.5 bg-zinc-400 dark:bg-zinc-500"
                                style={{ left: `${centerPct}%` }}
                            />
                            <div
                                className={`absolute top-0 h-full bg-gradient-to-r ${color} rounded-full transition-all duration-100`}
                                style={{
                                    left: value >= 0 ? `${centerPct}%` : `${pct}%`,
                                    width: `${Math.abs(pct - centerPct)}%`,
                                }}
                            />
                        </>
                    ) : (
                        <div
                            className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-100`}
                            style={{ width: `${pct}%` }}
                        />
                    )}
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
            </div>
            <span className="text-[11px] font-mono text-zinc-500 w-16 text-right flex-shrink-0">
                {value > 0 && isBipolar ? '+' : ''}{value.toFixed(1)} {unit}
            </span>
        </div>
    );
};

// ---- Section Component ----
const Section: React.FC<{
    title: string;
    icon: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}> = ({ title, icon, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-xl border border-zinc-200 dark:border-white/10 overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full px-4 py-2.5 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
                <span className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    <span>{icon}</span>
                    {title}
                </span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="px-4 py-3 space-y-2 bg-white dark:bg-zinc-900/50">
                    {children}
                </div>
            )}
        </div>
    );
};

// ---- Helpers ----

function getEqGain(params: MasteringParams, targetFreq: number): number {
    const bands = params.eq_bands || [];
    if (bands.length === 0) return 0;
    const closest = bands.reduce((best, band) =>
        Math.abs(band.freq_hz - targetFreq) < Math.abs(best.freq_hz - targetFreq) ? band : best
    );
    return Math.abs(closest.freq_hz - targetFreq) < targetFreq * 0.6 ? closest.gain_db : 0;
}

function setEqGain(params: MasteringParams, targetFreq: number, gain: number): MasteringParams {
    const bands = [...(params.eq_bands || [])];
    if (bands.length === 0) {
        bands.push({ type: 'peak', freq_hz: targetFreq, gain_db: gain, q: 1.0 });
        return { ...params, eq_bands: bands };
    }
    
    // Find closest band
    let closestIdx = 0;
    let minDiff = Math.abs(bands[0].freq_hz - targetFreq);
    for (let i = 1; i < bands.length; i++) {
        const diff = Math.abs(bands[i].freq_hz - targetFreq);
        if (diff < minDiff) {
            minDiff = diff;
            closestIdx = i;
        }
    }

    if (minDiff < targetFreq * 0.6) {
        bands[closestIdx] = { ...bands[closestIdx], gain_db: gain };
    } else {
        bands.push({ type: 'peak', freq_hz: targetFreq, gain_db: gain, q: 1.0 });
    }
    return { ...params, eq_bands: bands };
}

// ---- Props ----

interface MasteringConsoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onParamsChange: (params: MasteringParams) => void;
    currentParams: MasteringParams | null;
}

// ---- Main Component ----

export const MasteringConsoleModal: React.FC<MasteringConsoleModalProps> = ({
    isOpen,
    onClose,
    onParamsChange,
    currentParams,
}) => {
    const [presets, setPresets] = useState<MasteringPreset[]>([]);
    const [selectedPresetId, setSelectedPresetId] = useState<string>('default');
    const [params, setParams] = useState<MasteringParams>({});
    const [loading, setLoading] = useState(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [saveName, setSaveName] = useState('');
    const [dirty, setDirty] = useState(false);

    // Load presets on open
    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        fetch(`${PYTHON_API}/v1/mastering/presets`)
            .then(r => r.json())
            .then(data => {
                setPresets(data.presets || []);
                // Load current params or default preset
                if (currentParams) {
                    setParams(currentParams);
                    setDirty(false);
                } else {
                    const defaultPreset = (data.presets || []).find((p: MasteringPreset) => p.id === 'preset_1');
                    if (defaultPreset) {
                        setParams(defaultPreset.params);
                        setSelectedPresetId('preset_1');
                    }
                }
            })
            .catch(err => console.error('[MasteringConsole] Failed to load presets:', err))
            .finally(() => setLoading(false));
    }, [isOpen]);

    const selectPreset = useCallback((preset: MasteringPreset) => {
        setParams(preset.params);
        setSelectedPresetId(preset.id);
        setDirty(false);
    }, []);

    const updateParam = useCallback((updater: (p: MasteringParams) => MasteringParams) => {
        setParams(prev => {
            const next = updater(prev);
            setDirty(true);
            setSelectedPresetId('');
            return next;
        });
    }, []);

    const handleApply = useCallback(() => {
        onParamsChange(params);
        localStorage.setItem('globalMasteringParams', JSON.stringify(params));
        onClose();
    }, [params, onParamsChange, onClose]);

    const handleReset = useCallback(() => {
        const defaultPreset = presets.find(p => p.id === 'default');
        if (defaultPreset) {
            setParams(defaultPreset.params);
            setSelectedPresetId('default');
            setDirty(false);
        }
    }, [presets]);

    const handleSavePreset = useCallback(async () => {
        if (!saveName.trim()) return;
        try {
            const resp = await fetch(`${PYTHON_API}/v1/mastering/presets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: saveName.trim(), params }),
            });
            if (resp.ok) {
                const data = await resp.json();
                // Reload presets
                const presetsResp = await fetch(`${PYTHON_API}/v1/mastering/presets`);
                const presetsData = await presetsResp.json();
                setPresets(presetsData.presets || []);
                setSelectedPresetId(data.id);
                setDirty(false);
            }
        } catch (err) {
            console.error('[MasteringConsole] Save preset failed:', err);
        }
        setSaveDialogOpen(false);
        setSaveName('');
    }, [saveName, params]);

    const handleDeletePreset = useCallback(async (presetId: string) => {
        try {
            await fetch(`${PYTHON_API}/v1/mastering/presets/${presetId}`, { method: 'DELETE' });
            const resp = await fetch(`${PYTHON_API}/v1/mastering/presets`);
            const data = await resp.json();
            setPresets(data.presets || []);
            if (selectedPresetId === presetId) {
                handleReset();
            }
        } catch (err) {
            console.error('[MasteringConsole] Delete preset failed:', err);
        }
    }, [selectedPresetId, handleReset]);

    if (!isOpen) return null;

    // Extract current values from params
    const drive = params.exciter?.estimated_drive ?? 1.0;
    const widthChange = params.stereo?.width_change ?? 0.0;
    const ratio = params.dynamics?.estimated_ratio ?? 1.0;
    const threshold = params.dynamics?.estimated_threshold_db ?? -12;
    const outputGain = params.overall_gain_db ?? 0;
    const ceiling = params.limiter_ceiling_db ?? -0.5;

    const modalContent = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                            <span className="text-lg">🎛️</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Mastering Console</h2>
                            <p className="text-xs text-zinc-500">
                                {selectedPresetId ? presets.find(p => p.id === selectedPresetId)?.name || 'Custom' : 'Custom'}
                                {dirty && ' (modified)'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} className="text-zinc-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Presets */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Presets</label>
                                    <button
                                        onClick={() => setSaveDialogOpen(true)}
                                        className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-md transition-colors"
                                    >
                                        <Plus size={10} /> Save As
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {presets.map(p => (
                                        <div key={p.id} className="relative group">
                                            <button
                                                onClick={() => selectPreset(p)}
                                                title={p.description}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedPresetId === p.id && !dirty
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-105'
                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                                }`}
                                            >
                                                {p.name}
                                            </button>
                                            {!p.builtin && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeletePreset(p.id); }}
                                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                    title="Delete preset"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Save Name Dialog */}
                            {saveDialogOpen && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-500/20">
                                    <input
                                        type="text"
                                        value={saveName}
                                        onChange={e => setSaveName(e.target.value)}
                                        placeholder="Preset name..."
                                        className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white"
                                        autoFocus
                                        onKeyDown={e => e.key === 'Enter' && handleSavePreset()}
                                    />
                                    <button
                                        onClick={handleSavePreset}
                                        disabled={!saveName.trim()}
                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => { setSaveDialogOpen(false); setSaveName(''); }}
                                        className="px-2 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}

                            {/* EQ Section */}
                            <Section title="EQ" icon="📊">
                                {EQ_BAND_DEFS.map(band => (
                                    <MasterSlider
                                        key={band.freq}
                                        label={band.label}
                                        description={band.desc}
                                        value={getEqGain(params, band.freq)}
                                        onChange={v => updateParam(p => setEqGain(p, band.freq, v))}
                                        min={band.min}
                                        max={band.max}
                                        step={0.5}
                                        color={band.color}
                                    />
                                ))}
                            </Section>

                            {/* Exciter */}
                            <Section title="Exciter" icon="🔥">
                                <MasterSlider
                                    label="Drive"
                                    description="Adds harmonic distortion to make the track sound fuller and louder. High values sound crunchy/distorted."
                                    value={drive}
                                    onChange={v => updateParam(p => ({
                                        ...p,
                                        exciter: { ...(p.exciter || {}), estimated_drive: v }
                                    }))}
                                    min={1.0}
                                    max={3.0}
                                    step={0.1}
                                    unit="x"
                                    color="from-orange-500 to-red-500"
                                />
                            </Section>

                            {/* Stereo Width */}
                            <Section title="Stereo Width" icon="↔️">
                                <MasterSlider
                                    label="Width"
                                    description="Expands the stereo image. Negative values make it more mono. Extreme positive values can cause phase issues."
                                    value={widthChange}
                                    onChange={v => updateParam(p => ({
                                        ...p,
                                        stereo: { ...(p.stereo || {}), width_change: v }
                                    }))}
                                    min={-1.0}
                                    max={1.0}
                                    step={0.05}
                                    unit="x"
                                    color="from-blue-500 to-cyan-500"
                                />
                            </Section>

                            {/* Dynamics */}
                            <Section title="Dynamics" icon="📈">
                                <div className="space-y-4">
                                    <MasterSlider
                                        label="Threshold"
                                        description="The volume level where compression kicks in. Lower threshold = more constant compression."
                                        value={threshold}
                                        onChange={v => updateParam(p => ({
                                            ...p,
                                            dynamics: { ...(p.dynamics || {}), estimated_threshold_db: v, estimated_ratio: p.dynamics?.estimated_ratio ?? 1.0 }
                                        }))}
                                        min={-40}
                                        max={0}
                                        step={0.5}
                                        color="from-violet-500 to-fuchsia-500"
                                    />
                                    <MasterSlider
                                        label="Ratio"
                                        description="How aggressively the compressor reduces peaks. High ratio squashes dynamics."
                                        value={ratio}
                                        onChange={v => updateParam(p => ({
                                            ...p,
                                            dynamics: { ...(p.dynamics || {}), estimated_ratio: v, estimated_threshold_db: p.dynamics?.estimated_threshold_db ?? -12 }
                                        }))}
                                        min={1.0}
                                        max={10.0}
                                        step={0.1}
                                        unit=":1"
                                        color="from-fuchsia-500 to-pink-500"
                                    />
                                </div>
                            </Section>

                            {/* Maximizer */}
                            <Section title="Maximizer" icon="🔊">
                                <MasterSlider
                                    label="Output Gain"
                                    description="Overall gain applied after all other processing, before the limiter. Use to increase loudness."
                                    value={outputGain}
                                    onChange={v => updateParam(p => ({ ...p, overall_gain_db: v }))}
                                    min={0}
                                    max={8}
                                    step={0.1}
                                    color="from-pink-500 to-rose-500"
                                />
                                <MasterSlider
                                    label="Ceiling"
                                    description="The absolute maximum output level. Prevents clipping and ensures your track doesn't exceed target loudness standards."
                                    value={ceiling}
                                    onChange={v => updateParam(p => ({ ...p, limiter_ceiling_db: v }))}
                                    min={-3}
                                    max={0}
                                    step={0.1}
                                    color="from-rose-500 to-red-500"
                                />
                            </Section>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
                    >
                        <RotateCcw size={14} /> Reset
                    </button>
                    <div className="flex-1" />
                    <button
                        onClick={handleApply}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                        <Save size={14} /> Apply
                    </button>
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default MasteringConsoleModal;
