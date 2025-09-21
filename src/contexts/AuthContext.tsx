// src/contexts/AuthContext.tsx
import { apiFetch, tokenStore } from "@/services/api";
import React, { createContext, useContext, useEffect, useState } from "react";

export type MascotKey = "tato" | "dino" | "koa" | "kaia" | "penny";

export type User = {
    id: string;
    name?: string;
    email: string;
    profileReady?: boolean;
    kaizoo?: MascotKey | null;
    mascot?: MascotKey | null;
};

type AuthContextType = {
    user: User | null;
    booting: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    replaceUser: (u: User | null) => void; // ← para setar user direto (ex.: finishOnboarding retorna user)
    // aliases p/ telas antigas
    signIn?: (email: string, password: string) => Promise<void>;
    signUp?: (email: string, password: string) => Promise<void>;
    logout?: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as any);

// Aceita vários formatos de payload p/ tokens
function extractTokens(data: any) {
    const at =
        data?.accessToken ??
        data?.access ??
        data?.token ??
        data?.jwt?.access ??
        data?.tokens?.accessToken ??
        data?.session?.accessToken;

    const rt =
        data?.refreshToken ??
        data?.refresh ??
        data?.jwt?.refresh ??
        data?.tokens?.refreshToken ??
        data?.session?.refreshToken;

    return { at, rt };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [booting, setBooting] = useState(true);

    // Recupera sessão ao abrir o app
    useEffect(() => {
        (async () => {
            try {
                const r = await apiFetch("/me");
                const data = await r.json().catch(() => ({}));
                if (r.ok && data?.user) setUser(data.user as User);
                else setUser(null);
            } catch {
                setUser(null);
            } finally {
                setBooting(false);
            }
        })();
    }, []);

    async function refreshProfile() {
        const r = await apiFetch("/me");
        let data: any = null;
        try {
            data = await r.json();
        } catch {
            // ok se não vier corpo
        }
        if (!r.ok) {
            console.warn("GET /me falhou:", r.status, data?.error ?? data);
            return; // não lança erro
        }
        setUser(data?.user as User);
    }

    async function doLogin(email: string, password: string) {
        const r = await apiFetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.error ?? "Falha no login");

        const { at, rt } = extractTokens(data);
        if (at && rt) await tokenStore.setTokens(at, rt);

        if (data?.user) setUser(data.user as User);
        else await refreshProfile();
    }

    async function login(email: string, password: string) {
        await doLogin(email, password);
    }

    async function register(email: string, password: string) {
        const r = await apiFetch("/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.error ?? "Falha ao criar conta");

        const { at, rt } = extractTokens(data);
        if (at && rt) {
            await tokenStore.setTokens(at, rt);
            if (data?.user) setUser(data.user as User);
            else await refreshProfile();
        } else {
            // se o register não mandar tokens, faz login automático
            await doLogin(email, password);
        }
    }

    async function signOut() {
        try {
            await apiFetch("/auth/logout", { method: "POST" });
        } catch {
            // ignore
        } finally {
            await tokenStore.clearTokens();
            setUser(null);
        }
    }

    function replaceUser(u: User | null) {
        setUser(u);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                booting,
                login,
                register,
                signOut,
                refreshProfile,
                replaceUser,
                // aliases
                signIn: login,
                signUp: register,
                logout: signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
