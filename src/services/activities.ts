// src/services/activities.ts
import { getJSON, postJSON } from "@/lib/api";

export type ActivityType = "alongamento" | "caminhada" | "corrida" | "pedalada" | "yoga" | "outro";
export type Intensity = "low" | "medium" | "high";
export type Mood = 1 | 2 | 3 | 4 | 5;
export type Environment = "open" | "closed";

export type ActivityPayload = {
    type: ActivityType;
    dateISO: string;       // ISO string
    durationMin: number;   // inteiro >= 0
    distanceKm?: number;   // >= 0
    intensity: Intensity;
    mood: Mood;
    environment: Environment;
    notes?: string;        // max 500
    calories?: number;     // opcional (server calcula se não vier)
};

export type ActivityResponse = {
    id: string;
    userId: string;
    type: ActivityType;
    dateISO: string;
    durationMin: number;
    distanceKm?: number;
    intensity: Intensity;
    mood: Mood;
    environment: Environment;
    notes?: string;
    calories?: number;
};

/** Cria atividade (POST /activities) */
export async function createActivity(payload: ActivityPayload): Promise<ActivityResponse> {
    try {
        return await postJSON<ActivityResponse>("/activities", payload);
    } catch (err: any) {
        const data = err?.response?.data;
        const status = err?.response?.status;

        if (data?.fieldErrors || data?.formErrors) {
            throw new Error(`Campos inválidos: ${JSON.stringify(data)}`);
        }
        if (!err?.response) {
            throw new Error("Falha de rede ao criar atividade. Verifique sua conexão.");
        }
        const msg = data?.error || err?.message || `Falha ao criar atividade (${status ?? "erro"})`;
        throw new Error(msg);
    }
}

/** Lista atividades (GET /activities) */
export async function listActivities(): Promise<ActivityResponse[]> {
    try {
        return await getJSON<ActivityResponse[]>("/activities");
    } catch (err: any) {
        const data = err?.response?.data;
        const status = err?.response?.status;

        if (!err?.response) {
            throw new Error("Falha de rede ao listar atividades. Verifique sua conexão.");
        }
        const msg = data?.error || err?.message || `Falha ao listar atividades (${status ?? "erro"})`;
        throw new Error(msg);
    }
}
