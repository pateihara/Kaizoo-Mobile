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

SplashScreen.preventAutoHideAsync().catch(() => { });

export default function RootLayout() {
  const [assetsReady, setAssetsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  // Desativa o keep-awake no dev (evita o erro no Android)
  useEffect(() => {
    deactivateKeepAwake().catch(() => { });
  }, []);

  // Pré-carrega imagens/bitmaps
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

  // Esconde splash quando tudo está pronto
  useEffect(() => {
    if (assetsReady && fontsLoaded) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [assetsReady, fontsLoaded]);

  if (!assetsReady || !fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" />
      return (
      <Stack screenOptions={{ headerShown: false }}>
        {/* index da raiz decide para onde mandar */}
        <Stack.Screen name="index" />
        {/* pasta do onboarding */}
        <Stack.Screen name="onboarding/index" />
        {/* grupo de tabs (já deve ter seu próprio _layout dentro de (tabs) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      )
    </>
  );
}
