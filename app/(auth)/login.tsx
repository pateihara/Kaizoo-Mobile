// app/(auth)/login.tsx
import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import { signIn } from "@/services/auth";
import { colors, spacing } from "@/theme";
import { useNavigation, useRouter } from "expo-router"; // ← importei useNavigation
import React, { useRef, useState } from "react";
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export default function LoginScreen() {
    const router = useRouter();
    const navigation = useNavigation(); // ← peguei o navigation p/ back seguro

    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [loading, setLoading] = useState(false);
    const passRef = useRef<TextInput>(null);

    // back seguro: se não tiver quem "voltar", manda pro onboarding (rota pública)
    const safeBack = () => {
        // @ts-ignore - alguns tipos não expõem canGoBack
        if (navigation?.canGoBack?.()) navigation.goBack();
        else router.replace("/onboarding");
    };

    const onLogin = async () => {
        setLoading(true);
        try {
            await signIn(email.trim(), pass);
            // Deixe o app/index.tsx decidir o destino (tabs / kaizoo / onboarding)
            router.replace("/");
        } catch (e: any) {
            Alert.alert("Erro ao entrar", e.message ?? String(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text variant="title" weight="bold" style={styles.title}>
                        Bem vindo de volta!
                    </Text>

                    <TextInput
                        placeholder="e-mail"
                        placeholderTextColor="#6B6B6B"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        autoComplete="email"
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => passRef.current?.focus()}
                        style={styles.input}
                    />

                    <TextInput
                        ref={passRef}
                        placeholder="senha"
                        placeholderTextColor="#6B6B6B"
                        value={pass}
                        onChangeText={setPass}
                        secureTextEntry
                        textContentType="password"
                        autoComplete="password"
                        returnKeyType="done"
                        onSubmitEditing={onLogin}
                        style={styles.input}
                    />

                    <View style={{ height: 24 }} />

                    <Button label="Entrar" onPress={onLogin} fullWidth loading={loading} />
                    <View style={{ height: spacing.sm }} />
                    <Button
                        variant="ghost"
                        onPress={() => router.push("/(auth)/register")} // ← caminho correto no grupo (auth)
                        fullWidth
                        label="Criar Conta"
                    />
                    <View style={{ height: spacing.xs }} />
                    <Button
                        variant="secondary"
                        onPress={safeBack} // ← usa back seguro
                        fullWidth
                        label="voltar"
                    />
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "black" },
    content: {
        flexGrow: 1,
        padding: spacing.lg,
        paddingTop: spacing.xl,
        gap: spacing.md,
        justifyContent: "flex-end",
    },
    title: { color: "white", textAlign: "center", marginBottom: spacing.md },
    input: {
        height: 56,
        borderRadius: 28,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.gray?.[200] ?? "#EDEDED",
        color: "#111",
    },
});
