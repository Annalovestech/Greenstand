"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEMO_LESSON, createInitialState } from "./data";
import { applyLessonToProgress, generateLessonSummary } from "./progress";
import { loadState, resetState, saveState } from "./storage";
import type {
  AppState,
  CompletedLesson,
  ObservationResult,
} from "./types";

interface AppContextValue {
  ready: boolean;
  state: AppState;
  startLesson: (childId: string) => void;
  setActivityIndex: (index: number) => void;
  markTarget: (targetId: string, result: ObservationResult) => void;
  endLesson: (childId: string) => CompletedLesson | null;
  resetDemo: () => void;
  getChild: (id: string) => AppState["children"][number] | undefined;
  clearActiveLesson: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveState(state);
  }, [state, ready]);

  const startLesson = useCallback((childId: string) => {
    setState((prev) => ({
      ...prev,
      activeLesson: {
        childId,
        templateId: DEMO_LESSON.id,
        startedAt: new Date().toISOString(),
        currentActivityIndex: 0,
        results: {},
      },
    }));
  }, []);

  const setActivityIndex = useCallback((index: number) => {
    setState((prev) => {
      if (!prev.activeLesson) return prev;
      return {
        ...prev,
        activeLesson: {
          ...prev.activeLesson,
          currentActivityIndex: index,
        },
      };
    });
  }, []);

  const markTarget = useCallback((targetId: string, result: ObservationResult) => {
    setState((prev) => {
      if (!prev.activeLesson) return prev;
      return {
        ...prev,
        activeLesson: {
          ...prev.activeLesson,
          results: {
            ...prev.activeLesson.results,
            [targetId]: result,
          },
        },
      };
    });
  }, []);

  const endLesson = useCallback((childId: string) => {
    const active = state.activeLesson;
    if (!active || active.childId !== childId) return null;

    const child = state.children.find((c) => c.id === childId);
    const date = new Date().toISOString().slice(0, 10);
    const completed = generateLessonSummary({
      childId,
      childName: child?.name ?? "Child",
      results: active.results,
      date,
    });

    setState((prev) => {
      const lessons = [completed, ...(prev.lessonsByChild[childId] ?? [])];
      const progress = applyLessonToProgress(
        prev.progressByChild[childId],
        completed
      );

      const updatedChildren = prev.children.map((c) => {
        if (c.id !== childId) return c;
        return {
          ...c,
          currentGoal: completed.nextTarget,
          progressHighlights: [
            completed.progressGained,
            ...c.progressHighlights,
          ].slice(0, 4),
        };
      });

      return {
        ...prev,
        children: updatedChildren,
        lessonsByChild: {
          ...prev.lessonsByChild,
          [childId]: lessons,
        },
        progressByChild: {
          ...prev.progressByChild,
          [childId]: progress,
        },
        activeLesson: undefined,
        lastCompletedLessonId: completed.id,
      };
    });

    return completed;
  }, [state]);

  const clearActiveLesson = useCallback(() => {
    setState((prev) => ({ ...prev, activeLesson: undefined }));
  }, []);

  const resetDemo = useCallback(() => {
    setState(resetState());
  }, []);

  const getChild = useCallback(
    (id: string) => state.children.find((c) => c.id === id),
    [state.children]
  );

  const value = useMemo(
    () => ({
      ready,
      state,
      startLesson,
      setActivityIndex,
      markTarget,
      endLesson,
      resetDemo,
      getChild,
      clearActiveLesson,
    }),
    [
      ready,
      state,
      startLesson,
      setActivityIndex,
      markTarget,
      endLesson,
      resetDemo,
      getChild,
      clearActiveLesson,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
