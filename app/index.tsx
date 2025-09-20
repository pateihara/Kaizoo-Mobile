import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
    const [loading, setLoading] = useState(true);
    const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

    useEffect(() => {
        (async () => {
            const flag = await AsyncStorage.getItem("hasOnboarded");
            setHasOnboarded(flag === "1");
            setLoading(false);
            console.log("[onboarding] flag =", flag); // DEBUG
        })();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!hasOnboarded) return <Redirect href="/onboarding" />;
    return <Redirect href="/(tabs)" />; // ajuste se sua home for outra
}
