import { wireTokenHandlers } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as Auth from "../services/auth";
import { getProfile } from "../services/profile";

type User = { id: string; email: string } | null;

type AuthCtx = {
    user: User;
    loading: boolean;
    register: (email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshMe: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>(null as any);

const ACCESS_KEY = "@kaizoo/access_token";
const REFRESH_KEY = "@kaizoo/refresh_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);

    // conecta api.ts com o storage
    wireTokenHandlers({
        getAccessToken: async () => AsyncStorage.getItem(ACCESS_KEY),
        getRefreshToken: async () => AsyncStorage.getItem(REFRESH_KEY),
        setAccessToken: async (t) => AsyncStorage.setItem(ACCESS_KEY, t),
        setRefreshToken: async (t) => AsyncStorage.setItem(REFRESH_KEY, t),
        clearTokens: async () => {
            await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
            setUser(null);
        },
    });

    useEffect(() => {
        (async () => {
            try {
                const at = await AsyncStorage.getItem(ACCESS_KEY);
                const rt = await AsyncStorage.getItem(REFRESH_KEY);
                if (at && rt) {
                    const me = await getProfile().catch(() => null as any);
                    if (me?.id && me?.email) {
                        setUser({ id: String(me.id), email: String(me.email) });
                    }
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const logout = async () => {
        try {
            await Auth.logout();
        } catch { }
        await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
        setUser(null);
    };

    const signOut = logout; // alias

    const value = useMemo<AuthCtx>(
        () => ({
            user,
            loading,
            register: async (email, password) => {
                const res = await Auth.register(email, password);
                await AsyncStorage.setItem(ACCESS_KEY, String(res.accessToken ?? ""));
                await AsyncStorage.setItem(REFRESH_KEY, String(res.refreshToken ?? ""));
                setUser({
                    id: String(res.user?.id ?? ""),
                    email: String(res.user?.email ?? ""),
                });
            },
            login: async (email, password) => {
                const res = await Auth.login(email, password);
                await AsyncStorage.setItem(ACCESS_KEY, String(res.accessToken ?? ""));
                await AsyncStorage.setItem(REFRESH_KEY, String(res.refreshToken ?? ""));
                setUser({
                    id: String(res.user?.id ?? ""),
                    email: String(res.user?.email ?? ""),
                });
            },
            logout,
            signOut,
            refreshMe: async () => {
                const me = await getProfile();
                setUser({
                    id: String(me?.id ?? ""),
                    email: String(me?.email ?? ""),
                });
            },
        }),
        [user, loading]
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
