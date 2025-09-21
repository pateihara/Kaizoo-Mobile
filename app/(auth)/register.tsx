// app/(auth)/register.tsx
import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import { useAuth } from "@/contexts/AuthContext";
import { colors, spacing } from "@/theme";
import { useRouter } from "expo-router";
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

export default function RegisterScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [pass2, setPass2] = useState("");
    const [loading, setLoading] = useState(false);

    const passRef = useRef<TextInput>(null);
    const confirmRef = useRef<TextInput>(null);

    const { register } = useAuth();

    const onCreate = async () => {
        if (pass !== pass2) {
            Alert.alert("Senhas não conferem", "Verifique e tente novamente.");
            return;
        }
        setLoading(true);
        try {
            await register(email.trim(), pass);
            // Após criar/login automático, vai para a escolha do Kaizoo
            router.replace("/kaizoo/select");
        } catch (e: any) {
            Alert.alert("Erro ao criar conta", e?.message ?? String(e));
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
                        Seja{"\n"}Bem vindo!
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
                        autoComplete="password-new"
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => confirmRef.current?.focus()}
                        style={styles.input}
                    />

                    <TextInput
                        ref={confirmRef}
                        placeholder="confirmar senha"
                        placeholderTextColor="#6B6B6B"
                        value={pass2}
                        onChangeText={setPass2}
                        secureTextEntry
                        textContentType="password"
                        autoComplete="password-new"
                        returnKeyType="done"
                        onSubmitEditing={onCreate}
                        style={styles.input}
                    />

                    <View style={{ height: 24 }} />

                    <Button label="Criar Conta" onPress={onCreate} fullWidth loading={loading} />
                    <View style={{ height: spacing.sm }} />
                    <Button
                        variant="ghost"
                        onPress={() => router.replace("/(auth)/login")}
                        fullWidth
                        label="já tenho conta"
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
