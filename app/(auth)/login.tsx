// app/(auth)/login.tsx
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Text from "@/components/atoms/Text";
import { useAuth } from "@/contexts/AuthContext";
import { spacing } from "@/theme";
import { useNavigation, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
    View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [loading, setLoading] = useState(false);
    const passRef = useRef<TextInput>(null);

    const safeBack = () => {
        if ("canGoBack" in navigation && navigation.canGoBack()) navigation.goBack();
        else router.replace("/onboarding");
    };

    const { login } = useAuth();

    const onLogin = async () => {
        setLoading(true);
        try {
            await login(email.trim(), pass);
            router.replace("/");
        } catch (e: any) {
            Alert.alert("Erro ao entrar", e?.message ?? String(e));
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
                            contentContainerStyle={styles.content}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <Image
                                source={require("assets/images/allTogether.png")}
                                resizeMode="contain"
                            />

                            <View style={styles.headerBlock}>
                                <Text variant="title" weight="bold" style={styles.title}>
                                    Bem vindo de volta!
                                </Text>
                            </View>

                            <View style={styles.formBlock}>
                                <Input
                                    placeholder="e-mail"
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
                                />

                                <Input
                                    ref={passRef}
                                    placeholder="senha"
                                    value={pass}
                                    onChangeText={setPass}
                                    secureTextEntry
                                    textContentType="password"
                                    autoComplete="password"
                                    returnKeyType="done"
                                    onSubmitEditing={onLogin}
                                />
                            </View>

                            <View style={{ height: spacing.xl * 2 }} />
                        </ScrollView>

                        <View style={[styles.footerFixed, { paddingBottom: insets.bottom + spacing.md }]}>
                            <Button
                                variant="onboardingFilled"
                                label="Entrar"
                                onPress={onLogin}
                                fullWidth
                                loading={loading}
                                accessibilityRole="button"
                                accessibilityLabel="Entrar"
                            />
                            <View style={{ height: spacing.sm }} />
                            <Button
                                variant="onboardingOutline"
                                onPress={() => router.push("/(auth)/register")}
                                fullWidth
                                label="Criar Conta"
                                accessibilityRole="button"
                                accessibilityLabel="Criar conta"
                            />
                            <View style={{ height: spacing.xs }} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    screen: { flex: 1, backgroundColor: "black" },
    container: { flex: 1 },

    scroll: { flex: 1 },
    content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        gap: spacing.md,
        alignItems: "center",
    },

    headerBlock: {
        width: "100%",
        alignItems: "center",
    },

    formBlock: {
        width: "100%",
        gap: spacing.sm,
    },

    footerFixed: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: spacing.lg,
        backgroundColor: "black",
    },

    title: { color: "white", textAlign: "center", marginBottom: spacing.md },
});
