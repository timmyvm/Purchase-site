"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const readValue = <T,>(key: string, initialValue: T): T => {
  if (typeof window === "undefined") {
    return initialValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  } catch (error) {
    console.error(error);
    return initialValue;
  }
};

// The hydrated flag lives INSIDE the state object so the write effect always
// sees flag and value from the same committed state. Tracking it in a ref (or
// writing unconditionally, as this hook originally did) let the mount-commit
// write effect persist the default over the stored value — React eagerly
// evaluates queued updaters, so a ref flips before the stale closure runs.
// StrictMode's double effect pass then re-read the clobbered storage, which
// is why carts wiped on every hard reload in dev.
type StoredState<T> = { value: T; hydrated: boolean };

export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const initialValueRef = useRef(initialValue);
  const [state, setState] = useState<StoredState<T>>({
    value: initialValue,
    hydrated: false,
  });

  useEffect(() => {
    setState({ value: readValue(key, initialValueRef.current), hydrated: true });
  }, [key]);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state.value));
    } catch (error) {
      console.error(error);
    }
  }, [key, state]);

  const setValue = useCallback((value: T | ((current: T) => T)) => {
    setState((current) => ({
      value: value instanceof Function ? value(current.value) : value,
      hydrated: current.hydrated,
    }));
  }, []);

  // `hydrated` flips true in the same commit that loads the stored value, so a
  // consumer that waits on it knows `value` is the real one, not the default.
  // Child effects run BEFORE this hook's read effect, so anything merging into
  // stored state on mount has to wait for it or the read lands on top.
  return [state.value, setValue, state.hydrated] as const;
};
