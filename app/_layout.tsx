import { badges, bitmapIcons, mascots } from "@/assets";
import { Asset } from "expo-asset";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {

        const toLoad = [
          ...Object.values(mascots),
          ...Object.values(badges),
          ...Object.values(bitmapIcons),
        ] as number[];

        await Asset.loadAsync(toLoad);
      } finally {
        setReady(true);
        await SplashScreen.hideAsync();
      }
    })();
  }, []);

  if (!ready) return null;
  return <Slot />;
}
