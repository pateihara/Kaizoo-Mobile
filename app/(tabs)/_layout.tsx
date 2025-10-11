// app/(tabs)/_layout.tsx
import { colors } from "@/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React from "react";

// Mapeia cada rota para um ícone (Ionicons)
const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home",            // app/(tabs)/index.tsx  -> Início/Home
  atividade: "bicycle",     // app/(tabs)/atividade.tsx
  desafios: "trophy",       // app/(tabs)/desafios.tsx
  comunidade: "people",     // app/(tabs)/comunidade.tsx
  mascotes: "paw",          // app/(tabs)/mascotes.tsx
  perfil: "person",         // app/(tabs)/perfil.tsx
};

// Componente helper para o ícone da Tab
function TabIcon({ route, focused, color, size }: {
  route: string; focused: boolean; color: string; size: number;
}) {
  const name = ICONS[route] ?? "ellipse"; // fallback caso falte mapeamento
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors?.mascots?.paleTurquoise ?? "#22c55e",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: { backgroundColor: "#0b0b0b", borderTopColor: "#1f2937" },
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon route={route.name} focused={focused} color={color} size={22} />
        ),
        tabBarLabelStyle: { fontSize: 11, marginBottom: 2 },
      })}
    >
      {/* Garanta que os names batem com seus arquivos em app/(tabs)/ */}
      <Tabs.Screen name="index" options={{ title: "Início" }} />
      <Tabs.Screen name="atividade" options={{ title: "Atividade" }} />
      <Tabs.Screen name="desafios" options={{ title: "Desafios" }} />
      <Tabs.Screen name="comunidade" options={{ title: "Comunidade" }} />
      <Tabs.Screen name="mascotes" options={{ title: "Mascotes" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
