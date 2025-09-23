//app/(auth)/register.tsx
import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import { useAuth } from "@/contexts/AuthContext";
import { colors, spacing } from "@/theme";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [pass2, setPass2] = useState("");
    const [loading, setLoading] = useState(false);

    const passRef = useRef<TextInput>(null);
    const confirmRef = useRef<TextInput>(null);

    const { register } = useAuth();

    // 👇 estado do teclado
    const [kbOpen, setKbOpen] = useState(false);
    useEffect(() => {
        const sh = Keyboard.addListener("keyboardDidShow", () => setKbOpen(true));
        const hd = Keyboard.addListener("keyboardDidHide", () => setKbOpen(false));
        return () => {
            sh.remove();
            hd.remove();
        };
    }, []);

    const onCreate = async () => {
        if (pass !== pass2) {
            Alert.alert("Senhas não conferem", "Verifique e tente novamente.");
            return;
        }
        setLoading(true);
        try {
            await register(email.trim(), pass);
            router.replace("/kaizoo/select");
        } catch (e: any) {
            Alert.alert("Erro ao criar conta", e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.container}>
                        <ScrollView
                            style={styles.scroll}
                            contentContainerStyle={[
                                styles.content,
                                {
                                    paddingTop: kbOpen ? spacing.sm : spacing.xl, // 👈 reduz no teclado
                                    minHeight: "100%",
                                },
                            ]}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                            showsVerticalScrollIndicator={false}
                            automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
                        >
                            {/* Header some quando teclado abre */}
                            {!kbOpen && (
                                <View style={styles.headerBlock}>
                                    <Image
                                        source={require("assets/images/allTogether.png")}
                                        style={styles.image}
                                        resizeMode="contain"
                                    />
                                    <Text variant="title" weight="bold" style={styles.title}>
                                        Seja{"\n"}Bem vindo!
                                    </Text>
                                </View>
                            )}

                            <View style={styles.formBlock}>
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
                            </View>

                            {/* folga pra não colar no footer */}
                            <View style={{ height: spacing.lg }} />
                        </ScrollView>

                        {/* Footer fora do ScrollView (não absoluto) */}
                        <SafeAreaView edges={["bottom"]} style={styles.footer}>
                            <Button
                                label="Criar Conta"
                                onPress={onCreate}
                                fullWidth
                                loading={loading}
                                accessibilityLabel="Criar Conta"
                                variant="onboardingFilled"
                            />
                            <View style={{ height: spacing.sm }} />
                            <Button
                                variant="onboardingOutline"
                                onPress={() => router.replace("/(auth)/login")}
                                fullWidth
                                label="já tenho conta"
                                accessibilityLabel="Já tenho conta"
                            />
                        </SafeAreaView>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    screen: { flex: 1, backgroundColor: "black" },
    container: { flex: 1, backgroundColor: "black" },

    scroll: { flex: 1 },
    content: {
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
        alignItems: "center",
        justifyContent: "flex-start",
    },

    headerBlock: { width: "100%", alignItems: "center" },

    formBlock: { width: "100%", gap: spacing.sm },

    footer: {
        paddingTop: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        backgroundColor: "black",
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "rgba(255,255,255,0.08)",
    },

    image: {
        width: "80%",
        height: 200,
        alignSelf: "center",
        marginBottom: spacing.md,
    },

    title: { color: "white", textAlign: "center", marginBottom: spacing.md },

    input: {
        height: 56,
        borderRadius: 28,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.gray?.[200] ?? "#EDEDED",
        color: "#111",
        alignSelf: "stretch",
    },
});
