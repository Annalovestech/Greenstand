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
import { DEMO_LESSON, DEMO_TEACHER_ID, createInitialState } from "./data";
import { applyLessonToProgress, generateLessonSummary } from "./progress";
import { loadState, resetState, saveState } from "./storage";
import type {
  AppRole,
  AppState,
  CompletedLesson,
  LessonStatus,
  ObservationResult,
  ScheduledLesson,
  ZoomMeeting,
} from "./types";

interface ScheduleInput {
  childId: string;
  teacherId: string;
  startsAt: string;
  durationMin: number;
  topic: string;
  zoom: ZoomMeeting;
  seriesId?: string;
}

interface AppContextValue {
  ready: boolean;
  state: AppState;
  setRole: (role: AppRole) => void;
  startLesson: (childId: string, scheduledLessonId?: string) => void;
  setActivityIndex: (index: number) => void;
  markTarget: (targetId: string, result: ObservationResult) => void;
  endLesson: (childId: string) => CompletedLesson | null;
  updateLessonStatus: (
    scheduledId: string,
    status: LessonStatus,
    opts?: { startsAt?: string }
  ) => void;
  updateZoom: (scheduledId: string, zoom: ZoomMeeting) => void;
  scheduleLesson: (input: ScheduleInput) => ScheduledLesson;
  adjustPackageBalance: (childId: string, delta: number) => void;
  markPackagePaid: (childId: string) => void;
  resetDemo: () => void;
  getChild: (id: string) => AppState["children"][number] | undefined;
  getTeacher: (id?: string) => AppState["teachers"][number] | undefined;
  getPackage: (childId: string) => AppState["packages"][number] | undefined;
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

  const setRole = useCallback((role: AppRole) => {
    setState((prev) => ({ ...prev, role }));
  }, []);

  const startLesson = useCallback(
    (childId: string, scheduledLessonId?: string) => {
      setState((prev) => {
        const schedule = scheduledLessonId
          ? prev.schedule.map((s) =>
              s.id === scheduledLessonId ? { ...s, status: "live" as const } : s
            )
          : prev.schedule;
        return {
          ...prev,
          schedule,
          activeLesson: {
            childId,
            templateId: DEMO_LESSON.id,
            scheduledLessonId,
            startedAt: new Date().toISOString(),
            currentActivityIndex: 0,
            results: {},
          },
        };
      });
    },
    []
  );

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

  const markTarget = useCallback(
    (targetId: string, result: ObservationResult) => {
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
    },
    []
  );

  const endLesson = useCallback(
    (childId: string) => {
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
      completed.scheduledLessonId = active.scheduledLessonId;

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

        const schedule = prev.schedule.map((s) =>
          s.id === active.scheduledLessonId
            ? { ...s, status: "completed" as const }
            : s
        );

        // Deduct package only on confirmed completion — not on Start.
        const packages = prev.packages.map((p) =>
          p.childId === childId
            ? {
                ...p,
                lessonsCompleted: Math.min(
                  p.lessonsPurchased,
                  p.lessonsCompleted + 1
                ),
              }
            : p
        );

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
          schedule,
          packages,
          activeLesson: undefined,
          lastCompletedLessonId: completed.id,
        };
      });

      return completed;
    },
    [state]
  );

  const updateLessonStatus = useCallback(
    (
      scheduledId: string,
      status: LessonStatus,
      opts?: { startsAt?: string }
    ) => {
      setState((prev) => {
        const lesson = prev.schedule.find((s) => s.id === scheduledId);
        if (!lesson) return prev;

        const schedule = prev.schedule.map((s) =>
          s.id === scheduledId
            ? {
                ...s,
                status,
                startsAt: opts?.startsAt ?? s.startsAt,
              }
            : s
        );

        let packages = prev.packages;
        if (status === "cancelled" || status === "no_show") {
          packages = prev.packages.map((p) => {
            if (p.childId !== lesson.childId) return p;
            if (status === "cancelled") {
              return { ...p, lessonsCancelled: p.lessonsCancelled + 1 };
            }
            return { ...p, lessonsNoShow: p.lessonsNoShow + 1 };
          });
        }
        if (status === "rescheduled") {
          packages = prev.packages.map((p) =>
            p.childId === lesson.childId
              ? { ...p, lessonsRescheduled: p.lessonsRescheduled + 1 }
              : p
          );
        }

        return { ...prev, schedule, packages };
      });
    },
    []
  );

  const updateZoom = useCallback((scheduledId: string, zoom: ZoomMeeting) => {
    setState((prev) => ({
      ...prev,
      schedule: prev.schedule.map((s) =>
        s.id === scheduledId ? { ...s, zoom } : s
      ),
    }));
  }, []);

  const scheduleLesson = useCallback((input: ScheduleInput) => {
    const created: ScheduledLesson = {
      id: `sch-${Date.now()}`,
      childId: input.childId,
      teacherId: input.teacherId,
      startsAt: input.startsAt,
      durationMin: input.durationMin,
      status: "upcoming",
      topic: input.topic,
      zoom: input.zoom,
      seriesId: input.seriesId,
      eligible: true,
    };
    setState((prev) => ({
      ...prev,
      schedule: [...prev.schedule, created].sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      ),
    }));
    return created;
  }, []);

  const adjustPackageBalance = useCallback((childId: string, delta: number) => {
    setState((prev) => ({
      ...prev,
      packages: prev.packages.map((p) =>
        p.childId === childId
          ? {
              ...p,
              lessonsPurchased: Math.max(0, p.lessonsPurchased + delta),
            }
          : p
      ),
    }));
  }, []);

  const markPackagePaid = useCallback((childId: string) => {
    setState((prev) => ({
      ...prev,
      packages: prev.packages.map((p) =>
        p.childId === childId ? { ...p, paymentStatus: "paid" as const } : p
      ),
    }));
  }, []);

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

  const getTeacher = useCallback(
    (id = DEMO_TEACHER_ID) => state.teachers.find((t) => t.id === id),
    [state.teachers]
  );

  const getPackage = useCallback(
    (childId: string) => state.packages.find((p) => p.childId === childId),
    [state.packages]
  );

  const value = useMemo(
    () => ({
      ready,
      state,
      setRole,
      startLesson,
      setActivityIndex,
      markTarget,
      endLesson,
      updateLessonStatus,
      updateZoom,
      scheduleLesson,
      adjustPackageBalance,
      markPackagePaid,
      resetDemo,
      getChild,
      getTeacher,
      getPackage,
      clearActiveLesson,
    }),
    [
      ready,
      state,
      setRole,
      startLesson,
      setActivityIndex,
      markTarget,
      endLesson,
      updateLessonStatus,
      updateZoom,
      scheduleLesson,
      adjustPackageBalance,
      markPackagePaid,
      resetDemo,
      getChild,
      getTeacher,
      getPackage,
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
