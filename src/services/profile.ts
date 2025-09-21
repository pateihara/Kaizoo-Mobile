// src/services/profile.ts
import type { MascotKey, User } from "@/contexts/AuthContext";
import { apiFetch } from "@/services/api";

async function postFinish(path: string, kaizoo: MascotKey) {
    const r = await apiFetch(path, {
        method: "POST",
        body: JSON.stringify({ kaizoo, mascot: kaizoo }), // compat
    });

    let data: any = null;
    try {
        data = await r.json();
    } catch {
        // pode ser 204/sem corpo
    }

    if (!r.ok) {
        const detail = typeof data?.error === "string" ? data.error : `HTTP ${r.status}`;
        const err: any = new Error(detail);
        err.status = r.status;
        err.data = data;
        throw err;
    }

    return data?.user as User | undefined;
}

/** Tenta duas rotas comuns do backend. Retorna o usuário atualizado se vier no payload. */
export async function finishOnboarding(kaizoo: MascotKey) {
    try {
        return await postFinish("/profile/finish-onboarding", kaizoo);
    } catch (e: any) {
        if (e?.status === 404) {
            return await postFinish("/profile/onboarding/finish", kaizoo);
        }
        throw e;
    }
}
