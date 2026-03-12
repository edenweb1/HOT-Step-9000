import React from 'react';
import { Upload, RefreshCw, Music2, Trash2, Play, Pause } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface Track {
    id: string;
    filename: string;
    audio_url: string;
    tags?: string[];
    duration?: number;
}

interface CreatedTrack {
    id: string;
    title: string;
    audio_url: string;
    duration?: string;
}

interface AudioLibraryModalProps {
    showAudioModal: boolean;
    setShowAudioModal: (val: boolean) => void;
    audioModalTarget: 'reference' | 'source' | null;
    setPlayingTrackId: (val: string | null) => void;
    setPlayingTrackSource: (val: 'uploads' | 'created' | null) => void;
    uploadReferenceTrack: (file: File) => Promise<void>;
    isUploadingReference: boolean;
    isTranscribingReference: boolean;
    uploadError: string | null;
    cancelTranscription: () => void;
    libraryTab: 'uploads' | 'created';
    setLibraryTab: (val: 'uploads' | 'created') => void;
    isLoadingTracks: boolean;
    referenceTracks: Track[];
    setReferenceTracks: React.Dispatch<React.SetStateAction<Track[]>>;
    toggleModalTrack: (params: { id: string, audio_url: string, source: 'uploads' | 'created' }) => void;
    playingTrackId: string | null;
    playingTrackSource: 'uploads' | 'created' | null;
    modalTrackTime: number;
    setModalTrackTime: (val: number) => void;
    modalTrackDuration: number;
    setModalTrackDuration: (val: number) => void;
    modalAudioRef: React.RefObject<HTMLAudioElement>;
    formatTime: (secs: number) => string;
    useReferenceTrack: (track: { audio_url: string, title?: string }) => void;
    deleteReferenceTrack: (id: string) => Promise<void>;
    createdTrackOptions: CreatedTrack[];
    token: string | null;
}

export const AudioLibraryModal: React.FC<AudioLibraryModalProps> = ({
    showAudioModal, setShowAudioModal, audioModalTarget, setPlayingTrackId, setPlayingTrackSource,
    uploadReferenceTrack, isUploadingReference, isTranscribingReference, uploadError, cancelTranscription,
    libraryTab, setLibraryTab, isLoadingTracks, referenceTracks, setReferenceTracks, toggleModalTrack,
    playingTrackId, playingTrackSource, modalTrackTime, setModalTrackTime, modalTrackDuration, setModalTrackDuration,
    modalAudioRef, formatTime, useReferenceTrack, deleteReferenceTrack, createdTrackOptions, token
}) => {
    const { t } = useI18n();

    if (!showAudioModal) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => { setShowAudioModal(false); setPlayingTrackId(null); setPlayingTrackSource(null); }}
            />
            <div className="relative w-[92%] max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-5 pb-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                                {audioModalTarget === 'reference' ? t('referenceModalTitle') : t('coverModalTitle')}
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                {audioModalTarget === 'reference'
                                    ? t('referenceModalDescription')
                                    : t('coverModalDescription')}
                            </p>
                        </div>
                        <button
                            onClick={() => { setShowAudioModal(false); setPlayingTrackId(null); setPlayingTrackSource(null); }}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Upload Button */}
                    <button
                        type="button"
                        onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.mp3,.wav,.flac,.m4a,.mp4,audio/*';
                            input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) void uploadReferenceTrack(file);
                            };
                            input.click();
                        }}
                        disabled={isUploadingReference || isTranscribingReference}
                        className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 dark:border-white/20 bg-zinc-50 dark:bg-white/5 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 hover:border-zinc-400 dark:hover:border-white/30 transition-all"
                    >
                        {isUploadingReference ? (
                            <>
                                <RefreshCw size={16} className="animate-spin" />
                                {t('uploadingAudio')}
                            </>
                        ) : isTranscribingReference ? (
                            <>
                                <RefreshCw size={16} className="animate-spin" />
                                {t('transcribing')}
                            </>
                        ) : (
                            <>
                                <Upload size={16} />
                                {t('uploadAudio')}
                                <span className="text-xs text-zinc-400 ml-1">{t('audioFormats')}</span>
                            </>
                        )}
                    </button>

                    {uploadError && (
                        <div className="mt-2 text-xs text-rose-500">{uploadError}</div>
                    )}
                    {isTranscribingReference && (
                        <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                            <span>{t('transcribingWithWhisper')}</span>
                            <button
                                type="button"
                                onClick={cancelTranscription}
                                className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Library Section */}
                <div className="border-t border-zinc-100 dark:border-white/5">
                    <div className="px-5 py-3 flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-zinc-200/60 dark:bg-white/10 rounded-full p-0.5">
                            <button
                                type="button"
                                onClick={() => setLibraryTab('uploads')}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${libraryTab === 'uploads'
                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                                    }`}
                            >
                                {t('uploaded')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setLibraryTab('created')}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${libraryTab === 'created'
                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                                    }`}
                            >
                                {t('createdTab')}
                            </button>
                        </div>
                    </div>

                    {/* Track List */}
                    <div className="max-h-[280px] overflow-y-auto">
                        {libraryTab === 'uploads' ? (
                            isLoadingTracks ? (
                                <div className="px-5 py-8 text-center">
                                    <RefreshCw size={20} className="animate-spin mx-auto text-zinc-400" />
                                    <p className="text-xs text-zinc-400 mt-2">{t('loadingTracks')}</p>
                                </div>
                            ) : referenceTracks.length === 0 ? (
                                <div className="px-5 py-8 text-center">
                                    <Music2 size={24} className="mx-auto text-zinc-300 dark:text-zinc-600" />
                                    <p className="text-sm text-zinc-400 mt-2">{t('noTracksYet')}</p>
                                    <p className="text-xs text-zinc-400 mt-1">{t('uploadAudioFilesAsReferences')}</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-100 dark:divide-white/5">
                                    {referenceTracks.map((track) => (
                                        <div
                                            key={track.id}
                                            className="px-5 py-3 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group"
                                        >
                                            {/* Play Button */}
                                            <button
                                                type="button"
                                                onClick={() => toggleModalTrack({ id: track.id, audio_url: track.audio_url, source: 'uploads' })}
                                                className="flex-shrink-0 w-9 h-9 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors"
                                            >
                                                {playingTrackId === track.id && playingTrackSource === 'uploads' ? (
                                                    <Pause size={14} fill="currentColor" />
                                                ) : (
                                                    <Play size={14} fill="currentColor" className="ml-0.5" />
                                                )}
                                            </button>

                                            {/* Track Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                                                        {track.filename.replace(/\.[^/.]+$/, '')}
                                                    </span>
                                                    {track.tags && track.tags.length > 0 && (
                                                        <div className="flex gap-1">
                                                            {track.tags.slice(0, 2).map((tag, i) => (
                                                                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-400">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Progress bar with seek - show when this track is playing */}
                                                {playingTrackId === track.id && playingTrackSource === 'uploads' ? (
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="text-[10px] text-zinc-400 tabular-nums w-8">
                                                            {formatTime(modalTrackTime)}
                                                        </span>
                                                        <div
                                                            className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-white/10 cursor-pointer group/seek"
                                                            onClick={(e) => {
                                                                if (modalAudioRef.current && modalTrackDuration > 0) {
                                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                                    const percent = (e.clientX - rect.left) / rect.width;
                                                                    modalAudioRef.current.currentTime = percent * modalTrackDuration;
                                                                }
                                                            }}
                                                        >
                                                            <div
                                                                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full relative"
                                                                style={{ width: modalTrackDuration > 0 ? `${(modalTrackTime / modalTrackDuration) * 100}%` : '0%' }}
                                                            >
                                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover/seek:opacity-100 transition-opacity" />
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-zinc-400 tabular-nums w-8 text-right">
                                                            {formatTime(modalTrackDuration)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-zinc-400 mt-0.5">
                                                        {track.duration ? formatTime(track.duration) : '--:--'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={() => useReferenceTrack({ audio_url: track.audio_url, title: track.filename })}
                                                    className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                                                >
                                                    {t('useTrack')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => void deleteReferenceTrack(track.id)}
                                                    className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-400 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : createdTrackOptions.length === 0 ? (
                            <div className="px-5 py-8 text-center">
                                <Music2 size={24} className="mx-auto text-zinc-300 dark:text-zinc-600" />
                                <p className="text-sm text-zinc-400 mt-2">{t('noCreatedSongsYet')}</p>
                                <p className="text-xs text-zinc-400 mt-1">{t('generateSongsToReuse')}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100 dark:divide-white/5">
                                {createdTrackOptions.map((track) => (
                                    <div
                                        key={track.id}
                                        className="px-5 py-3 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleModalTrack({ id: track.id, audio_url: track.audio_url, source: 'created' })}
                                            className="flex-shrink-0 w-9 h-9 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors"
                                        >
                                            {playingTrackId === track.id && playingTrackSource === 'created' ? (
                                                <Pause size={14} fill="currentColor" />
                                            ) : (
                                                <Play size={14} fill="currentColor" className="ml-0.5" />
                                            )}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                                                {track.title}
                                            </div>
                                            {playingTrackId === track.id && playingTrackSource === 'created' ? (
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[10px] text-zinc-400 tabular-nums w-8">
                                                        {formatTime(modalTrackTime)}
                                                    </span>
                                                    <div
                                                        className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-white/10 cursor-pointer group/seek"
                                                        onClick={(e) => {
                                                            if (modalAudioRef.current && modalTrackDuration > 0) {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                const percent = (e.clientX - rect.left) / rect.width;
                                                                modalAudioRef.current.currentTime = percent * modalTrackDuration;
                                                            }
                                                        }}
                                                    >
                                                        <div
                                                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full relative"
                                                            style={{ width: modalTrackDuration > 0 ? `${(modalTrackTime / modalTrackDuration) * 100}%` : '0%' }}
                                                        >
                                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover/seek:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-zinc-400 tabular-nums w-8 text-right">
                                                        {formatTime(modalTrackDuration)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-zinc-400 mt-0.5">
                                                    {track.duration || '--:--'}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => useReferenceTrack({ audio_url: track.audio_url, title: track.title })}
                                                className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                                            >
                                                {t('useTrack')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <audio
                ref={modalAudioRef}
                onTimeUpdate={() => {
                    if (modalAudioRef.current) {
                        setModalTrackTime(modalAudioRef.current.currentTime);
                    }
                }}
                onLoadedMetadata={() => {
                    if (modalAudioRef.current) {
                        setModalTrackDuration(modalAudioRef.current.duration);
                        // Update track duration in database if not set
                        const track = referenceTracks.find(t => t.id === playingTrackId);
                        if (playingTrackSource === 'uploads' && track && !track.duration && token) {
                            fetch(`/api/reference-tracks/${track.id}`, {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({ duration: Math.round(modalAudioRef.current.duration) })
                            }).then(() => {
                                setReferenceTracks(prev => prev.map(t =>
                                    t.id === track.id ? { ...t, duration: Math.round(modalAudioRef.current?.duration || 0) } : t
                                ));
                            }).catch(() => undefined);
                        }
                    }
                }}
                onEnded={() => setPlayingTrackId(null)}
            />
        </div>
    );
};

export default AudioLibraryModal;
