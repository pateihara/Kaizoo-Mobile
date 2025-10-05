// src/services/profile.ts
import { getJSON, postJSON } from "@/lib/api";

export type MascotKey = "tato" | "dino" | "koa" | "kaia" | "penny";

export type ProfileDTO = {
    email: string | undefined;
    id: string;
    userId: string;
    onboardingCompleted: boolean;
    mascot?: MascotKey;
    quiz?: { goal?: string; freq?: string; likes: string[] };
};

export async function getProfile(): Promise<ProfileDTO> {
    return await getJSON<ProfileDTO>("/profile");
}

export async function finishOnboarding(mascot: MascotKey): Promise<ProfileDTO> {
    return await postJSON<ProfileDTO>("/profile/onboarding", { mascot });
}

export async function saveOnboardingPreferences(input: {
    goal: string;
    freq: string;
    likes: string[];
}): Promise<ProfileDTO> {
    return await postJSON<ProfileDTO>("/profile/preferences", input);
}
