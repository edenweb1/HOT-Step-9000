// AudioAnalysisContext.tsx — Shared audio analysis for live visualizers
// Provides an AnalyserNode connected to the main player's HTMLAudioElement
//
// IMPORTANT: The AudioContext and MediaElementAudioSourceNode are stored
// module-level so they survive React HMR / fast-refresh. You can only call
// createMediaElementSource ONCE per element per AudioContext — if the
// React tree unmounts and remounts (HMR), the refs would be lost but the
// browser-level binding still exists, breaking reconnection.

import React, { createContext, useContext, useCallback, useState, useRef } from 'react';

interface AudioAnalysisContextValue {
    /** Connect the analyser to an audio element. Call once on first play. */
    connect: (audioElement: HTMLAudioElement) => void;
    /** Resume the AudioContext if it was suspended by the browser. */
    resume: () => void;
    /** The AnalyserNode, null until connect() is called. */
    analyserNode: AnalyserNode | null;
    /** Whether the analyser is connected to an audio element. */
    isConnected: boolean;
}

const AudioAnalysisContext = createContext<AudioAnalysisContextValue>({
    connect: () => { },
    resume: () => { },
    analyserNode: null,
    isConnected: false,
});

export const useAudioAnalysis = () => useContext(AudioAnalysisContext);

// ── Module-level singletons (survive HMR) ────────────────────────────────

let _audioContext: AudioContext | null = null;
let _sourceNode: MediaElementAudioSourceNode | null = null;
let _analyserNode: AnalyserNode | null = null;
let _connectedElement: HTMLAudioElement | null = null;

interface AudioAnalysisProviderProps {
    children: React.ReactNode;
}

export const AudioAnalysisProvider: React.FC<AudioAnalysisProviderProps> = ({ children }) => {
    const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(_analyserNode);
    const [isConnected, setIsConnected] = useState(_connectedElement !== null);
    // Guard against multiple simultaneous connect() calls
    const connectingRef = useRef(false);

    const resume = useCallback(() => {
        if (_audioContext && _audioContext.state === 'suspended') {
            _audioContext.resume().catch(console.error);
        }
    }, []);

    const connect = useCallback((audioElement: HTMLAudioElement) => {
        // Already connected to this element — just resume if needed
        if (_connectedElement === audioElement && _analyserNode) {
            resume();
            // Sync React state with module-level state (covers HMR remount)
            if (!analyserNode) {
                setAnalyserNode(_analyserNode);
                setIsConnected(true);
            }
            return;
        }

        // Guard against re-entrant calls
        if (connectingRef.current) return;
        connectingRef.current = true;

        try {
            // Create AudioContext if needed (or reuse surviving one)
            if (!_audioContext || _audioContext.state === 'closed') {
                const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
                _audioContext = new AudioContextClass();
            }

            // Resume if suspended (browser autoplay policy)
            if (_audioContext.state === 'suspended') {
                _audioContext.resume().catch(console.error);
            }

            // Create analyser
            const analyser = _audioContext.createAnalyser();
            analyser.fftSize = 2048;
            _analyserNode = analyser;

            // Connect: element → source → analyser → destination
            // createMediaElementSource can only be called once per element
            if (!_sourceNode) {
                try {
                    const source = _audioContext.createMediaElementSource(audioElement);
                    _sourceNode = source;
                } catch (err) {
                    // If createMediaElementSource fails (element already bound to
                    // a different AudioContext that was garbage-collected), create
                    // a brand-new AudioContext and try again.
                    console.warn('AudioAnalysis: createMediaElementSource failed, creating new context', err);
                    _audioContext = new AudioContext();
                    const source = _audioContext.createMediaElementSource(audioElement);
                    _sourceNode = source;
                    // Re-create analyser in new context
                    const newAnalyser = _audioContext.createAnalyser();
                    newAnalyser.fftSize = 2048;
                    _analyserNode = newAnalyser;
                }
            } else {
                // Source already exists — just rewire through new analyser
                _sourceNode.disconnect();
            }

            _sourceNode.connect(_analyserNode);
            _analyserNode.connect(_audioContext.destination);

            _connectedElement = audioElement;
            setAnalyserNode(_analyserNode);
            setIsConnected(true);
        } catch (err) {
            console.error('AudioAnalysis: Failed to connect', err);
        } finally {
            connectingRef.current = false;
        }
    }, [resume, analyserNode]);

    return (
        <AudioAnalysisContext.Provider value={{
            connect,
            resume,
            analyserNode,
            isConnected,
        }}>
            {children}
        </AudioAnalysisContext.Provider>
    );
};
