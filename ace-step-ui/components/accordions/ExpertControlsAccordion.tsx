import React from 'react';
import { Settings2, ChevronDown } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface ExpertControlsAccordionProps {
    isOpen: boolean;
    onToggle: () => void;
    uploadError: string | null;
    audioCodes: string;
    onAudioCodesChange: (val: string) => void;
    instruction: string;
    onInstructionChange: (val: string) => void;
    customTimesteps: string;
    onCustomTimestepsChange: (val: string) => void;
    trackName: string;
    onTrackNameChange: (val: string) => void;
    completeTrackClasses: string;
    onCompleteTrackClassesChange: (val: string) => void;
    autogen: boolean;
    onToggleAutogen: () => void;
    getLrc: boolean;
    onToggleGetLrc: () => void;
}

export const ExpertControlsAccordion: React.FC<ExpertControlsAccordionProps> = ({
    isOpen,
    onToggle,
    uploadError,
    audioCodes,
    onAudioCodesChange,
    instruction,
    onInstructionChange,
    customTimesteps,
    onCustomTimestepsChange,
    trackName,
    onTrackNameChange,
    completeTrackClasses,
    onCompleteTrackClassesChange,
    autogen,
    onToggleAutogen,
    getLrc,
    onToggleGetLrc,
}) => {
    const { t } = useI18n();

    return (
        <div>
            <button
                type="button"
                onClick={onToggle}
                className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-suno-card border border-zinc-200 dark:border-white/5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors ${isOpen ? 'rounded-t-xl rounded-b-none border-b-0' : 'rounded-xl'}`}
            >
                <span className="flex items-center gap-2">
                    <Settings2 size={16} className="text-pink-500" />
                    {t('expertControls')}
                </span>
                <ChevronDown size={18} className={`text-pink-500 chevron-icon ${isOpen ? 'rotated' : ''}`} />
            </button>

            {isOpen && (
                <div className="bg-white dark:bg-suno-card rounded-b-xl rounded-t-none border border-t-0 border-zinc-200 dark:border-white/5 p-4 space-y-4">
                    {uploadError && (
                        <div className="text-[11px] text-rose-500">{uploadError}</div>
                    )}

                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide" title={t('transformTooltip')}>{t('transform')}</h4>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{t('controlSourceAudio')}</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400" title={t('audioCodesTooltip')}>{t('audioCodes')}</label>
                        <textarea
                            value={audioCodes}
                            onChange={(e) => onAudioCodesChange(e.target.value)}
                            placeholder={t('optionalAudioCodes')}
                            className="w-full h-16 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-lg p-2 text-xs text-zinc-900 dark:text-white focus:outline-none resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400" title={t('instructionTooltip')}>{t('instruction')}</label>
                        <textarea
                            value={instruction}
                            onChange={(e) => onInstructionChange(e.target.value)}
                            className="w-full h-16 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-lg p-2 text-xs text-zinc-900 dark:text-white focus:outline-none resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400" title={t('customTimestepsTooltip')}>{t('customTimesteps')}</label>
                        <input
                            type="text"
                            value={customTimesteps}
                            onChange={(e) => onCustomTimestepsChange(e.target.value)}
                            placeholder={t('timestepsPlaceholder')}
                            className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{t('trackName')}</label>
                        <input
                            type="text"
                            value={trackName}
                            onChange={(e) => onTrackNameChange(e.target.value)}
                            placeholder={t('optionalTrackName')}
                            className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{t('completeTrackClasses')}</label>
                        <input
                            type="text"
                            value={completeTrackClasses}
                            onChange={(e) => onCompleteTrackClassesChange(e.target.value)}
                            placeholder={t('trackClassesPlaceholder')}
                            className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400" title={t('autogenHint')}>
                            <input type="checkbox" checked={autogen} onChange={onToggleAutogen} />
                            {t('autogen')}
                        </label>
                        <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400" title={t('getLrcTooltip')}>
                            <input type="checkbox" checked={getLrc} onChange={onToggleGetLrc} />
                            {t('getLrcLyrics')}
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpertControlsAccordion;
