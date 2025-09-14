// app/_layout.tsx
import { badges, BG, bitmapIcons, iconFriend, logo, mascots, onboarding, transp } from "@/assets";
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
          ...Object.values(onboarding),

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
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "black" },
          headerTintColor: "#fff",
          contentStyle: { backgroundColor: "black" },
        }}
      >
        {/* Oculta o header do Stack para o grupo (tabs) —
            o header passará a ser o das próprias Tabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Exemplo de outras rotas fora das tabs:
        <Stack.Screen name="modal" options={{ presentation: "modal" }} /> */}
      </Stack>
    </>
  );
}
