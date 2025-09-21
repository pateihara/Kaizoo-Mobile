// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    return (
        <View style={{ padding: 16 }}>
            <Text>Email</Text>
            <TextInput autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <Text>Senha</Text>
            <TextInput secureTextEntry value={password} onChangeText={setPassword} />
            {err && <Text style={{ color: "red" }}>{err}</Text>}
            <Button
                title={loading ? "Entrando..." : "Entrar"}
                onPress={async () => {
                    setErr(null); setLoading(true);
                    try {
                        await login(email.trim(), password);
                    } catch (e: any) {
                        setErr(e.message ?? "Falha no login");
                    } finally {
                        setLoading(false);
                    }
                }}
            />
        </View>
    );
}
