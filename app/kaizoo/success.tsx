import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import { colors, radius, spacing } from "@/theme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function KaizooSuccess() {
    const router = useRouter();

    const start = () => {
        // já salvamos "profile:ready" no form; aqui só mandamos para a home
        router.replace("/(tabs)");
    };

    return (
        <View style={{ flex: 1, backgroundColor: "black" }}>
            <View style={{ padding: spacing.lg, paddingTop: spacing.xl }}>
                <View style={styles.stepPill}>
                    <Text weight="bold">3. Pronto pra se exercitar</Text>
                </View>
            </View>

            <View style={{ padding: spacing.lg }}>
                <View style={styles.card}>
                    {/* Espaço para arte grande */}
                    {/* <Image source={require("@/assets/kaizoo/success.png")} style={{ width: "100%", height: 220 }} resizeMode="contain" /> */}
                    <View style={[styles.illusPlaceholder, { height: 220 }]}>
                        <Text style={{ color: colors.gray[500] }}>(coloque a ilustração aqui)</Text>
                    </View>

                    <Text variant="title" weight="bold" style={{ textAlign: "center", marginTop: spacing.lg }}>
                        tudo pronto!
                    </Text>
                    <Text style={{ textAlign: "center", fontSize: 18, marginTop: spacing.xs }}>
                        Seu perfil foi configurado com sucesso!
                    </Text>
                </View>
            </View>

            <View style={{ padding: spacing.lg }}>
                <Button label="começar minha jornada!" onPress={start} fullWidth />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    stepPill: {
        alignSelf: "center",
        backgroundColor: "white",
        paddingVertical: 10, paddingHorizontal: 20,
        borderRadius: 999,
    },
    card: {
        backgroundColor: "white",
        borderRadius: radius.lg ?? 16,
        padding: spacing.lg,
    },
    illusPlaceholder: {
        backgroundColor: colors.gray?.[200] ?? "#eee",
        borderRadius: radius.md ?? 12,
        alignItems: "center", justifyContent: "center",
    },
});
