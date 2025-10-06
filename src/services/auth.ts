// src/services/auth.ts
import { postJSON } from "@/lib/api";

export type AuthResponse = {
    user: { id: string; email: string };
    accessToken: string;
    refreshToken: string;
};

export async function register(email: string, password: string): Promise<AuthResponse> {
    return await postJSON<AuthResponse>("/auth/register", { email, password, name: email });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
    return await postJSON<AuthResponse>("/auth/login", { email, password });
}

// opcional: se você tiver endpoint de logout no backend, pode chamar aqui.
// export async function logout(): Promise<void> { ... }
export async function logout(): Promise<void> {
    // seu backend não precisa; limpar tokens no client já basta.
    return;
}
