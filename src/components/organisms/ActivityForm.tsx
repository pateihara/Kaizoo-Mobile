// //src/components/organisms/ActivityForm.tsx
import { colors, spacing } from "@/theme";
import { useState } from "react";
import { TextInput } from "react-native";
import Button from "../atoms/Button";
import Card from "../atoms/Card";
import Text from "../atoms/Text";

export default function ActivityForm() {
    const [type, setType] = useState("caminhada");
    const [minutes, setMinutes] = useState("");

    const submit = () => {
        // aqui você integra com seu estado global / API
        console.log({ type, minutes: Number(minutes || 0) });
    };

    return (
        <Card>
            <Text variant="subtitle" style={{ marginBottom: spacing.md }}>Registrar Atividade</Text>

            <Text color={colors.gray[600]}>Tipo</Text>
            <TextInput
                value={type}
                onChangeText={setType}
                placeholder="caminhada, bike, corrida…"
                style={{ borderWidth: 1, borderColor: colors.gray[300], borderRadius: 10, padding: spacing.md, marginBottom: spacing.md }}
            />

            <Text color={colors.gray[600]}>Minutos</Text>
            <TextInput
                value={minutes}
                onChangeText={setMinutes}
                keyboardType="numeric"
                placeholder="30"
                style={{ borderWidth: 1, borderColor: colors.gray[300], borderRadius: 10, padding: spacing.md, marginBottom: spacing.lg }}
            />

            <Button title="Salvar" onPress={submit} fullWidth />
        </Card>
    );
}
