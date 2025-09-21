// app/(tabs)/perfil.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Switch, View } from "react-native";

import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import { useAuth } from "@/contexts/AuthContext";
import { colors, radius, spacing } from "@/theme";

export default function PerfilScreen() {
    const router = useRouter();
    const { user, signOut } = useAuth();

    const [notifEnabled, setNotifEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    const onSignOut = async () => {
        await signOut();
        router.replace("/(auth)/login");
    };

    const onResetAll = async () => {
        Alert.alert(
            "Resetar app",
            "Isso vai deslogar e reexibir o onboarding.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Resetar",
                    style: "destructive",
                    onPress: async () => {
                        await signOut();
                        // Sem flags no AsyncStorage: manda direto pro onboarding
                        router.replace("/onboarding");
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.screen}>
            {/* Cabeçalho */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text weight="bold" style={{ color: "white", fontSize: 18 }}>KA</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text variant="subtitle" weight="bold" style={{ color: "white" }}>
                        Seu perfil
                    </Text>
                    <Text style={{ color: colors.gray[300] }}>
                        {user?.email || "sem e-mail cadastrado"}
                    </Text>
                </View>
            </View>

            {/* Configurações */}
            <View style={styles.card}>
                <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.md }}>
                    Configurações
                </Text>

                <View style={styles.row}>
                    <Text>Notificações</Text>
                    <Switch value={notifEnabled} onValueChange={setNotifEnabled} />
                </View>

                <View style={styles.row}>
                    <Text>Modo escuro</Text>
                    <Switch value={darkMode} onValueChange={setDarkMode} />
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Text>Idioma</Text>
                    <Text style={{ color: colors.gray[600] }}>Português (BR)</Text>
                </View>

                <View style={styles.row}>
                    <Text>Privacidade</Text>
                    <Text style={{ color: colors.gray[600] }}>Padrão</Text>
                </View>
            </View>

            {/* Ações */}
            <View style={{ gap: spacing.sm }}>
                <Button
                    label="Editar perfil"
                    variant="secondary"
                    fullWidth
                    onPress={() => Alert.alert("Fake", "Tela de edição ainda não implementada.")}
                />
                <Button label="Sair" fullWidth onPress={onSignOut} />
                <Button label="Resetar app (dev)" variant="ghost" fullWidth onPress={onResetAll} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "black", padding: spacing.lg, gap: spacing.lg },
    header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    avatar: {
        width: 56, height: 56, borderRadius: 999,
        backgroundColor: colors.gray?.[800] ?? "#222",
        alignItems: "center", justifyContent: "center",
    },
    card: { backgroundColor: "white", borderRadius: radius.lg ?? 16, padding: spacing.lg, gap: spacing.md },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm },
    divider: { height: 1, backgroundColor: colors.gray?.[200] ?? "#EAEAEA", marginVertical: spacing.xs },
});
