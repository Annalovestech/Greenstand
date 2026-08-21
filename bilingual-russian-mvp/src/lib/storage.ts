import { createInitialState } from "./data";
import type { AppState } from "./types";

const STORAGE_KEY = "lado-bilingual-mvp-v2";

function isValidState(parsed: AppState): boolean {
  return Boolean(
    parsed.children?.length &&
      parsed.progressByChild &&
      parsed.schedule &&
      parsed.packages &&
      parsed.teachers?.length
  );
}

export function loadState(): AppState {
  if (typeof window === "undefined") {
    return createInitialState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as AppState;
    if (!isValidState(parsed)) return createInitialState();
    return parsed;
  } catch {
    return createInitialState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): AppState {
  const fresh = createInitialState();
  saveState(fresh);
  return fresh;
}
