// LyricsOverlay.tsx — Karaoke-style synced lyrics display
// Parses LRC format and highlights the current line in sync with playback

import React, { useMemo, useState, useEffect, useRef } from 'react';

interface LrcLine {
    time: number; // seconds
    text: string;
}

interface LyricsOverlayProps {
    lrc?: string;           // Raw LRC text
    audioUrl?: string;      // Audio URL — used to derive .lrc URL if lrc prop is missing
    currentTime: number;
    isPlaying: boolean;
}

/** Parse "[mm:ss.xx]text" lines into sorted array */
function parseLrc(raw: string): LrcLine[] {
    const lines: LrcLine[] = [];
    for (const line of raw.replace(/\r/g, '').split('\n')) {
        // Match [mm:ss.xx] or [mm:ss] format
        const match = line.match(/^\[(\d+):(\d+)(?:\.(\d+))?\]\s*(.*)$/);
        if (match) {
            const mins = parseInt(match[1], 10);
            const secs = parseInt(match[2], 10);
            const cs = match[3] ? parseInt(match[3].padEnd(2, '0').slice(0, 2), 10) : 0;
            const text = match[4].trim();
            if (text) {
                lines.push({ time: mins * 60 + secs + cs / 100, text });
            }
        }
    }
    return lines.sort((a, b) => a.time - b.time);
}

/** Find the index of the current line based on playback time */
function findCurrentIndex(lines: LrcLine[], time: number): number {
    if (lines.length === 0) return -1;
    // Binary search for the last line with time <= currentTime
    let lo = 0, hi = lines.length - 1, result = -1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (lines[mid].time <= time) {
            result = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return result;
}

const VISIBLE_LINES = 5; // Number of lines visible at once
const HALF = Math.floor(VISIBLE_LINES / 2);

export const LyricsOverlay: React.FC<LyricsOverlayProps> = ({
    lrc: lrcProp,
    audioUrl,
    currentTime,
    isPlaying,
}) => {
    const [fetchedLrc, setFetchedLrc] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Try to fetch .lrc file from server if no lrc prop provided
    useEffect(() => {
        console.log('[LyricsOverlay] mount/update — lrcProp:', !!lrcProp, 'audioUrl:', audioUrl);
        if (lrcProp) {
            setFetchedLrc(null);
            return;
        }
        if (!audioUrl) {
            console.log('[LyricsOverlay] No audioUrl, skipping fetch');
            return;
        }

        let cancelled = false;

        // The .lrc file is saved alongside the audio with the same path but .lrc extension
        // e.g. /audio/userId/songId.flac → /audio/userId/songId.lrc
        const directLrcUrl = audioUrl.replace(/\.\w+$/, '.lrc');
        console.log('[LyricsOverlay] Fetching LRC from:', directLrcUrl);

        fetch(directLrcUrl)
            .then(res => {
                console.log('[LyricsOverlay] Fetch response:', res.status, res.statusText);
                if (!res.ok) throw new Error(`LRC fetch failed: ${res.status}`);
                return res.text();
            })
            .then(text => {
                console.log('[LyricsOverlay] LRC text received, length:', text.length, 'has brackets:', text.includes('['));
                if (!cancelled && text.includes('[')) setFetchedLrc(text);
            })
            .catch((err) => {
                console.warn('[LyricsOverlay] Fetch error:', err.message);
                if (!cancelled) setFetchedLrc(null);
            });

        return () => { cancelled = true; };
    }, [lrcProp, audioUrl]);

    const rawLrc = lrcProp || fetchedLrc;
    const allLines = useMemo(() => rawLrc ? parseLrc(rawLrc) : [], [rawLrc]);
    // Filter out section markers (e.g. [Verse 1], [Chorus], [Instrumental]) for display
    // but keep them in allLines for future use
    const lines = useMemo(() => allLines.filter(l => !/^\[.*\]$/.test(l.text)), [allLines]);
    const currentIdx = findCurrentIndex(lines, currentTime);

    console.log('[LyricsOverlay] render — lines:', lines.length, 'currentIdx:', currentIdx, 'rawLrc:', !!rawLrc);

    if (lines.length === 0) return null;

    // Calculate which lines to show (window around current)
    const start = Math.max(0, currentIdx - HALF);
    const end = Math.min(lines.length, start + VISIBLE_LINES);
    const visibleLines = lines.slice(start, end);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
            <div className="flex flex-col items-center gap-3 px-8 max-w-3xl w-full">
                {visibleLines.map((line, i) => {
                    const globalIdx = start + i;
                    const isCurrent = globalIdx === currentIdx;
                    const distance = Math.abs(globalIdx - currentIdx);

                    return (
                        <div
                            key={`${globalIdx}-${line.time}`}
                            className="transition-all duration-500 ease-out text-center w-full"
                            style={{
                                opacity: isCurrent ? 1 : Math.max(0.15, 0.5 - distance * 0.15),
                                transform: `scale(${isCurrent ? 1.1 : Math.max(0.85, 1 - distance * 0.05)})`,
                                filter: isCurrent ? 'none' : `blur(${Math.min(2, distance * 0.5)}px)`,
                            }}
                        >
                            <span
                                className={`
                                    inline-block text-center leading-relaxed
                                    ${isCurrent
                                        ? 'text-2xl md:text-3xl font-bold text-white'
                                        : 'text-lg md:text-xl font-medium text-white/60'
                                    }
                                `}
                                style={{
                                    textShadow: isCurrent
                                        ? '0 0 30px rgba(236, 72, 153, 0.6), 0 2px 8px rgba(0,0,0,0.8)'
                                        : '0 2px 6px rgba(0,0,0,0.6)',
                                }}
                            >
                                {line.text}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
