// src/services/auth.ts
import { api } from "../lib/api";

type AuthResponse = {
    user: { id: string; email: string };
    accessToken: string;
    refreshToken: string;
};

export async function register(email: string, password: string) {
    const res = await api.post<AuthResponse>("/auth/register", { email, password });
    return res.data;
}

export async function login(email: string, password: string) {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    return res.data;
}

export async function logout() {
    await api.post("/auth/logout");
}
