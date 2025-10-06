// app/teste-health.tsx
import { http } from "@/lib/api";
import React, { useState } from "react";
import { Button, Text, View } from "react-native";

export default function TesteHealth() {
    const [out, setOut] = useState("...");

    const ping = async () => {
        try {
            const r = await http.get("/health");
            setOut(JSON.stringify(r.data));
        } catch (e: any) {
            setOut(e?.message || "falha");
        }
    };

    return (
        <View style={{ padding: 24 }}>
            <Button title="Testar /health" onPress={ping} />
            <Text style={{ marginTop: 16 }}>{out}</Text>
        </View>
    );
}
