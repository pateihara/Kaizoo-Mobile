// src/lib/api.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { Platform } from "react-native";

/**
 * Base URL:
 * - Defina EXPO_PUBLIC_API_URL para celular físico (ex.: http://192.168.15.15:4000)
 * - Emulador Android: http://10.0.2.2:4000
 * - iOS Simulator:    http://127.0.0.1:4000
 */
const guessBaseURL =
    Platform.OS === "ios"
        ? "http://127.0.0.1:4000"
        : "http://10.0.2.2:4000";

const baseURL =
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.VITE_API_URL ??
    guessBaseURL;

export const api = axios.create({
    baseURL,
    timeout: 15000,
});

// --------- LOG de requests/respostas (diagnóstico) ----------
api.interceptors.request.use((cfg) => {
    const fullUrl = (cfg.baseURL ?? "") + (cfg.url ?? "");
    console.log("[HTTP] ->", cfg.method?.toUpperCase(), fullUrl);
    return cfg;
});

api.interceptors.response.use(
    (res) => {
        const fullUrl = (res.config.baseURL ?? "") + (res.config.url ?? "");
        console.log("[HTTP] <-", res.status, fullUrl);
        return res;
    },
    (err: AxiosError) => {
        const fullUrl = (err.config?.baseURL ?? "") + (err.config?.url ?? "");
        console.log("[HTTP] xx", fullUrl, err.message);
        return Promise.reject(err);
    }
);

// ---- Token store (conecte com seu AuthContext) ----
let getAccessToken: (() => Promise<string | null>) | null = null;
let getRefreshToken: (() => Promise<string | null>) | null = null;
let setAccessToken: ((t: string) => Promise<void>) | null = null;
let setRefreshToken: ((t: string) => Promise<void>) | null = null;
let clearTokens: (() => Promise<void>) | null = null;

export function wireTokenHandlers(handlers: {
    getAccessToken: () => Promise<string | null>;
    getRefreshToken: () => Promise<string | null>;
    setAccessToken: (t: string) => Promise<void>;
    setRefreshToken: (t: string) => Promise<void>;
    clearTokens: () => Promise<void>;
}) {
    getAccessToken = handlers.getAccessToken;
    getRefreshToken = handlers.getRefreshToken;
    setAccessToken = handlers.setAccessToken;
    setRefreshToken = handlers.setRefreshToken;
    clearTokens = handlers.clearTokens;
}

// ---- Authorization header on each request ----
api.interceptors.request.use(async (config) => {
    if (getAccessToken) {
        const token = await getAccessToken();
        if (token) {
            config.headers = config.headers ?? {};
            (config.headers as any).Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// ---- Auto refresh on 401 ----
type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

let refreshing: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
    if (!getRefreshToken || !setAccessToken) return null;
    const rt = await getRefreshToken();
    if (!rt) return null;

    try {
        const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: rt });
        const newAT = res.data?.accessToken as string | undefined;
        const newRT = res.data?.refreshToken as string | undefined;

        if (!newAT) return null;

        await setAccessToken(newAT);
        if (newRT && setRefreshToken) await setRefreshToken(newRT);
        return newAT;
    } catch {
        return null;
    }
}

api.interceptors.response.use(
    (r) => r,
    async (err: AxiosError) => {
        const original = err.config as RetriableConfig | undefined;
        const status = err.response?.status;

        if (status === 401 && original && !original._retry) {
            original._retry = true;

            refreshing = refreshing ?? refreshAccess();
            const newAT = await refreshing;
            refreshing = null;

            if (newAT) {
                original.headers = original.headers ?? {};
                (original.headers as any).Authorization = `Bearer ${newAT}`;
                return api(original);
            } else {
                if (clearTokens) await clearTokens();
            }
        }

        return Promise.reject(err);
    }
);

// --------- Helpers ----------
export async function getJSON<T>(path: string): Promise<T> {
    const res = await api.get<T>(path);
    return res.data;
}

export async function postJSON<T>(path: string, body: any): Promise<T> {
    const res = await api.post<T>(path, body);
    return res.data;
}

// console.log("API baseURL >>>", api.defaults.baseURL);
