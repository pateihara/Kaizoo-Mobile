// src/services/challenges.ts
import { api } from "@/lib/api";
import type { AxiosError } from "axios";

export type Intensity = "low" | "medium" | "high";
export type ActivityKey = "alongamento" | "caminhada" | "corrida" | "pedalada" | "yoga" | "outro";

export type CommunityEvent = {
    id: string; title: string; description?: string; rewardXP: number;
    date?: string; location?: string;
    metricType?: ActivityKey; metricDurationMin?: number; metricDistanceKm?: number;
    metricIntensity?: Intensity; metricCalories?: number;
};

export type Challenge = {
    id: string; title: string; description?: string; rewardXP: number;
    durationDays?: number; expiresInDays?: number; status?: "active" | "completed";
    metricType?: ActivityKey; metricDurationMin?: number; metricDistanceKm?: number;
    metricIntensity?: Intensity; metricCalories?: number;
    fromEvent?: boolean; eventTitle?: string; eventDate?: string; eventLocation?: string;
    instanceId?: string; sourceId?: string; startedAt?: string; completedAt?: string;
};

export type Activity = {
    id: string;
    userId?: string;
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

export async function listChallenges(status: "active" | "completed" = "active"): Promise<Challenge[]> {
    const { data } = await api.get<Challenge[]>("/challenges", { params: { status } });
    return Array.isArray(data) ? data : [];
}

export async function listCommunityEvents(): Promise<CommunityEvent[]> {
    const { data } = await api.get<CommunityEvent[]>("/challenges/events");
    return Array.isArray(data) ? data : [];
}

type JoinEventBody = {
    id: string; title: string; rewardXP: number; expiresInDays?: number;
    metricType?: ActivityKey; metricDurationMin?: number; metricDistanceKm?: number;
    metricIntensity?: Intensity; metricCalories?: number; date?: string; location?: string;
};

/** Lança erro com .status em 4xx/5xx */
export async function joinChallengeEvent(
    event: { id: string; title: string; date?: string; location?: string }
): Promise<Challenge> {
    const body: JoinEventBody = {
        id: event.id,
        title: event.title,
        rewardXP: 15,
        expiresInDays: 3,
        metricType: "corrida",
        metricDurationMin: 30,
        metricIntensity: "medium",
        date: event.date,
        location: event.location,
    };

    try {
        const { data } = await api.post<Challenge>("/challenges/events/join", body);
        return data;
    } catch (e: any) {
        const ax = e as AxiosError<any>;
        const status = ax.response?.status;
        const serverMsg = (ax.response?.data as any)?.error || (ax.response?.data as any)?.message;
        const err = new Error(serverMsg || ax.message) as Error & { status?: number };
        err.status = status;
        throw err;
    }
}

/** Concluir desafio/evento no servidor */
export async function completeChallengeServer(id: string): Promise<{
    activeRemovedId: string;
    completedAdded: Challenge;
    createdActivity?: Activity;
}> {
    const { data } = await api.post<{
        activeRemovedId: string;
        completedAdded: Challenge;
        createdActivity?: Activity;
    }>(`/challenges/${encodeURIComponent(id)}/complete`, {});
    return data;
}

export async function activateAvailableChallenge(src: {
    id: string; title: string; description?: string; rewardXP: number;
    durationDays?: number; expiresInDays?: number;
    metricType?: ActivityKey; metricDurationMin?: number; metricDistanceKm?: number;
    metricIntensity?: Intensity; metricCalories?: number;
}): Promise<Challenge> {
    // o back valida com zod (baseSchema), então mandamos só os campos suportados
    const { data } = await api.post<Challenge>("/challenges/available/activate", {
        id: src.id,
        title: src.title,
        description: src.description,
        rewardXP: src.rewardXP,
        durationDays: src.durationDays,
        expiresInDays: src.expiresInDays,
        metricType: src.metricType,
        metricDurationMin: src.metricDurationMin,
        metricDistanceKm: src.metricDistanceKm,
        metricIntensity: src.metricIntensity,
        metricCalories: src.metricCalories,
    });
    return data;
}

export async function listAvailableChallenges(): Promise<Challenge[]> {
    const { data } = await api.get<Challenge[]>("/challenges/available");
    return Array.isArray(data) ? data : [];
}