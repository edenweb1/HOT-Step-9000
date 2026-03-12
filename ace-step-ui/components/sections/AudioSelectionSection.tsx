import React from 'react';
import { useI18n } from '../../context/I18nContext';

interface AudioSelectionSectionProps {
    useReferenceAudio: boolean;
    setUseReferenceAudio: (val: boolean) => void;
    taskType: string;
    audioTab: 'reference' | 'source';
    setAudioTab: (val: 'reference' | 'source') => void;
    referenceAudioUrl: string | null;
    referenceAudioTitle: string;
    referencePlaying: boolean;
    toggleAudio: (type: 'reference' | 'source') => void;
    referenceDuration: number;
    referenceTime: number;
    referenceAudioRef: React.RefObject<HTMLAudioElement>;
    setReferenceAudioUrl: (val: string) => void;
    setReferenceAudioTitle: (val: string) => void;
    setReferencePlaying: (val: boolean) => void;
    setReferenceTime: (val: number) => void;
    setReferenceDuration: (val: number) => void;
    sourceAudioUrl: string | null;
    sourceAudioTitle: string;
    sourcePlaying: boolean;
    sourceDuration: number;
    sourceTime: number;
    sourceAudioRef: React.RefObject<HTMLAudioElement>;
    setSourceAudioUrl: (val: string) => void;
    setSourceAudioTitle: (val: string) => void;
    setSourcePlaying: (val: boolean) => void;
    setSourceTime: (val: number) => void;
    setSourceDuration: (val: number) => void;
    openAudioModal: (tab: 'reference' | 'source', initialTab: 'library' | 'uploads') => void;
    referenceInputRef: React.RefObject<HTMLInputElement>;
    sourceInputRef: React.RefObject<HTMLInputElement>;
    handleDrop: (e: React.DragEvent, type: 'reference' | 'source') => void;
    handleDragOver: (e: React.DragEvent) => void;
    formatTime: (time: number) => string;
    getAudioLabel: (url: string) => string;
    onAnalyzeSource?: () => void;
    isAnalyzing?: boolean;
}

export const AudioSelectionSection: React.FC<AudioSelectionSectionProps> = ({
    useReferenceAudio,
    setUseReferenceAudio,
    taskType,
    audioTab,
    setAudioTab,
    referenceAudioUrl,
    referenceAudioTitle,
    referencePlaying,
    toggleAudio,
    referenceDuration,
    referenceTime,
    referenceAudioRef,
    setReferenceAudioUrl,
    setReferenceAudioTitle,
    setReferencePlaying,
    setReferenceTime,
    setReferenceDuration,
    sourceAudioUrl,
    sourceAudioTitle,
    sourcePlaying,
    sourceDuration,
    sourceTime,
    sourceAudioRef,
    setSourceAudioUrl,
    setSourceAudioTitle,
    setSourcePlaying,
    setSourceTime,
    setSourceDuration,
    openAudioModal,
    referenceInputRef,
    sourceInputRef,
    handleDrop,
    handleDragOver,
    formatTime,
    getAudioLabel,
    onAnalyzeSource,
    isAnalyzing
}) => {
    const { t } = useI18n();

    return (
        <div className="space-y-5">
            {/* Use Reference Audio Toggle — hidden in extract mode */}
            {taskType !== 'extract' && (
                <div className="flex items-center justify-between px-2">
                    <div>
                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">{t('useReferenceAudio')}</span>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{t('useReferenceAudioTooltip')}</p>
                    </div>
                    <button
                        onClick={() => {
                            const newValue = !useReferenceAudio;
                            setUseReferenceAudio(newValue);
                            if (!newValue) {
                                // Clear reference audio so it won't be sent in generation requests
                                setReferenceAudioUrl('');
                                setReferenceAudioTitle('');
                                setReferencePlaying(false);
                                setReferenceTime(0);
                                setReferenceDuration(0);
                                if (taskType !== 'text2music') {
                                    setAudioTab('source');
                                }
                            } else {
                                setAudioTab('reference');
                            }
                        }}
                        className={`w-10 h-5 rounded-full flex items-center transition-colors duration-200 px-0.5 border border-zinc-200 dark:border-white/5 ${useReferenceAudio ? 'bg-pink-600' : 'bg-zinc-300 dark:bg-black/40'} cursor-pointer`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 shadow-sm ${useReferenceAudio ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
            )}

            {/* Audio Section - Conditionally rendered */}
            {(useReferenceAudio || taskType !== 'text2music') && (
                <div
                    onDrop={(e) => handleDrop(e, audioTab)}
                    onDragOver={handleDragOver}
                    className="bg-white dark:bg-[#1a1a1f] rounded-xl border border-zinc-200 dark:border-white/5 overflow-hidden"
                >
                    {/* Header with Audio label and tabs */}
                    <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02]">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{t('audio')}</span>
                            <div className="flex items-center gap-1 bg-zinc-200/50 dark:bg-black/30 rounded-lg p-0.5">
                                {useReferenceAudio && taskType !== 'extract' && (
                                    <button
                                        type="button"
                                        onClick={() => setAudioTab('reference')}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${audioTab === 'reference'
                                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                                            }`}
                                    >
                                        {t('reference')}
                                    </button>
                                )}
                                {taskType !== 'text2music' && (
                                    <button
                                        type="button"
                                        onClick={() => setAudioTab('source')}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${audioTab === 'source'
                                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                                            }`}
                                    >
                                        {taskType === 'extract' ? t('audio') : t('cover')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Audio Content */}
                    <div className="p-3 space-y-2">
                        {/* Reference Audio Player */}
                        {audioTab === 'reference' && referenceAudioUrl && (
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => toggleAudio('reference')}
                                    className="relative flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform"
                                >
                                    {referencePlaying ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    )}
                                    <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-zinc-900 text-white px-1 py-0.5 rounded">
                                        {formatTime(referenceDuration)}
                                    </span>
                                </button>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate mb-1.5">
                                        {referenceAudioTitle || getAudioLabel(referenceAudioUrl)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-zinc-400 tabular-nums">{formatTime(referenceTime)}</span>
                                        <div
                                            className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-white/10 cursor-pointer group/seek"
                                            onClick={(e) => {
                                                if (referenceAudioRef.current && referenceDuration > 0) {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const percent = (e.clientX - rect.left) / rect.width;
                                                    referenceAudioRef.current.currentTime = percent * referenceDuration;
                                                }
                                            }}
                                        >
                                            <div
                                                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all relative"
                                                style={{ width: referenceDuration ? `${Math.min(100, (referenceTime / referenceDuration) * 100)}%` : '0%' }}
                                            >
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover/seek:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 tabular-nums">{formatTime(referenceDuration)}</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setReferenceAudioUrl(''); setReferenceAudioTitle(''); setReferencePlaying(false); setReferenceTime(0); setReferenceDuration(0); }}
                                    className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        )}

                        {/* Source/Cover Audio Player */}
                        {audioTab === 'source' && sourceAudioUrl && (
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => toggleAudio('source')}
                                    className="relative flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
                                >
                                    {sourcePlaying ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    )}
                                    <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-zinc-900 text-white px-1 py-0.5 rounded">
                                        {formatTime(sourceDuration)}
                                    </span>
                                </button>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate mb-1.5">
                                        {sourceAudioTitle || getAudioLabel(sourceAudioUrl)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-zinc-400 tabular-nums">{formatTime(sourceTime)}</span>
                                        <div
                                            className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-white/10 cursor-pointer group/seek"
                                            onClick={(e) => {
                                                if (sourceAudioRef.current && sourceDuration > 0) {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const percent = (e.clientX - rect.left) / rect.width;
                                                    sourceAudioRef.current.currentTime = percent * sourceDuration;
                                                }
                                            }}
                                        >
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all relative"
                                                style={{ width: sourceDuration ? `${Math.min(100, (sourceTime / sourceDuration) * 100)}%` : '0%' }}
                                            >
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover/seek:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 tabular-nums">{formatTime(sourceDuration)}</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setSourceAudioUrl(''); setSourceAudioTitle(''); setSourcePlaying(false); setSourceTime(0); setSourceDuration(0); }}
                                    className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                {/* Analyze button — runs Essentia BPM/key detection */}
                                {onAnalyzeSource && ['cover', 'repaint', 'audio2audio'].includes(taskType) && (
                                    <button
                                        type="button"
                                        onClick={onAnalyzeSource}
                                        disabled={isAnalyzing}
                                        title={t('analyzeSource')}
                                        className={`p-1.5 rounded-full transition-colors ${isAnalyzing
                                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 cursor-wait'
                                            : 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                                            }`}
                                    >
                                        {isAnalyzing ? (
                                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => openAudioModal(audioTab, 'uploads')}
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 px-3 py-2 text-xs font-medium transition-colors border border-zinc-200 dark:border-white/5"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                                {t('fromLibrary')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const input = audioTab === 'reference' ? referenceInputRef.current : sourceInputRef.current;
                                    input?.click();
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 px-3 py-2 text-xs font-medium transition-colors border border-zinc-200 dark:border-white/5"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                {t('upload')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioSelectionSection;
