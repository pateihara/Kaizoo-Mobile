// src/services/auth.ts
import { apiFetch, tokenStore } from "./api";

export async function register(email: string, password: string, name?: string) {
    const r = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
    }, false);
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error ?? "Falha no cadastro");
    return data.user;
}

export async function login(email: string, password: string) {
    const r = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    }, false);
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error ?? "Falha no login");
    await tokenStore.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    return data.user as { id: string; email: string; name?: string; profileReady?: boolean; kaizoo?: string | null };
}

export async function me() {
    const r = await apiFetch("/auth/me");
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error ?? "Falha ao obter perfil");
    return data.user;
}

export async function logout() {
    const refresh = await tokenStore.getRefresh();
    if (refresh) {
        await apiFetch("/auth/logout", {
            method: "POST",
            body: JSON.stringify({ refreshToken: refresh }),
        }, false);
    }
    await tokenStore.clearTokens();
}
