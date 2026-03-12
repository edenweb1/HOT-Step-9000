import React from 'react';

interface MasteringToggleProps {
    isOriginal: boolean;
    onToggle: () => void;
    size?: 'sm' | 'md';
    className?: string;
}

/**
 * Slider toggle for switching between Mastered and Original audio.
 * Shows full text labels: "Mastered" or "Original".
 */
export const MasteringToggle: React.FC<MasteringToggleProps> = ({
    isOriginal,
    onToggle,
    size = 'md',
    className = '',
}) => {
    const isSm = size === 'sm';

    return (
        <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`relative inline-flex items-center rounded-full transition-all duration-200 cursor-pointer flex-shrink-0 ${
                isSm ? 'h-[22px]' : 'h-[26px]'
            } ${
                isOriginal
                    ? 'bg-zinc-300 dark:bg-zinc-600'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm shadow-amber-500/30'
            } ${className}`}
            title={isOriginal ? 'Playing original — click for mastered' : 'Playing mastered — click for original'}
        >
            {/* Mastered label */}
            <span className={`px-2.5 z-10 font-bold select-none transition-colors duration-200 ${
                isSm ? 'text-[9px]' : 'text-[10px]'
            } ${!isOriginal ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                Mastered
            </span>
            {/* Original label */}
            <span className={`px-2.5 z-10 font-bold select-none transition-colors duration-200 ${
                isSm ? 'text-[9px]' : 'text-[10px]'
            } ${isOriginal ? 'text-white' : 'text-white/50'}`}>
                Original
            </span>

            {/* Sliding pill highlight */}
            <span className={`absolute top-[2px] bottom-[2px] rounded-full transition-all duration-200 ${
                isOriginal
                    ? 'bg-zinc-500 dark:bg-zinc-400'
                    : 'bg-white/25'
            }`} style={{
                left: isOriginal ? '50%' : '2px',
                right: isOriginal ? '2px' : '50%',
            }} />
        </button>
    );
};

export default MasteringToggle;
