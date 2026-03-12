import React, { useMemo } from 'react';
import { ChevronDown, Loader2, Mic, MicOff, Sparkles, Trash2 } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface LyricsSectionProps {
    showLyricsSub: boolean;
    setShowLyricsSub: (val: boolean) => void;
    instrumental: boolean;
    setInstrumental: (val: boolean) => void;
    lyrics: string;
    setLyrics: (val: string) => void;
    lyricsRef: React.RefObject<HTMLDivElement>;
    lyricsHeight: number;
    startResizing: (e: React.MouseEvent) => void;
    isFormattingLyrics: boolean;
    handleFormat: (target: 'lyrics' | 'style') => void;
    /** Optional: current duration in seconds — used for the too-long warning */
    duration?: number;
}

export const LyricsSection: React.FC<LyricsSectionProps> = ({
    showLyricsSub,
    setShowLyricsSub,
    instrumental,
    setInstrumental,
    lyrics,
    setLyrics,
    lyricsRef,
    lyricsHeight,
    startResizing,
    isFormattingLyrics,
    handleFormat,
    duration,
}) => {
    const { t } = useI18n();

    /** True if the word-count heuristic suggests lyrics are too long for the selected duration. */
    const tooLongWarning = useMemo(() => {
        if (!lyrics.trim() || !duration || duration <= 0) return false;
        // Exclude section headers like [Verse 1], [Chorus], etc.
        const contentLines = lyrics.split('\n').filter(
            line => line.trim() && !line.trim().startsWith('[')
        );
        const wordCount = contentLines.join(' ').split(/\s+/).filter(w => w.length > 0).length;
        // Heuristic: ~100 wpm singing pace → 0.6 s/word
        return wordCount > 0 && wordCount * 0.6 > duration;
    }, [lyrics, duration]);

    return (
        <div>
            {/* Section header */}
            <div className="w-full flex items-center justify-between py-2">
                <button
                    type="button"
                    onClick={() => setShowLyricsSub(!showLyricsSub)}
                    className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide"
                >
                    <span>{t('lyrics')}</span>
                    <ChevronDown size={14} className={`text-pink-500 chevron-icon ${showLyricsSub ? 'rotated' : ''}`} />
                </button>

                {/* Instrumental toggle — prominent tab in the section header */}
                <button
                    type="button"
                    onClick={() => setInstrumental(!instrumental)}
                    title={instrumental ? 'Switch to vocal mode' : 'Switch to instrumental mode'}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${instrumental
                            ? 'bg-pink-600 text-white border-pink-500 shadow-sm shadow-pink-500/30'
                            : 'bg-white dark:bg-suno-card border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:border-pink-400 dark:hover:border-pink-500/50 hover:text-pink-600 dark:hover:text-pink-400'
                        }`}
                >
                    {instrumental ? <MicOff size={10} /> : <Mic size={10} />}
                    {instrumental ? t('instrumental') : t('vocal')}
                </button>
            </div>

            {/* Instrumental mode — show a note instead of the textarea */}
            {instrumental && (
                <div className="flex items-center gap-2 py-3 px-3 bg-zinc-50 dark:bg-black/20 rounded-lg border border-zinc-200 dark:border-white/10 text-xs text-zinc-400 dark:text-zinc-500">
                    <MicOff size={13} className="flex-shrink-0 text-pink-400" />
                    <span>Instrumental mode — no lyrics will be sent. AceStep will generate a purely instrumental track from your style settings.</span>
                </div>
            )}

            {/* Lyrics textarea — only shown when not instrumental */}
            {!instrumental && showLyricsSub && (
                <div className="space-y-2">
                    <div
                        ref={lyricsRef}
                        className="bg-zinc-50 dark:bg-black/20 rounded-lg border border-zinc-200 dark:border-white/10 overflow-hidden relative flex flex-col transition-colors focus-within:border-pink-500 dark:focus-within:border-pink-500"
                        style={{ height: 'auto' }}
                    >
                        <div className="flex items-center justify-end gap-1 px-2 py-1.5 bg-zinc-100 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10">
                            <button
                                className={`p-1.5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded transition-colors ${isFormattingLyrics ? 'text-pink-500' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                                title={t('aiFormatTooltip')}
                                onClick={() => handleFormat('lyrics')}
                                disabled={isFormattingLyrics || !lyrics.trim()}
                            >
                                {isFormattingLyrics ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            </button>
                            <button
                                className="p-1.5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                                onClick={() => setLyrics('')}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <textarea
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                            placeholder={t('lyricsPlaceholder')}
                            className="flex-1 bg-transparent p-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none overflow-y-auto"
                            style={{ minHeight: `${lyricsHeight}px`, maxHeight: `${lyricsHeight}px` }}
                        />
                        <div
                            onMouseDown={startResizing}
                            className="h-3 w-full cursor-ns-resize flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors absolute bottom-0 left-0 z-10"
                        >
                            <div className="w-8 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                        </div>
                    </div>

                    {/* Lyrics meta row: char count + too-long warning */}
                    <div className="flex items-center justify-between gap-2 px-0.5">
                        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">
                            {lyrics === '' ? '0 lines · 0 chars' : `${lyrics.split('\n').length} line${lyrics.split('\n').length !== 1 ? 's' : ''} · ${lyrics.length} char${lyrics.length !== 1 ? 's' : ''}`}
                        </span>
                        {tooLongWarning && (
                            <span className="text-[10px] text-amber-500 dark:text-amber-400 flex items-center gap-1 font-medium">
                                ⚠ May be too long for selected duration
                            </span>
                        )}
                    </div>

                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{t('leaveLyricsEmpty')}</p>
                </div>
            )}
        </div>
    );
};

export default LyricsSection;
