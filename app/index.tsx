// app/index.tsx
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Redirect } from "expo-router";

console.log("API baseURL >>>", api.defaults.baseURL);

export default function Index() {
    const { user } = useAuth();
    if (user) return <Redirect href="/(tabs)" />;
    return <Redirect href="/onboarding" />; // 👈 manda pro onboarding
}
