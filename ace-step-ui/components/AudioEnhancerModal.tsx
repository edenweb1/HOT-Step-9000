import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
    X, Sparkles, Loader2, Download, Play, Pause,
    Music, Drum, Guitar, Mic, SlidersHorizontal, Radio
} from 'lucide-react';
import { DownloadModal, DownloadFormat } from './DownloadModal';

// ---- Global open hook ----
type OpenFn = (audioUrl: string, songTitle: string, songId?: string) => void;
let _globalOpen: OpenFn | null = null;

/** Call from anywhere to open the audio enhancer modal. */
export function openAudioEnhancer(audioUrl: string, songTitle?: string, songId?: string) {
    _globalOpen?.(audioUrl, songTitle || 'Untitled', songId);
}

// ---- Constants ----

const PYTHON_API = (() => {
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        return `http://${host}:8001`;
    }
    return 'http://localhost:8001';
})();

interface Preset {
    id: string;
    label: string;
    icon: string;
    clarity: number;
    warmth: number;
    air: number;
    dynamics: number;
    reverb_amount: number;
    reverb_room_size: number;
    reverb_damping: number;
    echo_delay: number;
    echo_decay: number;
    stereo_width: number;
    vocals_enhance: number;
    drums_enhance: number;
    bass_enhance: number;
    other_enhance: number;
}

const PRESETS: Preset[] = [
    {
        id: 'radio_ready', label: 'Radio Ready', icon: '📻',
        clarity: 0.6, warmth: 0.3, air: 0.5, dynamics: 0.6,
        reverb_amount: 0.0, reverb_room_size: 0.4, reverb_damping: 0.5,
        echo_delay: 0.0, echo_decay: 0.0, stereo_width: 0.2,
        vocals_enhance: 0.6, drums_enhance: 0.5, bass_enhance: 0.4, other_enhance: 0.4,
    },
    {
        id: 'warm_and_rich', label: 'Warm & Rich', icon: '🔥',
        clarity: 0.3, warmth: 0.6, air: 0.2, dynamics: 0.3,
        reverb_amount: 0.15, reverb_room_size: 0.5, reverb_damping: 0.6,
        echo_delay: 0.0, echo_decay: 0.0, stereo_width: 0.1,
        vocals_enhance: 0.4, drums_enhance: 0.3, bass_enhance: 0.6, other_enhance: 0.5,
    },
    {
        id: 'bright_and_clear', label: 'Bright & Clear', icon: '✨',
        clarity: 0.7, warmth: 0.1, air: 0.7, dynamics: 0.4,
        reverb_amount: 0.0, reverb_room_size: 0.3, reverb_damping: 0.4,
        echo_delay: 0.0, echo_decay: 0.0, stereo_width: 0.15,
        vocals_enhance: 0.7, drums_enhance: 0.4, bass_enhance: 0.2, other_enhance: 0.5,
    },
    {
        id: 'club_master', label: 'Club Master', icon: '🎧',
        clarity: 0.4, warmth: 0.5, air: 0.4, dynamics: 0.7,
        reverb_amount: 0.0, reverb_room_size: 0.3, reverb_damping: 0.3,
        echo_delay: 0.0, echo_decay: 0.0, stereo_width: 0.3,
        vocals_enhance: 0.3, drums_enhance: 0.7, bass_enhance: 0.7, other_enhance: 0.3,
    },
    {
        id: 'lo_fi_chill', label: 'Lo-Fi Chill', icon: '🌙',
        clarity: 0.2, warmth: 0.7, air: 0.1, dynamics: 0.2,
        reverb_amount: 0.3, reverb_room_size: 0.6, reverb_damping: 0.7,
        echo_delay: 0.25, echo_decay: 0.3, stereo_width: 0.1,
        vocals_enhance: 0.3, drums_enhance: 0.2, bass_enhance: 0.5, other_enhance: 0.4,
    },
    {
        id: 'cinematic', label: 'Cinematic', icon: '🎬',
        clarity: 0.5, warmth: 0.4, air: 0.6, dynamics: 0.5,
        reverb_amount: 0.4, reverb_room_size: 0.8, reverb_damping: 0.5,
        echo_delay: 0.15, echo_decay: 0.2, stereo_width: 0.4,
        vocals_enhance: 0.5, drums_enhance: 0.4, bass_enhance: 0.5, other_enhance: 0.6,
    },
];

// ---- Slider Component ----

const EnhancerSlider: React.FC<{
    label: string;
    value: number;
    onChange: (v: number) => void;
    icon?: React.ReactNode;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
}> = ({ label, value, onChange, icon, min = 0, max = 1, step = 0.05, color = 'violet' }) => {
    const pct = ((value - min) / (max - min)) * 100;
    const colorMap: Record<string, string> = {
        violet: 'from-violet-500 to-purple-500',
        pink: 'from-pink-500 to-rose-500',
        amber: 'from-amber-500 to-orange-500',
        emerald: 'from-emerald-500 to-teal-500',
        blue: 'from-blue-500 to-indigo-500',
        cyan: 'from-cyan-500 to-sky-500',
    };
    const gradientClass = colorMap[color] || colorMap.violet;

    return (
        <div className="flex items-center gap-3 group">
            <div className="flex items-center gap-2 w-32 flex-shrink-0">
                {icon && <span className="w-4 h-4 text-zinc-400 flex-shrink-0">{icon}</span>}
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate">{label}</span>
            </div>
            <div className="flex-1 relative h-6 flex items-center">
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${gradientClass} rounded-full transition-all duration-100`}
                        style={{ width: `${pct}%` }}
                    />
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
            <span className="text-[11px] font-mono text-zinc-500 w-8 text-right flex-shrink-0">
                {value.toFixed(2)}
            </span>
        </div>
    );
};

// ---- Section Component ----

const Section: React.FC<{
    title: string;
    icon: React.ReactNode;
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
                    <span className="text-pink-500">{icon}</span>
                    {title}
                </span>
                <svg className={`w-4 h-4 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div className="px-4 py-3 space-y-2 bg-white dark:bg-zinc-900/50">
                    {children}
                </div>
            )}
        </div>
    );
};

// ---- Format time ----
const formatTime = (s: number) => {
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
};

// ---- Main Modal ----

export const AudioEnhancerModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [audioUrl, setAudioUrl] = useState('');
    const [songTitle, setSongTitle] = useState('');
    const [songId, setSongId] = useState<string | undefined>();

    // Processing state
    const [status, setStatus] = useState<'idle' | 'running' | 'complete' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [jobId, setJobId] = useState('');
    const [outputPath, setOutputPath] = useState('');
    const eventSourceRef = useRef<EventSource | null>(null);

    // Availability
    const [available, setAvailable] = useState<boolean | null>(null);
    const [demucsAvailable, setDemucsAvailable] = useState(false);

    // Enhancement parameters
    const [enhancementLevel, setEnhancementLevel] = useState(0.5);
    const [useStemSeparation, setUseStemSeparation] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string | null>('radio_ready');
    const [clarity, setClarity] = useState(0.6);
    const [warmth, setWarmth] = useState(0.3);
    const [air, setAir] = useState(0.5);
    const [dynamics, setDynamics] = useState(0.6);
    const [reverbAmount, setReverbAmount] = useState(0.1);
    const [reverbRoomSize, setReverbRoomSize] = useState(0.4);
    const [reverbDamping, setReverbDamping] = useState(0.5);
    const [echoDelay, setEchoDelay] = useState(0.0);
    const [echoDecay, setEchoDecay] = useState(0.0);
    const [stereoWidth, setStereoWidth] = useState(0.2);
    const [vocalsEnhance, setVocalsEnhance] = useState(0.6);
    const [drumsEnhance, setDrumsEnhance] = useState(0.5);
    const [bassEnhance, setBassEnhance] = useState(0.4);
    const [otherEnhance, setOtherEnhance] = useState(0.4);

    // Preview player
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const enhancedAudioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [previewSource, setPreviewSource] = useState<'original' | 'enhanced'>('enhanced');
    const animRef = useRef<number>(0);

    // Download format modal
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    // Register global open function
    useEffect(() => {
        _globalOpen = (url: string, title: string, id?: string) => {
            setAudioUrl(url);
            setSongTitle(title);
            setSongId(id);
            setStatus('idle');
            setProgress(0);
            setMessage('');
            setError('');
            setJobId('');
            setOutputPath('');
            setIsPlaying(false);
            setIsOpen(true);
            // Load Radio Ready preset by default
            applyPreset('radio_ready');
        };
        return () => { _globalOpen = null; };
    }, []);

    // Check availability
    useEffect(() => {
        if (!isOpen) return;
        fetch(`${PYTHON_API}/v1/audio/enhance/available`)
            .then(r => r.json())
            .then(data => {
                setAvailable(data.available);
                setDemucsAvailable(data.demucs || false);
            })
            .catch(() => setAvailable(false));
    }, [isOpen]);

    // Cleanup
    useEffect(() => {
        return () => { eventSourceRef.current?.close(); };
    }, []);

    // Preview player animation frame
    useEffect(() => {
        const tick = () => {
            const activeAudio = previewSource === 'enhanced' ? enhancedAudioRef.current : audioRef.current;
            if (activeAudio && isPlaying) setCurrentTime(activeAudio.currentTime);
            animRef.current = requestAnimationFrame(tick);
        };
        animRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animRef.current);
    }, [isPlaying, previewSource]);

    const onClose = useCallback(() => {
        eventSourceRef.current?.close();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (enhancedAudioRef.current) {
            enhancedAudioRef.current.pause();
            enhancedAudioRef.current = null;
        }
        setIsPlaying(false);
        setIsOpen(false);
    }, []);

    const applyPreset = (presetId: string) => {
        const preset = PRESETS.find(p => p.id === presetId);
        if (!preset) return;
        setSelectedPreset(presetId);
        setClarity(preset.clarity);
        setWarmth(preset.warmth);
        setAir(preset.air);
        setDynamics(preset.dynamics);
        setReverbAmount(preset.reverb_amount);
        setReverbRoomSize(preset.reverb_room_size);
        setReverbDamping(preset.reverb_damping);
        setEchoDelay(preset.echo_delay);
        setEchoDecay(preset.echo_decay);
        setStereoWidth(preset.stereo_width);
        setVocalsEnhance(preset.vocals_enhance);
        setDrumsEnhance(preset.drums_enhance);
        setBassEnhance(preset.bass_enhance);
        setOtherEnhance(preset.other_enhance);
    };

    const resolveAudioPath = (): string => {
        if (audioUrl.includes('/v1/audio?path=')) {
            try {
                const url = new URL(audioUrl, window.location.origin);
                return decodeURIComponent(url.searchParams.get('path') || audioUrl);
            } catch { /* fall through */ }
        }
        return audioUrl;
    };

    const startEnhancement = async () => {
        setStatus('running');
        setProgress(0);
        setMessage('Starting…');
        setError('');
        setOutputPath('');
        setIsPlaying(false);
        // Clean up old enhanced audio element so new result loads fresh
        if (enhancedAudioRef.current) {
            enhancedAudioRef.current.pause();
            enhancedAudioRef.current = null;
        }

        try {
            const audioPath = resolveAudioPath();
            const resp = await fetch(`${PYTHON_API}/v1/audio/enhance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audio_path: audioPath,
                    params: {
                        enhancement_level: enhancementLevel,
                        use_stem_separation: useStemSeparation,
                        clarity, warmth, air, dynamics,
                        reverb_amount: reverbAmount,
                        reverb_room_size: reverbRoomSize,
                        reverb_damping: reverbDamping,
                        echo_delay: echoDelay,
                        echo_decay: echoDecay,
                        stereo_width: stereoWidth,
                        vocals_enhance: vocalsEnhance,
                        drums_enhance: drumsEnhance,
                        bass_enhance: bassEnhance,
                        other_enhance: otherEnhance,
                    },
                }),
            });

            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({ detail: resp.statusText }));
                throw new Error(errData.detail || `Server error ${resp.status}`);
            }

            const { job_id } = await resp.json();
            setJobId(job_id);

            // SSE progress stream
            const es = new EventSource(`${PYTHON_API}/v1/audio/enhance/${job_id}/progress`);
            eventSourceRef.current = es;

            es.onmessage = (evt) => {
                try {
                    const data = JSON.parse(evt.data);
                    if (data.type === 'progress') {
                        setProgress(data.percent);
                        setMessage(data.message || '');
                    } else if (data.type === 'complete') {
                        setStatus('complete');
                        setOutputPath(data.output_path || '');
                        setJobId(job_id);
                        setProgress(1);
                        setMessage('Done!');
                        es.close();
                    } else if (data.type === 'error') {
                        setStatus('error');
                        setError(data.message || 'Unknown error');
                        es.close();
                    }
                } catch { /* ignore parse errors */ }
            };

            es.onerror = () => { es.close(); };
        } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Failed to start enhancement');
        }
    };

    const handleEnhancedDownload = (format: DownloadFormat) => {
        if (!outputPath) return;
        try {
            const targetUrl = new URL('/api/songs/download', window.location.origin);
            // Use the local file path via /api/audio/file endpoint
            targetUrl.searchParams.set('audioUrl', `/api/audio/file?path=${encodeURIComponent(outputPath)}`);
            targetUrl.searchParams.set('title', `${songTitle} (Enhanced)`);
            targetUrl.searchParams.set('format', format);
            // Pass song ID for metadata tagging if available
            if (songId) {
                targetUrl.searchParams.set('songId', songId);
            }
            // Pass bitrate settings from localStorage
            if (format === 'mp3') {
                const br = localStorage.getItem('mp3_export_bitrate');
                if (br) targetUrl.searchParams.set('mp3Bitrate', br);
            }
            if (format === 'opus') {
                const br = localStorage.getItem('opus_export_bitrate');
                if (br) targetUrl.searchParams.set('opusBitrate', br);
            }

            const link = document.createElement('a');
            link.href = targetUrl.toString();
            const ext = format === 'opus' ? 'ogg' : format;
            link.download = `${songTitle} (Enhanced).${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) { console.error('Download failed:', err); }
    };

    const setupAudioElement = (audio: HTMLAudioElement, isEnhanced: boolean) => {
        audio.crossOrigin = 'anonymous';
        const updateDur = () => {
            const d = audio.duration;
            if (d && isFinite(d) && d > 0) {
                setDuration(d);
            }
        };
        audio.onloadedmetadata = updateDur;
        audio.ondurationchange = updateDur;
        audio.ontimeupdate = () => {
            if (audio && !audio.paused) {
                setCurrentTime(audio.currentTime);
            }
        };
        audio.onended = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };
        // Check if duration is already available (race condition)
        if (audio.readyState >= 1) updateDur();
    };

    const togglePreview = () => {
        if (!jobId) return;

        const enhancedUrl = `${PYTHON_API}/v1/audio/enhance/${jobId}/download`;
        // Original uses the audioUrl prop directly
        const originalUrl = audioUrl;

        // Lazy-create enhanced audio element
        if (!enhancedAudioRef.current) {
            enhancedAudioRef.current = new Audio(enhancedUrl);
            setupAudioElement(enhancedAudioRef.current, true);
        }

        // Lazy-create original audio element
        if (!audioRef.current) {
            audioRef.current = new Audio(originalUrl);
            setupAudioElement(audioRef.current, false);
        }

        const activeAudio = previewSource === 'enhanced' ? enhancedAudioRef.current : audioRef.current;
        const inactiveAudio = previewSource === 'enhanced' ? audioRef.current : enhancedAudioRef.current;

        if (isPlaying) {
            activeAudio.pause();
            setIsPlaying(false);
        } else {
            inactiveAudio.pause();
            activeAudio.play().catch(err => console.error('Playback failed:', err));
            setIsPlaying(true);
        }
    };

    if (!isOpen) return null;

    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    const modalContent = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl w-full max-w-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-lg">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Audio Enhancer</h2>
                            {songTitle && <p className="text-xs text-zinc-500 truncate max-w-[250px]">{songTitle}</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} className="text-zinc-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {available === false && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm text-red-700 dark:text-red-300">
                            <strong>Enhancement engine not available.</strong> Check Python API is running.
                        </div>
                    )}

                    {(status === 'idle' || status === 'complete' || status === 'running') && (
                        <>
                            {/* Presets */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Presets</label>
                                <div className="flex flex-wrap gap-2">
                                    {PRESETS.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => applyPreset(p.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedPreset === p.id
                                                ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg scale-105'
                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                                }`}
                                        >
                                            <span className="mr-1">{p.icon}</span> {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Enhancement Level */}
                            <div className="space-y-2">
                                <EnhancerSlider
                                    label="Master Level"
                                    value={enhancementLevel}
                                    onChange={(v) => { setEnhancementLevel(v); setSelectedPreset(null); }}
                                    icon={<SlidersHorizontal size={14} />}
                                    color="pink"
                                />
                            </div>

                            {/* Processing Mode */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10">
                                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Mode</span>
                                <div className="flex rounded-lg overflow-hidden border border-zinc-200 dark:border-white/10">
                                    <button
                                        onClick={() => setUseStemSeparation(false)}
                                        className={`px-3 py-1.5 text-xs font-bold transition-colors ${!useStemSeparation
                                            ? 'bg-violet-500 text-white'
                                            : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                            }`}
                                    >
                                        Simple
                                    </button>
                                    <button
                                        onClick={() => setUseStemSeparation(true)}
                                        disabled={!demucsAvailable}
                                        className={`px-3 py-1.5 text-xs font-bold transition-colors ${useStemSeparation
                                            ? 'bg-violet-500 text-white'
                                            : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                            } ${!demucsAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        title={!demucsAvailable ? 'Demucs not installed' : 'Uses AI stem separation for targeted enhancement'}
                                    >
                                        Stem Separation
                                    </button>
                                </div>
                                {!demucsAvailable && (
                                    <span className="text-[10px] text-zinc-400 italic">Demucs not installed</span>
                                )}
                            </div>

                            {/* Enhancement Controls */}
                            <Section title="Enhancement" icon={<Sparkles size={14} />}>
                                <EnhancerSlider label="Clarity" value={clarity} onChange={(v) => { setClarity(v); setSelectedPreset(null); }} color="violet" />
                                <EnhancerSlider label="Warmth" value={warmth} onChange={(v) => { setWarmth(v); setSelectedPreset(null); }} color="amber" />
                                <EnhancerSlider label="Air & Brilliance" value={air} onChange={(v) => { setAir(v); setSelectedPreset(null); }} color="cyan" />
                                <EnhancerSlider label="Dynamics" value={dynamics} onChange={(v) => { setDynamics(v); setSelectedPreset(null); }} color="pink" />
                            </Section>

                            {/* Effects */}
                            <Section title="Effects" icon={<Radio size={14} />} defaultOpen={false}>
                                <EnhancerSlider label="Reverb" value={reverbAmount} onChange={(v) => { setReverbAmount(v); setSelectedPreset(null); }} color="blue" />
                                {reverbAmount > 0 && (
                                    <>
                                        <EnhancerSlider label="Room Size" value={reverbRoomSize} onChange={(v) => { setReverbRoomSize(v); setSelectedPreset(null); }} color="blue" />
                                        <EnhancerSlider label="Damping" value={reverbDamping} onChange={(v) => { setReverbDamping(v); setSelectedPreset(null); }} color="blue" />
                                    </>
                                )}
                                <EnhancerSlider label="Echo Delay" value={echoDelay} onChange={(v) => { setEchoDelay(v); setSelectedPreset(null); }} min={0} max={0.5} step={0.01} color="blue" />
                                {echoDelay > 0 && (
                                    <EnhancerSlider label="Echo Decay" value={echoDecay} onChange={(v) => { setEchoDecay(v); setSelectedPreset(null); }} color="blue" />
                                )}
                                <EnhancerSlider label="Stereo Width" value={stereoWidth} onChange={(v) => { setStereoWidth(v); setSelectedPreset(null); }} color="emerald" />
                            </Section>

                            {/* Stem Levels (only when stem separation enabled) */}
                            {useStemSeparation && (
                                <Section title="Stem Levels" icon={<Music size={14} />} defaultOpen={true}>
                                    <EnhancerSlider label="🎤 Vocals" value={vocalsEnhance} onChange={(v) => { setVocalsEnhance(v); setSelectedPreset(null); }} color="pink" />
                                    <EnhancerSlider label="🥁 Drums" value={drumsEnhance} onChange={(v) => { setDrumsEnhance(v); setSelectedPreset(null); }} color="amber" />
                                    <EnhancerSlider label="🎸 Bass" value={bassEnhance} onChange={(v) => { setBassEnhance(v); setSelectedPreset(null); }} color="emerald" />
                                    <EnhancerSlider label="🎵 Other" value={otherEnhance} onChange={(v) => { setOtherEnhance(v); setSelectedPreset(null); }} color="blue" />
                                </Section>
                            )}

                            {/* Inline Result Player (shown when enhancement is complete) */}
                            {status === 'complete' && (
                                <div className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/15 dark:to-teal-900/15 border border-emerald-200 dark:border-emerald-500/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                            <Sparkles size={14} />
                                            <span className="text-xs font-bold">Enhanced Result</span>
                                        </div>
                                        {/* A/B Toggle */}
                                        <div className="flex rounded-lg overflow-hidden border border-zinc-200 dark:border-white/10">
                                            <button
                                                onClick={() => {
                                                    setPreviewSource('original');
                                                    if (isPlaying && audioRef.current && enhancedAudioRef.current) {
                                                        const t = enhancedAudioRef.current.currentTime;
                                                        enhancedAudioRef.current.pause();
                                                        audioRef.current.currentTime = t;
                                                        audioRef.current.play();
                                                    }
                                                }}
                                                className={`px-2 py-1 text-[10px] font-bold transition-colors ${previewSource === 'original'
                                                    ? 'bg-zinc-600 text-white'
                                                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                                    }`}
                                            >
                                                Original
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setPreviewSource('enhanced');
                                                    if (isPlaying && audioRef.current && enhancedAudioRef.current) {
                                                        const t = audioRef.current.currentTime;
                                                        audioRef.current.pause();
                                                        enhancedAudioRef.current.currentTime = t;
                                                        enhancedAudioRef.current.play();
                                                    }
                                                }}
                                                className={`px-2 py-1 text-[10px] font-bold transition-colors ${previewSource === 'enhanced'
                                                    ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white'
                                                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                                    }`}
                                            >
                                                ✨ Enhanced
                                            </button>
                                        </div>
                                    </div>

                                    {/* Compact Player */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={togglePreview}
                                            className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-md hover:scale-105 transition-transform flex-shrink-0"
                                        >
                                            {isPlaying
                                                ? <Pause size={12} className="text-white" fill="white" />
                                                : <Play size={12} className="text-white ml-0.5" fill="white" />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div
                                                className="w-full h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full cursor-pointer relative"
                                                onClick={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const pct = (e.clientX - rect.left) / rect.width;
                                                    const activeAudio = previewSource === 'enhanced' ? enhancedAudioRef.current : audioRef.current;
                                                    if (activeAudio) {
                                                        activeAudio.currentTime = pct * duration;
                                                        setCurrentTime(pct * duration);
                                                    }
                                                }}
                                            >
                                                <div
                                                    className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full transition-[width] duration-100"
                                                    style={{ width: `${progressPct}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-0.5">
                                                <span className="text-[9px] text-zinc-500 font-mono">{formatTime(currentTime)}</span>
                                                <span className="text-[9px] text-zinc-400 font-mono italic">
                                                    {previewSource === 'enhanced' ? '✨ Enhanced' : 'Original'}
                                                </span>
                                                <span className="text-[9px] text-zinc-500 font-mono">{formatTime(duration)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowDownloadModal(true)}
                                            className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-500/30 transition-colors"
                                            title="Download enhanced audio"
                                        >
                                            <Download size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Inline progress for re-enhance */}
                            {status === 'running' && (
                                <div className="space-y-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/15 border border-violet-200 dark:border-violet-500/20">
                                    <div className="flex items-center gap-2">
                                        <Loader2 size={14} className="text-pink-500 animate-spin" />
                                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{message || 'Processing…'}</span>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${Math.max(progress * 100, 2)}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-500 text-right font-mono">{(progress * 100).toFixed(0)}%</p>
                                </div>
                            )}
                        </>
                    )}


                    {status === 'error' && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
                            <p className="text-sm font-medium text-red-700 dark:text-red-300">Enhancement failed</p>
                            <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-3 px-4 py-1.5 text-xs font-bold rounded-lg bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}


                </div>

                {/* Footer — Enhance button */}
                {(status === 'idle' || status === 'complete' || status === 'running') && (
                    <div className="px-6 py-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30">
                        <button
                            onClick={startEnhancement}
                            disabled={available === false || status === 'running'}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {status === 'running' ? (
                                <><Loader2 size={16} className="animate-spin" /> Enhancing…</>
                            ) : (
                                <><Sparkles size={16} /> {status === 'complete' ? 'Re-enhance' : 'Enhance Audio'}</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return ReactDOM.createPortal(
        <>
            {modalContent}
            {showDownloadModal && (
                <div className="relative z-[10000]">
                    <DownloadModal
                        isOpen={showDownloadModal}
                        onClose={() => setShowDownloadModal(false)}
                        onDownload={(format) => {
                            handleEnhancedDownload(format);
                            setShowDownloadModal(false);
                        }}
                        songTitle={`${songTitle} (Enhanced)`}
                    />
                </div>
            )}
        </>,
        document.body
    );
};
