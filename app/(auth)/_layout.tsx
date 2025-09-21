// app/(auth)/_layout.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Redirect, Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
    const { user } = useAuth();

    if (user) {
        return <Redirect href="/(tabs)" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
