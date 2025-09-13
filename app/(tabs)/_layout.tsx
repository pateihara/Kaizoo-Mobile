import { logo } from "@/assets";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Image } from "react-native";

export default function TabsLayout() {
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
