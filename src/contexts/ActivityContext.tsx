// src/contexts/ActivityContext.tsx
import { ActivityKey, Intensity } from "@/services/challenges";
import React, { createContext, ReactNode, useContext, useMemo, useState } from "react";

export type ChallengeExt = {
    sourceId: string;
    id: string;
    title: string;
    description?: string;
    rewardXP: number;
    status: "active" | "completed";
    startedAt?: string;
    completedAt?: string;

    durationDays?: number;
    expiresInDays?: number;

    metricType?: ActivityKey;
    metricDurationMin?: number;
    metricDistanceKm?: number;
    metricIntensity?: Intensity;
    metricCalories?: number;

    fromEvent?: boolean;
    eventTitle?: string;
    eventDate?: string;
    eventLocation?: string;

    instanceId?: string;
};

export type ActivityItem = {
    id: string;
    type: ActivityKey;
    dateISO: string;
    durationMin: number;
    distanceKm?: number;
    intensity: Intensity;
    mood: 1 | 2 | 3 | 4 | 5;
    environment: "open" | "closed";
    notes?: string;
    calories?: number;
};

type Store = {
    activeChallenges: ChallengeExt[];
    completedChallenges: ChallengeExt[];
    activities: ActivityItem[];

    // ações
    setActiveFromServer: (list: ChallengeExt[]) => void;
    addAvailableChallengeToActive: (c: Omit<ChallengeExt, "status">) => void;
    joinEventToActive: (c: ChallengeExt) => void;
    completeFromServer: (payload: { activeRemovedId: string; completedAdded: ChallengeExt }) => void;
    pushActivity: (a: ActivityItem) => void;

    // helpers (opcional)
    getWeeklySummary: (weekStartISO: string) => {
        activeDays: number;
        activeMinutes: number;
        distanceKm: number;
        calories: number;
    };
};

const ActivityContext = createContext<Store | null>(null);

export function estimateCaloriesFor(type: ActivityKey, durationMin: number, intensity: Intensity, kg = 70) {
    const METS: Record<ActivityKey, number> = {
        alongamento: 2.3, caminhada: 3.5, corrida: 9, pedalada: 7, yoga: 3, outro: 3.5
    };
    const MULT: Record<Intensity, number> = { low: 0.85, medium: 1, high: 1.15 };
    const met = (METS[type] ?? 3.5) * (MULT[intensity] ?? 1);
    return Math.round(((met * 3.5 * kg) / 200) * durationMin);
}

export function ActivityProvider({ children }: { children: ReactNode }) {
    const [activeChallenges, setActive] = useState<ChallengeExt[]>([]);
    const [completedChallenges, setCompleted] = useState<ChallengeExt[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    const setActiveFromServer: Store["setActiveFromServer"] = (list) => {
        // garante status e sourceId; dedup por id
        const map = new Map<string, ChallengeExt>();
        list.forEach((c) => {
            const normalized: ChallengeExt = {
                ...c,
                status: "active",
                sourceId: String(c.sourceId ?? c.id),
            };
            map.set(normalized.id, normalized);
        });
        setActive(Array.from(map.values()));
    };

    const addAvailableChallengeToActive: Store["addAvailableChallengeToActive"] = (c) => {
        const normalized: ChallengeExt = {
            ...c,
            status: "active",
            sourceId: String(c.sourceId ?? c.id),
        };
        setActive((prev) => {
            if (prev.some((x) => x.id === normalized.id)) return prev;
            return [normalized, ...prev];
        });
    };

    const joinEventToActive: Store["joinEventToActive"] = (c) => {
        const normalized: ChallengeExt = {
            ...c,
            status: "active",
            fromEvent: true,
            sourceId: String(c.sourceId ?? c.id),
        };
        setActive((prev) => {
            if (prev.some((x) => x.id === normalized.id)) return prev;
            return [normalized, ...prev];
        });
    };

    const completeFromServer: Store["completeFromServer"] = ({ activeRemovedId, completedAdded }) => {
        setActive((prev) =>
            prev.filter((c) => c.id !== activeRemovedId && c.sourceId !== activeRemovedId)
        );
        setCompleted((prev) => [
            { ...completedAdded, status: "completed", sourceId: String(completedAdded.sourceId ?? completedAdded.id) },
            ...prev,
        ]);
    };

    const pushActivity: Store["pushActivity"] = (a) => {
        setActivities((prev) => [a, ...prev]);
    };

    const getWeeklySummary: Store["getWeeklySummary"] = (weekStartISO) => {
        const start = new Date(weekStartISO).getTime();
        const end = start + 7 * 24 * 60 * 60 * 1000;
        const inWeek = activities.filter((a) => {
            const t = new Date(a.dateISO).getTime();
            return t >= start && t < end;
        });

        const activeDays = new Set(inWeek.map((a) => new Date(a.dateISO).toISOString().slice(0, 10))).size;
        const activeMinutes = inWeek.reduce((s, a) => s + (a.durationMin || 0), 0);
        const distanceKm = inWeek.reduce((s, a) => s + (a.distanceKm || 0), 0);
        const calories = inWeek.reduce((s, a) => s + (a.calories || 0), 0);

        return { activeDays, activeMinutes, distanceKm, calories };
    };

    const value = useMemo<Store>(() => ({
        activeChallenges,
        completedChallenges,
        activities,
        setActiveFromServer,
        addAvailableChallengeToActive,
        joinEventToActive,
        completeFromServer,
        pushActivity,
        getWeeklySummary,
    }), [activeChallenges, completedChallenges, activities]);

    return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

/**
 * Hook “store completo”
 * Uso: const { activeChallenges, addAvailableChallengeToActive } = useActivityStore();
 */
export function useActivityStore(): Store {
    const ctx = useContext(ActivityContext);
    if (!ctx) throw new Error("useActivityStore must be used within ActivityProvider");
    return ctx;
}

/**
 * Hook “selector” (igual conceito do Zustand, mas via Context)
 * Uso: const add = useActivitySelector(s => s.addAvailableChallengeToActive);
 */
export function useActivitySelector<T>(selector: (s: Store) => T): T {
    const store = useActivityStore();
    return selector(store);
}
