import { useState, useEffect, useCallback } from 'react';

const PERSIST_FLAG_KEY = 'ace-persist-enabled';

/**
 * Check if settings persistence is currently enabled.
 */
export function isPersistenceEnabled(): boolean {
    try {
        return localStorage.getItem(PERSIST_FLAG_KEY) === '1';
    } catch {
        return false;
    }
}

/**
 * Enable or disable settings persistence.
 * When disabling, all persisted `ace-*` keys are cleared.
 */
export function setPersistenceEnabled(enabled: boolean): void {
    try {
        if (enabled) {
            localStorage.setItem(PERSIST_FLAG_KEY, '1');
        } else {
            clearPersistedSettings();
            localStorage.removeItem(PERSIST_FLAG_KEY);
        }
    } catch {
        // localStorage unavailable
    }
}

/**
 * Remove all `ace-*` keys from localStorage (except the persist flag itself
 * and auth/language keys which are managed separately).
 */
export function clearPersistedSettings(): void {
    try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('ace-') && key !== PERSIST_FLAG_KEY) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {
        // localStorage unavailable
    }
}

/**
 * Drop-in replacement for `useState` that auto-persists to localStorage
 * when persistence is enabled.
 *
 * Usage:
 *   const [value, setValue] = usePersistedState('ace-myKey', defaultValue);
 *
 * When persistence is disabled, behaves identically to useState(defaultValue).
 * When persistence is enabled:
 *   - Initializes from localStorage if a value exists
 *   - Writes to localStorage on every state change
 */
export function usePersistedState<T>(
    key: string,
    defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
    const [state, setStateRaw] = useState<T>(() => {
        if (!isPersistenceEnabled()) return defaultValue;
        try {
            const stored = localStorage.getItem(key);
            if (stored === null) return defaultValue;
            const parsed = JSON.parse(stored) as T;
            // Guard against JSON null stored by a previous crash — treat as missing
            if (parsed === null || parsed === undefined) return defaultValue;
            return parsed;
        } catch {
            return defaultValue;
        }
    });

    // Persist on every change (only if enabled)
    useEffect(() => {
        if (!isPersistenceEnabled()) return;
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch {
            // localStorage full or unavailable
        }
    }, [key, state]);

    // Wrap setter to ensure the same API as useState
    const setState = useCallback(
        (value: T | ((prev: T) => T)) => {
            setStateRaw(value);
        },
        [],
    );

    return [state, setState];
}
