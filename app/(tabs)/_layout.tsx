// app/(tabs)/_layout.tsx
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

const AUTH_ROUTE = "/login";
const HOME_ROUTE = "/";

export default function TabsLayout() {
  const { user } = useAuth();
  const [ready, setReady] = React.useState(false);
  const [profileReady, setProfileReady] = React.useState(false);

  const loadFlag = React.useCallback(async () => {
    const pr = await AsyncStorage.getItem("profile:ready");
    setProfileReady(pr === "1");
    setReady(true);
  }, []);

  React.useEffect(() => { loadFlag(); }, [loadFlag]);
  useFocusEffect(React.useCallback(() => { loadFlag(); }, [loadFlag]));

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "black" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <Redirect href={AUTH_ROUTE} />;
  }

  if (!profileReady) {
    return <Redirect href="/kaizoo/select" />;
  }

  return <Tabs screenOptions={{ headerShown: false }} />;
}
