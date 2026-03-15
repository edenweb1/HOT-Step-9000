import React from 'react';
import { ChevronDown, Dices, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface StyleSectionProps {
    showStyleSub: boolean;
    setShowStyleSub: (val: boolean) => void;
    style: string;
    setStyle: React.Dispatch<React.SetStateAction<string>>;
    refreshMusicTags: () => void;
    isFormattingStyle: boolean;
    handleFormat: (target: 'lyrics' | 'style') => void;
    styleRef: React.RefObject<HTMLDivElement>;
    styleHeight: number;
    startResizingStyle: (e: React.MouseEvent) => void;
    genreDropdownRef: React.RefObject<HTMLDivElement>;
    showGenreDropdown: boolean;
    setShowGenreDropdown: (val: boolean) => void;
    selectedMainGenre: string;
    setSelectedMainGenre: (val: string) => void;
    selectedSubGenre: string;
    setSelectedSubGenre: (val: string) => void;
    getSubGenreCount: (mainGenre: string) => number;
    genreSearch: string;
    setGenreSearch: (val: string) => void;
    filteredCombinedGenres: { name: string, type: 'main' | 'other' }[];
    subGenreDropdownRef: React.RefObject<HTMLDivElement>;
    showSubGenreDropdown: boolean;
    setShowSubGenreDropdown: (val: boolean) => void;
    filteredSubGenres: string[];
    musicTags: string[];
    /** Optional song parameters for the combined prompt preview */
    bpm?: number;
    keyScale?: string;
    timeSignature?: string;
    /** Effective values after Cover Settings adjustments (tempo scale / pitch shift) — used only in the preview */
    effectiveBpm?: number;
    effectiveKeyScale?: string;
    /** Trigger word auto-injected from loaded LoKR adapter */
    triggerWord?: string;
}

export const StyleSection: React.FC<StyleSectionProps> = ({
    showStyleSub,
    setShowStyleSub,
    style,
    setStyle,
    refreshMusicTags,
    isFormattingStyle,
    handleFormat,
    styleRef,
    styleHeight,
    startResizingStyle,
    genreDropdownRef,
    showGenreDropdown,
    setShowGenreDropdown,
    selectedMainGenre,
    setSelectedMainGenre,
    selectedSubGenre,
    setSelectedSubGenre,
    getSubGenreCount,
    genreSearch,
    setGenreSearch,
    filteredCombinedGenres,
    subGenreDropdownRef,
    showSubGenreDropdown,
    setShowSubGenreDropdown,
    filteredSubGenres,
    musicTags,
    bpm,
    keyScale,
    timeSignature,
    effectiveBpm,
    effectiveKeyScale,
    triggerWord,
}) => {
    const { t } = useI18n();

    return (
        <div>
            <button
                type="button"
                onClick={() => setShowStyleSub(!showStyleSub)}
                className="w-full flex items-center justify-between py-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide"
            >
                <span>{t('styleOfMusic')}</span>
                <ChevronDown size={14} className={`text-pink-500 chevron-icon ${showStyleSub ? 'rotated' : ''}`} />
            </button>
            {showStyleSub && (
                <div className="space-y-3">
                    <div className="bg-zinc-50 dark:bg-black/20 rounded-lg border border-zinc-200 dark:border-white/10 overflow-visible">
                        <div className="flex items-center justify-between px-2 py-1.5 bg-zinc-100 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10">
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{t('genreMoodInstruments')}</p>
                            <div className="flex items-center gap-1">
                                <button className="p-1.5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded transition-colors text-zinc-500 hover:text-black dark:hover:text-white" title={t('refreshGenres')} onClick={refreshMusicTags}><Dices size={14} /></button>
                                <button className="p-1.5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded text-zinc-500 hover:text-black dark:hover:text-white transition-colors" onClick={() => setStyle('')}><Trash2 size={14} /></button>
                                <button
                                    className={`p-1.5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded transition-colors ${isFormattingStyle ? 'text-pink-500' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                                    title={t('aiFormatTooltip')}
                                    onClick={() => handleFormat('style')}
                                    disabled={isFormattingStyle || !style.trim()}
                                >
                                    {isFormattingStyle ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                </button>
                            </div>
                        </div>
                        <div
                            ref={styleRef}
                            className="relative flex flex-col h-full transition-colors focus-within:border-pink-500 dark:focus-within:border-pink-500 rounded-b-lg overflow-hidden"
                            style={{ minHeight: `${styleHeight}px`, maxHeight: `${styleHeight}px` }}
                        >
                            <textarea
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                                placeholder={t('styleOfMusicPlaceholder')}
                                className="w-full flex-1 bg-transparent p-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none overflow-y-auto pb-6"
                            />
                            <div
                                onMouseDown={startResizingStyle}
                                className="h-3 w-full cursor-ns-resize flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors absolute bottom-0 left-0 z-10"
                            >
                                <div className="w-8 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {/* Combined Genre Dropdown with Search */}
                        <div className="relative" ref={genreDropdownRef}>
                            <button
                                onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                                className="w-full flex items-center justify-between bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-200 hover:border-pink-300 dark:hover:border-pink-500/50 transition-all shadow-sm"
                            >
                                <span className={selectedMainGenre || selectedSubGenre ? 'text-zinc-900 dark:text-white font-medium' : 'text-zinc-400'}>
                                    {selectedSubGenre
                                        ? `${selectedMainGenre} › ${selectedSubGenre}`
                                        : selectedMainGenre
                                            ? `${selectedMainGenre} ${getSubGenreCount(selectedMainGenre) > 0 ? `(${getSubGenreCount(selectedMainGenre)} ${t('subGenres')})` : ''}`
                                            : t('selectGenre')}
                                </span>
                                <div className="flex items-center gap-1">
                                    {(selectedMainGenre || selectedSubGenre) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMainGenre('');
                                                setSelectedSubGenre('');
                                            }}
                                            className="p-0.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                            title={t('clearSelection')}
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                    <svg className={`w-4 h-4 text-zinc-400 transition-transform ${showGenreDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {/* Dropdown Panel */}
                            {showGenreDropdown && (
                                <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-2xl overflow-hidden" style={{ maxHeight: '500px' }}>
                                    {/* Search Input Inside Dropdown */}
                                    <div className="p-2 border-b border-zinc-100 dark:border-zinc-700">
                                        <div className="relative">
                                            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <input
                                                type="text"
                                                value={genreSearch}
                                                onChange={(e) => setGenreSearch(e.target.value)}
                                                placeholder={t('searchGenre') || 'Search genres...'}
                                                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 placeholder:text-zinc-400"
                                                autoFocus
                                            />
                                            {genreSearch && (
                                                <button
                                                    onClick={() => setGenreSearch('')}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dropdown Options - Combined and Sorted */}
                                    <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
                                        {filteredCombinedGenres.length > 0 && (
                                            <div className="py-1">
                                                {filteredCombinedGenres.map(({ name, type }) => {
                                                    const subCount = type === 'main' ? getSubGenreCount(name) : 0;
                                                    const isSelected = selectedMainGenre === name;
                                                    return (
                                                        <button
                                                            key={name}
                                                            onClick={() => {
                                                                if (type === 'main') {
                                                                    setSelectedMainGenre(name);
                                                                    setSelectedSubGenre('');
                                                                    setStyle(prev => prev ? `${prev}, ${name}` : name);
                                                                    if (subCount === 0) {
                                                                        setShowGenreDropdown(false);
                                                                        setGenreSearch('');
                                                                    }
                                                                } else {
                                                                    // Other genre - no sub genres
                                                                    setStyle(prev => prev ? `${prev}, ${name}` : name);
                                                                    setSelectedMainGenre('');
                                                                    setSelectedSubGenre('');
                                                                    setShowGenreDropdown(false);
                                                                    setGenreSearch('');
                                                                }
                                                            }}
                                                            className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition-colors ${isSelected
                                                                ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                                                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-700 dark:hover:text-pink-300'
                                                                }`}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <span className={`w-1.5 h-1.5 rounded-full ${type === 'main' ? 'bg-pink-400' : 'bg-zinc-300 dark:bg-zinc-600'}`} />
                                                                {name}
                                                            </span>
                                                            {type === 'main' && subCount > 0 && (
                                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded-full">
                                                                    {subCount}
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sub Genre Dropdown - Custom styled for dark mode support */}
                        {selectedMainGenre && filteredSubGenres.length > 0 && (
                            <div className="relative" ref={subGenreDropdownRef}>
                                <button
                                    onClick={() => setShowSubGenreDropdown(!showSubGenreDropdown)}
                                    className="w-full flex items-center justify-between bg-gradient-to-r from-pink-50/80 to-purple-50/80 dark:from-pink-950/30 dark:to-purple-950/30 border border-pink-200 dark:border-pink-700/50 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-200 hover:border-pink-300 dark:hover:border-pink-500 transition-all shadow-sm"
                                >
                                    <span className={selectedSubGenre ? 'text-zinc-900 dark:text-white font-medium' : 'text-zinc-500 dark:text-zinc-400'}>
                                        {selectedSubGenre || `${t('selectSubGenre')} (${filteredSubGenres.length})`}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {selectedSubGenre && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSubGenre('');
                                                }}
                                                className="p-0.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                title={t('clearSelection') || 'Clear'}
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                        <svg className={`w-4 h-4 text-zinc-400 transition-transform ${showSubGenreDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Sub Genre Dropdown Panel */}
                                {showSubGenreDropdown && (
                                    <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-2xl overflow-hidden" style={{ maxHeight: '300px' }}>
                                        <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
                                            <div className="py-1">
                                                {filteredSubGenres.map(genre => (
                                                    <button
                                                        key={genre}
                                                        onClick={() => {
                                                            setSelectedSubGenre(genre);
                                                            setStyle(prev => prev ? `${prev}, ${genre}` : genre);
                                                            setShowSubGenreDropdown(false);
                                                        }}
                                                        className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${selectedSubGenre === genre
                                                            ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
                                                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-700 dark:hover:text-pink-300'
                                                            }`}
                                                    >
                                                        {genre}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                    </div>
                    {/* Quick Tags */}
                    <div className="flex flex-wrap gap-2">
                        {musicTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setStyle(prev => prev ? `${prev}, ${tag}` : tag)}
                                className="text-[10px] font-medium bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white px-2.5 py-1 rounded-full transition-colors border border-zinc-200 dark:border-white/5"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* Combined Prompt Preview */}
                    {(() => {
                        const parts: string[] = [];
                        if (style.trim()) parts.push(style.trim());
                        const songParams: string[] = [];
                        if (effectiveKeyScale ?? keyScale) songParams.push((effectiveKeyScale ?? keyScale)!);
                        const previewBpm = effectiveBpm ?? bpm;
                        if (previewBpm && previewBpm > 0) songParams.push(`${previewBpm} BPM`);
                        if (timeSignature) songParams.push(timeSignature);
                        if (songParams.length > 0) parts.push(songParams.join(', '));
                        const preview = parts.join(' · ');
                        if (!preview) return null;
                        return (
                            <div className="bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 space-y-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">Style prompt{triggerWord ? ' (trigger word auto-injected)' : ''}</p>
                                <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed break-words">
                                    {triggerWord && !style.toLowerCase().includes(triggerWord.toLowerCase()) && (
                                        <span className="text-pink-500 font-semibold">{triggerWord}, </span>
                                    )}
                                    {preview}
                                </p>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default StyleSection;
