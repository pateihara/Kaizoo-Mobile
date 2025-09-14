// app/(auth)/login.tsx
import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import Screen from "@/components/templates/Screen";
import { colors, radii, spacing } from "@/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { TextInput, View } from "react-native";

export default function Login() {
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");

    async function handleLogin() {
        // salva um token fake só pra liberar o gate
        await AsyncStorage.setItem("authToken", "demo");
        router.replace("/"); // manda para a raiz (tabs)
    }

    return (
        <Screen backgroundColor={colors.ui.background}>
            <View style={{ flex: 1, padding: spacing.lg, gap: spacing.lg, justifyContent: "center" }}>
                <View style={{ gap: spacing.sm }}>
                    <Text variant="title" align="center">Entrar</Text>
                    <Text align="center" color={colors.gray[500]}>
                        Use qualquer e-mail e senha para continuar
                    </Text>
                </View>

                <View style={{ gap: spacing.md }}>
                    <Text>Seu e-mail</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="voce@exemplo.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={{
                            backgroundColor: colors.ui.surface,
                            borderColor: colors.ui.border,
                            borderWidth: 1,
                            borderRadius: radii.md,
                            paddingHorizontal: spacing.md,
                            height: 44,
                        }}
                    />

                    <Text style={{ marginTop: spacing.sm }}>Senha</Text>
                    <TextInput
                        value={pwd}
                        onChangeText={setPwd}
                        placeholder="••••••••"
                        secureTextEntry
                        style={{
                            backgroundColor: colors.ui.surface,
                            borderColor: colors.ui.border,
                            borderWidth: 1,
                            borderRadius: radii.md,
                            paddingHorizontal: spacing.md,
                            height: 44,
                        }}
                    />
                </View>

                <Button label="Entrar" onPress={handleLogin} fullWidth />

                <Text align="center" color={colors.gray[500]}>
                    Ao continuar você concorda com os Termos.
                </Text>
            </View>
        </Screen>
    );
}
