// src/services/api.ts
import * as SecureStore from "expo-secure-store";
import { API_BASE } from "src/config/env";

const API = API_BASE;
let isRefreshing = false;
let refreshWaiters: Array<(ok: boolean) => void> = [];



async function doRefresh(): Promise<boolean> {
    if (isRefreshing) return new Promise((r) => refreshWaiters.push(r));
    isRefreshing = true;
    try {
        const refresh = await SecureStore.getItemAsync("refresh");
        if (!refresh) return false;
        const r = await fetch(`${API}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: refresh }),
        });
        const data = await r.json();
        if (!r.ok) return false;
        await SecureStore.setItemAsync("access", data.accessToken);
        await SecureStore.setItemAsync("refresh", data.refreshToken);
        return true;
    } catch { return false; }
    finally {
        isRefreshing = false;
        refreshWaiters.forEach((fn) => fn(true)); refreshWaiters = [];
    }
}

export async function apiFetch(path: string, init: RequestInit = {}, retry = true) {
    const access = await SecureStore.getItemAsync("access");
    const headers = new Headers(init.headers || {});
    if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }
    if (access) headers.set("Authorization", `Bearer ${access}`);

    const res = await fetch(`${API}${path}`, { ...init, headers });
    if (res.status !== 401 || !retry) return res;

    const ok = await doRefresh();
    if (!ok) {
        await SecureStore.deleteItemAsync("access");
        await SecureStore.deleteItemAsync("refresh");
        return res;
    }
    const access2 = await SecureStore.getItemAsync("access");
    const headers2 = new Headers(init.headers || {});
    if (!headers2.has("Content-Type") && !(init.body instanceof FormData)) {
        headers2.set("Content-Type", "application/json");
    }
    if (access2) headers2.set("Authorization", `Bearer ${access2}`);
    return fetch(`${API}${path}`, { ...init, headers: headers2 });
}

export const tokenStore = {
    getAccess: () => SecureStore.getItemAsync("access"),
    getRefresh: () => SecureStore.getItemAsync("refresh"),
    setTokens: (a: string, r: string) => Promise.all([
        SecureStore.setItemAsync("access", a),
        SecureStore.setItemAsync("refresh", r),
    ]),
    clearTokens: () => Promise.all([
        SecureStore.deleteItemAsync("access"),
        SecureStore.deleteItemAsync("refresh"),
    ]),
    API,
};
