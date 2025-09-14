// crie um arquivo temporário: app/dev/reset.tsx
import Text from "@/components/atoms/Text";
import Screen from "@/components/templates/Screen";
import { colors, spacing } from "@/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, type Href } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";

export default function Reset() {
    useEffect(() => {
        (async () => {
            await AsyncStorage.multiRemove(["hasOnboarded", "authToken"]);
            router.replace("/cover" as Href); // volta pro cover → onboarding
        })();
    }, []);
    return (
        <Screen backgroundColor={colors.ui.background}>
            <View style={{ padding: spacing.lg }}>
                <Text>Resetando flags…</Text>
            </View>
        </Screen>
    );
}