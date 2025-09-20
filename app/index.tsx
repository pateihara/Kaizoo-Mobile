import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
    const [loading, setLoading] = React.useState(true);
    const [logged, setLogged] = React.useState(false);
    const [profileReady, setProfileReady] = React.useState(false);
    const [mascot, setMascot] = React.useState<string | null>(null);

    React.useEffect(() => {
        (async () => {
            const tk = await AsyncStorage.getItem("auth:isLoggedIn");
            const pr = await AsyncStorage.getItem("profile:ready");
            const ms = await AsyncStorage.getItem("profile:mascot");
            setLogged(tk === "1");
            setProfileReady(pr === "1");
            setMascot(ms);
            setLoading(false);
        })();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!logged) return <Redirect href="/onboarding" />;
    if (profileReady) return <Redirect href="/(tabs)" />;
    if (mascot) return <Redirect href={`/kaizoo/form?mascot=${encodeURIComponent(mascot)}`} />;
    return <Redirect href="/kaizoo/select" />;
}
