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

// shape possível vindo do backend
type ProfileAPI =
    | { id: string; email?: string; name?: string; onboardingCompleted?: boolean; mascot?: string; quiz?: { goal?: string; freq?: string; likes?: string[] } }
    | { userId: string; email?: string; onboardingCompleted?: boolean; mascot?: string; quiz?: { goal?: string; freq?: string; likes?: string[] } };

function toDTO(api: any): ProfileDTO {
    const id = String(api?.id ?? api?.userId ?? "");
    const email = api?.email ?? undefined;
    const mascot = api?.mascot as MascotKey | undefined;
    const quizRaw = api?.quiz ?? {};
    const likes: string[] = Array.isArray(quizRaw?.likes) ? quizRaw.likes.map(String) : [];

    return {
        id,
        userId: String(api?.userId ?? id),
        email,
        onboardingCompleted: Boolean(api?.onboardingCompleted ?? false),
        mascot,
        quiz: {
            goal: quizRaw?.goal ? String(quizRaw.goal) : undefined,
            freq: quizRaw?.freq ? String(quizRaw.freq) : undefined,
            likes,
        },
    };
}

export async function getProfile(): Promise<ProfileDTO> {
    try {
        // preferido no seu backend
        const me = await getJSON<ProfileAPI>("/profile/me");
        return toDTO(me);
    } catch (e: any) {
        // fallback se seu backend responder /profile
        if (String(e?.message || "").includes("404")) {
            const p = await getJSON<ProfileAPI>("/profile");
            return toDTO(p);
        }
        throw e;
    }
}

export async function finishOnboarding(mascot: MascotKey): Promise<ProfileDTO> {
    // se seu backend já tiver essa rota (recomendado)
    // POST /profile/onboarding { mascot }
    const p = await postJSON<ProfileAPI>("/profile/onboarding", { mascot });
    return toDTO(p);
}

export async function saveOnboardingPreferences(input: {
    goal: string;
    freq: string;
    likes: string[];
}): Promise<ProfileDTO> {
    // POST /profile/preferences { goal, freq, likes }
    const p = await postJSON<ProfileAPI>("/profile/preferences", input);
    return toDTO(p);
}
