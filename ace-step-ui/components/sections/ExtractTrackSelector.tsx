import React from 'react';
import { useI18n } from '../../context/I18nContext';

/** Track names matching the backend constants in acestep/constants.py TRACK_NAMES */
const EXTRACT_TRACKS = [
    { value: 'vocals', key: 'trackVocals' as const },
    { value: 'backing_vocals', key: 'trackBackingVocals' as const },
    { value: 'drums', key: 'trackDrums' as const },
    { value: 'bass', key: 'trackBass' as const },
    { value: 'guitar', key: 'trackGuitar' as const },
    { value: 'keyboard', key: 'trackKeyboard' as const },
    { value: 'strings', key: 'trackStrings' as const },
    { value: 'synth', key: 'trackSynth' as const },
    { value: 'brass', key: 'trackBrass' as const },
    { value: 'woodwinds', key: 'trackWoodwinds' as const },
    { value: 'percussion', key: 'trackPercussion' as const },
    { value: 'fx', key: 'trackFx' as const },
];

interface ExtractTrackSelectorProps {
    extractTracks: string[];
    setExtractTracks: (val: string[]) => void;
    isTurboModel?: boolean;
}

export const ExtractTrackSelector: React.FC<ExtractTrackSelectorProps> = ({
    extractTracks,
    setExtractTracks,
    isTurboModel = false,
}) => {
    const { t } = useI18n();

    const toggleTrack = (value: string) => {
        if (extractTracks.includes(value)) {
            setExtractTracks(extractTracks.filter(v => v !== value));
        } else {
            setExtractTracks([...extractTracks, value]);
        }
    };

    return (
        <div className="bg-white dark:bg-suno-card rounded-xl border border-zinc-200 dark:border-white/5 overflow-hidden">
            <div className="px-3 py-2.5 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        {t('extractTrack')}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {extractTracks.length > 0
                            ? `${extractTracks.length} ${t('tracksSelected')}`
                            : t('selectTrackToExtract')}
                    </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {EXTRACT_TRACKS.map(({ value, key }) => {
                        const isSelected = extractTracks.includes(value);
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => toggleTrack(value)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${isSelected
                                        ? 'bg-pink-600 text-white border-pink-500'
                                        : 'bg-zinc-100 dark:bg-black/30 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                {t(key)}
                            </button>
                        );
                    })}
                </div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {t('extractTrackTooltipMulti')}
                </p>
                {isTurboModel && (
                    <p className="text-[10px] text-amber-500 dark:text-amber-400 font-medium">
                        ⚠️ {t('extractRequiresBaseModel')}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ExtractTrackSelector;
