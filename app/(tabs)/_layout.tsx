// app/(tabs)/_layout.tsx
import { logo } from "@/assets";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native"; // <- importante
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, Image, View } from "react-native";

export default function TabsLayout() {
  const [ready, setReady] = React.useState(false);
  const [logged, setLogged] = React.useState(false);
  const [profileReady, setProfileReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem("auth:isLoggedIn");
      const pr = await AsyncStorage.getItem("profile:ready");
      setLogged(t === "1");
      setProfileReady(pr === "1");
      setReady(true);
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      (async () => {
        const t = await AsyncStorage.getItem("auth:isLoggedIn");
        const pr = await AsyncStorage.getItem("profile:ready");
        if (mounted) {
          setLogged(t === "1");
          setProfileReady(pr === "1");
        }
      })();
      return () => { mounted = false; };
    }, [])
  );

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "black" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!logged) return <Redirect href="/onboarding" />;
  if (!profileReady) return <Redirect href="/kaizoo/select" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "black" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        tabBarStyle: { backgroundColor: "black", borderTopColor: "#222" },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#aaa",
        headerTitle: () => (
          <Image source={logo.logo} style={{ width: 120, height: 40 }} resizeMode="contain" />
        ),
        lazy: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Início", tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="atividade" options={{ title: "Atividade", tabBarIcon: ({ color, size }) => <Ionicons name="flash-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="desafios" options={{ title: "Desafios", tabBarIcon: ({ color, size }) => <Ionicons name="trophy-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="comunidade" options={{ title: "Comunidade", tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil", tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
