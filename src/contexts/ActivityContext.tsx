// src/contexts/ActivityContext.tsx
import React, { createContext, useContext, useMemo, useState } from "react";

export type ActivityKey = "alongamento" | "caminhada" | "corrida" | "pedalada" | "yoga" | "outro";
export type Intensity = "low" | "medium" | "high";
export type Mood = 1 | 2 | 3 | 4 | 5;
export type Environment = "open" | "closed";

export type ActivityEntry = {
    id: string;
    type: ActivityKey;
    dateISO: string;
    durationMin: number;
    distanceKm?: number;
    intensity: Intensity;
    mood: Mood;
    environment: Environment;
    notes?: string;
    calories?: number; // se não vier, estimamos
};

export type ChallengeBase = {
    id: string;
    title: string;
    description: string;
    rewardXP: number;
    durationDays?: number;
    expiresInDays?: number;

    // ---- métricas definidas/sugeridas pelo desafio/evento ----
    metricType?: ActivityKey;
    metricDurationMin?: number;
    metricDistanceKm?: number;
    metricIntensity?: Intensity;
    metricCalories?: number;
};

export type ChallengeExt = ChallengeBase & {
    fromEvent?: boolean;
    eventTitle?: string;
    eventDate?: string;   // dd/mm/yyyy
    eventLocation?: string;
    completed?: boolean;

    // ✅ identidade única por conclusão
    instanceId?: string;
    completedAtISO?: string;
};

type Ctx = {
    activities: ActivityEntry[];
    addActivity: (e: Omit<ActivityEntry, "id" | "calories"> & Partial<Pick<ActivityEntry, "calories">>) => void;

    activeChallenges: ChallengeExt[];
    completedChallenges: ChallengeExt[];
    addAvailableChallengeToActive: (c: ChallengeBase) => void;
    joinEventToActive: (c: ChallengeBase & { date?: string; location?: string }) => void;
    completeChallenge: (id: string) => void;
};

// ---------- calorias ----------
const KG_DEFAULT = 70; // suposição simples
const METS: Record<ActivityKey, number> = {
    alongamento: 2.3,
    caminhada: 3.5,
    corrida: 9.0,
    pedalada: 7.0,
    yoga: 3.0,
    outro: 3.5,
};
const INTENSITY_MULT: Record<Intensity, number> = { low: 0.85, medium: 1.0, high: 1.15 };

export function estimateCaloriesFor(type: ActivityKey, durationMin: number, intensity: Intensity, kg = KG_DEFAULT) {
    const met = (METS[type] ?? 3.5) * (INTENSITY_MULT[intensity] ?? 1);
    // kcal = MET * 3.5 * peso(kg) / 200 * minutos
    return Math.round((met * 3.5 * kg) / 200 * durationMin);
}

const ActivityContext = createContext<Ctx | null>(null);
export const useActivityStore = () => {
    const v = useContext(ActivityContext);
    if (!v) throw new Error("ActivityContext not found. Wrap your app with <ActivityProvider />");
    return v;
};

export function ActivityProvider({ children }: { children: React.ReactNode }) {
    const [activities, setActivities] = useState<ActivityEntry[]>([]);
    const [activeChallenges, setActiveChallenges] = useState<ChallengeExt[]>([]);
    const [completedChallenges, setCompletedChallenges] = useState<ChallengeExt[]>([]);

    const addActivity: Ctx["addActivity"] = (e) => {
        const calories =
            typeof e.calories === "number"
                ? e.calories
                : estimateCaloriesFor(e.type, e.durationMin, e.intensity);
        const id = `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setActivities((prev) => [...prev, { ...e, id, calories }]);
    };

    const addAvailableChallengeToActive: Ctx["addAvailableChallengeToActive"] = (c) => {
        setActiveChallenges((prev) => {
            if (prev.some((p) => p.id === c.id)) return prev;
            const expiresInDays = c.durationDays ?? c.expiresInDays ?? 7;
            return [...prev, { ...c, expiresInDays }];
        });
    };

    const joinEventToActive: Ctx["joinEventToActive"] = (e) => {
        const id = `ev-${e.id}`;
        setActiveChallenges((prev) => {
            if (prev.some((p) => p.id === id)) return prev;
            return [
                ...prev,
                {
                    ...e,
                    id,
                    fromEvent: true,
                    eventTitle: e.title,
                    eventDate: (e as any).date || "A definir",
                    eventLocation:
                        (e as any).location && (e as any).location !== "—" ? (e as any).location : "Parque do Ibirapuera",
                    expiresInDays: e.expiresInDays ?? 3,
                },
            ];
        });
    };

    const completeChallenge: Ctx["completeChallenge"] = (id) => {
        setActiveChallenges((prev) => {
            const idx = prev.findIndex((p) => p.id === id);
            if (idx === -1) return prev;
            const item = prev[idx];

            setCompletedChallenges((pc) => {
                // ✅ gera uma identidade única para esta conclusão
                const instanceId = `comp-${id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                const completedAtISO = new Date().toISOString();

                // evita duplicar exatamente a mesma conclusão (raro, mas seguro)
                if (pc.some((c) => c.instanceId === instanceId)) return pc;

                return [{ ...item, completed: true, instanceId, completedAtISO }, ...pc];
            });

            const next = prev.slice();
            next.splice(idx, 1);
            return next;
        });
    };

    const value: Ctx = useMemo(
        () => ({
            activities,
            addActivity,
            activeChallenges,
            completedChallenges,
            addAvailableChallengeToActive,
            joinEventToActive,
            completeChallenge,
        }),
        [activities, activeChallenges, completedChallenges]
    );

    return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}
