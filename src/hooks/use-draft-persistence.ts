import { useEffect, useRef } from "react";

/**
 * Persists arbitrary form state to sessionStorage so that navigating away
 * and back within the same tab restores in-progress edits.
 *
 * - sessionStorage is cleared automatically on tab close / hard refresh,
 *   matching the requirement: "kept in memory unless the page is refreshed".
 * - Call `clearDraft()` after a successful save to discard the draft.
 *
 * Usage:
 *   const { clearDraft } = useDraftPersistence(
 *     "hero-editor",
 *     form,
 *     setForm,
 *     ready, // only start persisting/restoring after initial DB load completes
 *   );
 */
export function useDraftPersistence<T>(
  key: string,
  state: T,
  setState: (value: T) => void,
  ready: boolean,
) {
  const storageKey = `draft:${key}`;
  const restoredRef = useRef(false);

  // Restore once when ready
  useEffect(() => {
    if (!ready || restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed !== null && parsed !== undefined) {
          setState(parsed as T);
        }
      }
    } catch (e) {
      console.warn(`Failed to restore draft for ${key}`, e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, storageKey]);

  // Persist whenever state changes (after restore has completed)
  useEffect(() => {
    if (!ready || !restoredRef.current) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.warn(`Failed to persist draft for ${key}`, e);
    }
  }, [state, ready, storageKey, key]);

  const clearDraft = () => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {}
  };

  return { clearDraft };
}
