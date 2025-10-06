// app/index.tsx
import { useAuth } from "@/contexts/AuthContext";
import { http } from "@/lib/api";
import { Redirect } from "expo-router";
import React from "react";

console.log("API baseURL >>>", http.defaults.baseURL);

export default function Index() {
    const { user } = useAuth();
    if (user) return <Redirect href="/(tabs)" />;
    return <Redirect href="/onboarding" />; // 👈 manda pro onboarding
}
