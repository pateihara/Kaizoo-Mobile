import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export function useProfileReady() {
    const [ready, setReady] = useState<boolean | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const pr = await AsyncStorage.getItem("profile:ready");
                if (mounted) setReady(pr === "1");
            } catch {
                if (mounted) setReady(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    return { profileReady: ready };
}
