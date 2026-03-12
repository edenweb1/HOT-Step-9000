import React, { useState, useEffect, useRef, useCallback } from 'react';

interface DualRangeSliderProps {
  label: string;
  minValue: number;
  maxValue: number;
  min: number;
  max: number;
  step: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  formatDisplay?: (value: number) => string;
  helpText?: string;
  /** When true, maxValue < 0 is treated as "auto" (pinned to right edge). Dragging max thumb to right edge emits autoMaxSentinel. */
  allowAutoMax?: boolean;
  /** Sentinel value emitted when max thumb hits right edge (default -1). */
  autoMaxSentinel?: number;
  /** Display label for the auto state (default "Auto"). */
  autoMaxLabel?: string;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  label,
  minValue,
  maxValue,
  min,
  max,
  step,
  onMinChange,
  onMaxChange,
  formatDisplay,
  helpText,
  allowAutoMax = false,
  autoMaxSentinel = -1,
  autoMaxLabel = 'End',
}) => {
  const isAutoMax = allowAutoMax && maxValue < 0;
  const effectiveMax = isAutoMax ? max : maxValue;

  const [editingMin, setEditingMin] = useState(false);
  const [editingMax, setEditingMax] = useState(false);
  const [minInput, setMinInput] = useState(minValue.toString());
  const [maxInput, setMaxInput] = useState(isAutoMax ? '' : maxValue.toString());
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<'min' | 'max' | null>(null);

  useEffect(() => {
    if (!editingMin) setMinInput(minValue.toString());
  }, [minValue, editingMin]);

  useEffect(() => {
    if (!editingMax) setMaxInput(isAutoMax ? '' : maxValue.toString());
  }, [maxValue, editingMax, isAutoMax]);

  const commitMin = () => {
    setEditingMin(false);
    const num = parseFloat(minInput);
    if (!isNaN(num)) {
      const clamped = Math.max(min, Math.min(effectiveMax, num));
      onMinChange(clamped);
    } else {
      setMinInput(minValue.toString());
    }
  };

  const commitMax = () => {
    setEditingMax(false);
    const raw = maxInput.trim();
    if (allowAutoMax && (raw === '' || raw === '-1' || raw.toLowerCase() === 'auto' || raw.toLowerCase() === 'end')) {
      onMaxChange(autoMaxSentinel);
      return;
    }
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      const clamped = Math.max(minValue, Math.min(max, num));
      if (allowAutoMax && clamped >= max) {
        onMaxChange(autoMaxSentinel);
      } else {
        onMaxChange(clamped);
      }
    } else {
      setMaxInput(isAutoMax ? '' : maxValue.toString());
    }
  };

  const handleKey = (e: React.KeyboardEvent, commit: () => void, cancel: () => void) => {
    if (e.key === 'Enter') commit();
    else if (e.key === 'Escape') cancel();
  };

  const getPercent = (val: number) => ((val - min) / (max - min)) * 100;

  const valueFromPosition = useCallback((clientX: number) => {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + percent * (max - min);
    return Math.round(raw / step) * step;
  }, [min, max, step]);

  const handlePointerDown = useCallback((e: React.PointerEvent, thumb: 'min' | 'max') => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = thumb;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const val = valueFromPosition(e.clientX);
    if (draggingRef.current === 'min') {
      onMinChange(Math.min(val, effectiveMax));
    } else {
      if (allowAutoMax && val >= max) {
        onMaxChange(autoMaxSentinel);
      } else {
        onMaxChange(Math.max(val, minValue));
      }
    }
  }, [valueFromPosition, minValue, effectiveMax, max, onMinChange, onMaxChange, allowAutoMax, autoMaxSentinel]);

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (draggingRef.current) return;
    const val = valueFromPosition(e.clientX);
    const distToMin = Math.abs(val - minValue);
    const distToMax = Math.abs(val - effectiveMax);
    if (distToMin <= distToMax) {
      onMinChange(Math.min(val, effectiveMax));
    } else {
      if (allowAutoMax && val >= max) {
        onMaxChange(autoMaxSentinel);
      } else {
        onMaxChange(Math.max(val, minValue));
      }
    }
  }, [valueFromPosition, minValue, effectiveMax, max, onMinChange, onMaxChange, allowAutoMax, autoMaxSentinel]);

  const display = (val: number) => formatDisplay ? formatDisplay(val) : val.toString();
  const displayMax = isAutoMax ? autoMaxLabel : display(effectiveMax);

  const minPercent = getPercent(minValue);
  const maxPercent = getPercent(effectiveMax);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
        <div className="flex items-center gap-1.5">
          {editingMin ? (
            <input
              type="number"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              onBlur={commitMin}
              onKeyDown={(e) => handleKey(e, commitMin, () => { setMinInput(minValue.toString()); setEditingMin(false); })}
              min={min}
              max={effectiveMax}
              step={step}
              autoFocus
              className="text-xs font-mono text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-pink-500 px-1.5 py-0.5 rounded-lg w-16 text-right shadow-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          ) : (
            <span
              onClick={() => setEditingMin(true)}
              className="text-xs font-mono text-zinc-700 dark:text-zinc-200 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-lg cursor-pointer hover:from-zinc-100 hover:to-zinc-200 dark:hover:from-zinc-700 dark:hover:to-zinc-800 transition-all shadow-sm"
            >
              {display(minValue)}
            </span>
          )}
          <span className="text-[10px] text-zinc-400">—</span>
          {editingMax ? (
            <input
              type="text"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onBlur={commitMax}
              onKeyDown={(e) => handleKey(e, commitMax, () => { setMaxInput(isAutoMax ? '' : maxValue.toString()); setEditingMax(false); })}
              placeholder={autoMaxLabel}
              autoFocus
              className="text-xs font-mono text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-pink-500 px-1.5 py-0.5 rounded-lg w-16 text-right shadow-sm focus:outline-none"
            />
          ) : (
            <span
              onClick={() => setEditingMax(true)}
              className="text-xs font-mono text-zinc-700 dark:text-zinc-200 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-lg cursor-pointer hover:from-zinc-100 hover:to-zinc-200 dark:hover:from-zinc-700 dark:hover:to-zinc-800 transition-all shadow-sm"
            >
              {displayMax}
            </span>
          )}
        </div>
      </div>
      <div
        ref={trackRef}
        className="relative h-2 bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 rounded-full shadow-inner cursor-pointer"
        onClick={handleTrackClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className="absolute top-0 h-full bg-gradient-to-r from-pink-400 to-rose-500 dark:from-pink-500 dark:to-rose-600 rounded-full pointer-events-none"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-zinc-200 rounded-full shadow-md border-2 border-pink-500 z-10 touch-none"
          style={{ left: `calc(${minPercent}% - 8px)` }}
          onPointerDown={(e) => handlePointerDown(e, 'min')}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-zinc-200 rounded-full shadow-md border-2 border-rose-500 z-10 touch-none"
          style={{ left: `calc(${maxPercent}% - 8px)` }}
          onPointerDown={(e) => handlePointerDown(e, 'max')}
        />
      </div>
      {helpText && (
        <p className="text-[10px] text-zinc-500">{helpText}</p>
      )}
    </div>
  );
};
