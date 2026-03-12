// SectionMarkers.tsx — Thin row of song structure markers positioned above the waveform
// Parses section markers from LRC files and displays them at their proportional position

import React, { useMemo, useState, useEffect } from 'react';

interface SectionMarker {
    time: number;
    label: string;
}

interface SectionMarkersProps {
    audioUrl?: string;
    duration: number;
}

function parseSectionMarkers(raw: string): SectionMarker[] {
    const markers: SectionMarker[] = [];
    for (const line of raw.replace(/\r/g, '').split('\n')) {
        const match = line.match(/^\[(\d+):(\d+)(?:\.(\d+))?\]\s*(.*)$/);
        if (match) {
            const mins = parseInt(match[1], 10);
            const secs = parseInt(match[2], 10);
            const cs = match[3] ? parseInt(match[3].padEnd(2, '0').slice(0, 2), 10) : 0;
            const text = match[4].trim();
            // Only keep section markers: text wrapped in brackets like [Verse 1 - driving]
            if (/^\[.*\]$/.test(text)) {
                // Strip brackets and everything after " - "
                let label = text.slice(1, -1); // remove [ and ]
                const dashIdx = label.indexOf(' - ');
                if (dashIdx !== -1) label = label.slice(0, dashIdx);
                // Capitalize first letter
                label = label.charAt(0).toUpperCase() + label.slice(1);
                markers.push({ time: mins * 60 + secs + cs / 100, label });
            }
        }
    }
    return markers.sort((a, b) => a.time - b.time);
}

export const SectionMarkers: React.FC<SectionMarkersProps> = ({ audioUrl, duration }) => {
    const [fetchedLrc, setFetchedLrc] = useState<string | null>(null);

    useEffect(() => {
        if (!audioUrl) { setFetchedLrc(null); return; }
        let cancelled = false;
        const lrcUrl = audioUrl.replace(/\.\w+$/, '.lrc');
        fetch(lrcUrl)
            .then(res => { if (!res.ok) throw new Error('No LRC'); return res.text(); })
            .then(text => { if (!cancelled && text.includes('[')) setFetchedLrc(text); })
            .catch(() => { if (!cancelled) setFetchedLrc(null); });
        return () => { cancelled = true; };
    }, [audioUrl]);

    const markers = useMemo(() => fetchedLrc ? parseSectionMarkers(fetchedLrc) : [], [fetchedLrc]);

    if (markers.length === 0 || !duration) return null;

    // Deduplicate consecutive markers with the same label
    const deduped = markers.filter((m, i) => i === 0 || m.label !== markers[i - 1].label);

    return (
        <div className="relative w-full h-5 bg-black/40 backdrop-blur-sm overflow-hidden select-none">
            {deduped.map((marker, i) => {
                const leftPct = (marker.time / duration) * 100;
                // Calculate width: span until next marker or end
                const nextTime = i + 1 < deduped.length ? deduped[i + 1].time : duration;
                const widthPct = ((nextTime - marker.time) / duration) * 100;

                return (
                    <div
                        key={`${marker.label}-${marker.time}`}
                        className="absolute top-0 h-full flex items-center"
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    >
                        {/* Left edge tick */}
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-white/20" />
                        {/* Label */}
                        <span
                            className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 pl-1.5 truncate"
                            title={marker.label}
                        >
                            {marker.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
