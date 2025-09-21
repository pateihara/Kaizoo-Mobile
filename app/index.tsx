// app/index.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";

export default function Index() {
    const { user } = useAuth();
    if (user) return <Redirect href="/(tabs)" />;
    return <Redirect href="/onboarding" />; // 👈 manda pro onboarding
}
