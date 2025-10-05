// app/(tabs)/_layout.tsx
import { useAuth } from "@/contexts/AuthContext";
import { getProfile } from "@/services/profile";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function TabsLayout() {
  const router = useRouter();
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        setReady(true);
        return;
      }
      try {
        const p = await getProfile();
        if (mounted) setOnboardingDone(!!p.onboardingCompleted);
      } catch {
        if (mounted) setOnboardingDone(false);
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  // Evita o warning "Layout children": redireciona por efeito (fora do JSX)
  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/(auth)/login");
    else if (!onboardingDone) router.replace("/kaizoo/select");
  }, [ready, user, onboardingDone, router]);

  if (!ready || !user || !onboardingDone) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "black" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {/* Registre APENAS as telas que existem em app/(tabs)/ */}
      <Tabs.Screen name="atividade" options={{ title: "Atividade" }} />
      <Tabs.Screen name="metricas" options={{ title: "Métricas" }} />
      {/* Se você tem esses arquivos, descomente; senão, deixe comentado para não gerar aviso */}
      {/* <Tabs.Screen name="desafios" options={{ title: "Desafios" }} /> */}
      {/* <Tabs.Screen name="comunidade" options={{ title: "Comunidade" }} /> */}
      {/* <Tabs.Screen name="perfil" options={{ title: "Perfil" }} /> */}
    </Tabs>
  );
}
