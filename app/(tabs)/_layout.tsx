// app/(tabs)/_layout.tsx
import { logo } from "@/assets";
import { hasSeenOnboarding, isLoggedIn } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router"; // <-- Redirect
import * as SplashScreen from "expo-splash-screen"; // <-- splash opcional
import React, { useEffect, useState } from "react"; // <-- estado/efeito
import { Image } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => { });

export default function TabsLayout() {
  const [ready, setReady] = useState(false);
  const [logged, setLogged] = useState<boolean | null>(null);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [l, o] = await Promise.all([isLoggedIn(), hasSeenOnboarding()]);
        setLogged(l);
        setOnboarded(o);
      } finally {
        setReady(true);
        SplashScreen.hideAsync().catch(() => { });
      }
    })();
  }, []);

  // Evita flicker enquanto checa estado
  if (!ready || logged === null || onboarded === null) return null;

  // Regras:
  // 1) Nunca viu onboarding -> manda pro onboarding
  if (!onboarded) return <Redirect href="/(auth)/cover" />;
  // 2) Viu onboarding mas não está logado -> manda pro login (ajuste a rota se a sua for outra)
  if (!logged) return <Redirect href="/(auth)/login" />;

  // 3) Logado + Onboarding visto -> libera as tabs
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "black" },
        headerTintColor: "#fff",
        tabBarStyle: { backgroundColor: "black" },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#aaa",
        headerTitleAlign: "center",
        headerTitle: () => (
          <Image
            source={logo.logo}
            style={{ width: 120, height: 40 }}
            resizeMode="contain"
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="atividade"
        options={{
          title: "Atividade",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="desafios"
        options={{
          title: "Desafios",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="comunidade"
        options={{
          title: "Comunidade",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
