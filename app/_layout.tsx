// app/_layout.tsx
import { badges, BG, bitmapIcons, iconFriend, logo, mascots, transp } from "@/assets";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Asset } from "expo-asset";
import { deactivateKeepAwake } from "expo-keep-awake";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import { ActivityProvider } from "@/contexts/ActivityContext";
import { AuthProvider } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync().catch(() => { });

export default function RootLayout() {
  const [assetsReady, setAssetsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  useEffect(() => {
    deactivateKeepAwake().catch(() => { });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const toLoad = [
          ...Object.values(mascots),
          ...Object.values(badges),
          ...Object.values(bitmapIcons),
          ...Object.values(BG),
          ...Object.values(transp),
          ...Object.values(logo),
          ...Object.values(iconFriend),
        ] as number[];
        await Asset.loadAsync(toLoad);
      } catch {
        // noop
      } finally {
        setAssetsReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (assetsReady && fontsLoaded) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [assetsReady, fontsLoaded]);

  if (!assetsReady || !fontsLoaded) return null;

  return (
    <AuthProvider>
      <ActivityProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding/index" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </ActivityProvider>
    </AuthProvider>
  );
}
