import { mascots } from "@/assets";
import Text from "@/components/atoms/Text";
import Screen from "@/components/templates/Screen";
import { spacing } from "@/theme";
import { router, type Href } from "expo-router";
import React, { useEffect } from "react";
import { Image, View } from "react-native";

export default function Cover() {
    useEffect(() => {
        const t = setTimeout(() => {
            router.replace("/onboarding" as Href);
        }, 2000); // 2 segundos

        return () => clearTimeout(t);
    }, []);

    return (
        <Screen backgroundColor="#000">
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    gap: spacing.xl,
                    paddingHorizontal: spacing.lg,
                }}
            >
                <Image
                    source={mascots.group} // usa o seu assets/index.ts
                    style={{ width: 260, height: 160, resizeMode: "contain" }}
                />

                <View style={{ gap: 6 }}>
                    <Text align="center" style={{ fontSize: 34, color: "#eee" }}>
                        Mexa-se
                        <Text style={{ color: "#F3A53B", fontSize: 34 }}>.</Text>
                    </Text>
                    <Text align="center" style={{ fontSize: 34, color: "#eee" }}>
                        Evolua
                        <Text style={{ color: "#F3A53B", fontSize: 34 }}>.</Text>
                    </Text>
                    <Text align="center" style={{ fontSize: 34, color: "#eee" }}>
                        Divirta-se
                        <Text style={{ color: "#F3A53B", fontSize: 34 }}>!</Text>
                    </Text>
                </View>
            </View>
        </Screen>
    );
}
