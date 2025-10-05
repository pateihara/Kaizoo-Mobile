import React, { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterScreen() {
    const { register } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);

    async function onSubmit() {
        setErr(null);
        try {
            await register(email.trim(), password);
            // navegar para Home / Onboarding…
        } catch (e: any) {
            setErr(e?.response?.data?.error ?? "Falha ao registrar");
        }
    }

    return (
        <View style={{ padding: 16, gap: 12 }}>
            <TextInput placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
            <TextInput placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />
            {err && <Text style={{ color: "red" }}>{String(err)}</Text>}
            <Button title="Criar conta" onPress={onSubmit} />
        </View>
    );
}
