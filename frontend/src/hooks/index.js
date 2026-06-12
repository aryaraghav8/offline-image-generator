import { useState, useCallback, useEffect } from 'react';
export function useAsync(fn, options) {
    const [state, setState] = useState({
        data: null,
        loading: false,
        error: null,
    });
    const execute = useCallback(async () => {
        setState({ data: null, loading: true, error: null });
        try {
            const result = await fn();
            setState({ data: result, loading: false, error: null });
            options?.onSuccess?.();
            return result;
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setState({ data: null, loading: false, error });
            options?.onError?.(error);
            throw error;
        }
    }, [fn, options]);
    return { ...state, execute };
}
export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        }
        catch (error) {
            console.error(error);
            return initialValue;
        }
    });
    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);
    return [storedValue, setValue];
}
export function useClipboard() {
    const [copied, setCopied] = useState(false);
    const copy = useCallback(async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return true;
        }
        catch (error) {
            console.error('Failed to copy:', error);
            return false;
        }
    }, []);
    return { copied, copy };
}
export function useIntersectionObserver(options) {
    const [ref, setRef] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        if (!ref)
            return;
        const observer = new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting);
        }, options);
        observer.observe(ref);
        return () => observer.disconnect();
    }, [ref, options]);
    return { ref: setRef, isVisible };
}
