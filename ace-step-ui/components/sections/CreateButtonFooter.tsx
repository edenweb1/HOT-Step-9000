import React, { useState, useEffect } from 'react';
import { useI18n } from '../../context/I18nContext';

interface CreateButtonFooterProps {
    handleGenerate: () => void;
    isGenerating: boolean;
    isAuthenticated: boolean;
    activeJobCount: number;
}

export const CreateButtonFooter: React.FC<CreateButtonFooterProps> = ({
    handleGenerate,
    isGenerating,
    isAuthenticated,
    activeJobCount
}) => {
    const { t } = useI18n();
    const [elapsedSecs, setElapsedSecs] = useState(0);

    // Start/stop elapsed timer based on isGenerating
    useEffect(() => {
        if (!isGenerating) {
            setElapsedSecs(0);
            return;
        }
        setElapsedSecs(0);
        const start = Date.now();
        const id = setInterval(() => {
            setElapsedSecs(Math.floor((Date.now() - start) / 1000));
        }, 1000);
        return () => clearInterval(id);
    }, [isGenerating]);

    const formatElapsed = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
    };

    return (
        <div className="p-4 mt-auto sticky bottom-0 bg-zinc-50/95 dark:bg-suno-panel/95 backdrop-blur-sm z-10 border-t border-zinc-200 dark:border-white/5 space-y-3">
            <button
                onClick={handleGenerate}
                className={`w-full h-12 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg ${isGenerating
                    ? 'bg-gradient-to-r from-orange-400/80 to-pink-500/80 text-white hover:brightness-110'
                    : 'bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:brightness-110'
                    }`}
                disabled={!isAuthenticated}
            >
                {isGenerating ? (
                    <>
                        <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                        <span>
                            {activeJobCount > 0
                                ? `${t('queueNext')} (${activeJobCount} active)`
                                : 'Generating…'
                            }
                        </span>
                        {elapsedSecs > 0 && (
                            <span className="text-xs font-normal text-white/70 tabular-nums ml-1">
                                {formatElapsed(elapsedSecs)}
                            </span>
                        )}
                    </>
                ) : (
                    <span>{t('createSong')}</span>
                )}
            </button>

            {/* Keyboard shortcut hint */}
            {!isGenerating && (
                <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-600">
                    <kbd className="font-mono">Ctrl</kbd>+<kbd className="font-mono">Enter</kbd> to generate
                </p>
            )}

            {!isAuthenticated && (
                <p className="text-center text-xs text-rose-500 font-medium">{t('loginRequired')}</p>
            )}
        </div>
    );
};

export default CreateButtonFooter;
