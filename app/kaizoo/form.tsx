//app/kaizoo/form.tsx
import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import { colors, radius, spacing } from "@/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

const Q1 = ["Perder peso", "Ganho de massa muscular", "Aumentar resistência"] as const;
const Q2 = ["Diariamente", "3-4 vezes por semana", "menos de 3 vezes por semana"] as const;
const Q3 = ["Corrida / Caminhada", "Ciclismo", "Musculação", "Yoga / Alongamento"] as const;

function Option({ selected, onPress, children }: any) {
    return (
        <Pressable onPress={onPress} style={styles.optionRow}>
            <View style={[styles.radio, selected && styles.radioOn]} />
            <Text style={{ flex: 1 }}>{children}</Text>
        </Pressable>
    );
}

export default function KaizooForm() {
    const router = useRouter();
    const { mascot } = useLocalSearchParams<{ mascot?: string }>();

    const [goal, setGoal] = useState<string>();
    const [freq, setFreq] = useState<string>();
    const [acts, setActs] = useState<string[]>([]);

    const toggleAct = (v: string) =>
        setActs((a) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]));

    const canSubmit = useMemo(() => goal && freq && acts.length > 0, [goal, freq, acts]);

    const onSubmit = async () => {
        if (!canSubmit) return;
        await AsyncStorage.setItem("profile:questionnaire", JSON.stringify({ mascot, goal, freq, acts }));
        await AsyncStorage.setItem("profile:ready", "1");
        router.replace("/kaizoo/success");
    };

    return (
        <View style={{ flex: 1, backgroundColor: "black" }}>
            <View style={{ padding: spacing.lg, paddingTop: spacing.xl }}>
                <View style={styles.stepPill}>
                    <Text weight="bold">2. Breve Questionário</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
                <View style={styles.card}>
                    <Text variant="title" weight="bold" style={{ marginBottom: spacing.md }}>
                        Me conte suas preferências
                    </Text>

                    <Text weight="bold" style={{ marginBottom: spacing.xs }}>
                        Qual o seu objetivo principal com exercícios?
                    </Text>
                    {Q1.map((o) => (
                        <Option key={o} selected={goal === o} onPress={() => setGoal(o)}>
                            {o}
                        </Option>
                    ))}

                    <View style={styles.divider} />

                    <Text weight="bold" style={{ marginBottom: spacing.xs }}>
                        Com qual frequência se exercita atualmente?
                    </Text>
                    {Q2.map((o) => (
                        <Option key={o} selected={freq === o} onPress={() => setFreq(o)}>
                            {o}
                        </Option>
                    ))}

                    <View style={styles.divider} />

                    <Text weight="bold" style={{ marginBottom: spacing.xs }}>
                        Quais atividades você mais gosta?
                    </Text>
                    {Q3.map((o) => (
                        <Pressable key={o} onPress={() => toggleAct(o)} style={styles.optionRow}>
                            <View style={[styles.checkbox, acts.includes(o) && styles.checkboxOn]} />
                            <Text style={{ flex: 1 }}>{o}</Text>
                        </Pressable>
                    ))}
                </View>

                <Button label="finalizar" onPress={onSubmit} fullWidth disabled={!canSubmit} />
                <Button variant="secondary" label="voltar" onPress={() => router.back()} fullWidth />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    stepPill: {
        alignSelf: "center",
        backgroundColor: "white",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 999,
    },
    card: {
        backgroundColor: "white",
        borderRadius: radius.lg ?? 16,
        padding: spacing.lg,
        gap: spacing.sm,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: 8,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: "#333",
        backgroundColor: "transparent",
    },
    radioOn: { backgroundColor: "#5ee0cf", borderColor: "#5ee0cf" },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#333",
        backgroundColor: "transparent",
    },
    checkboxOn: { backgroundColor: "#5ee0cf", borderColor: "#5ee0cf" },
    divider: { height: 1, backgroundColor: colors.gray?.[200] ?? "#eee", marginVertical: spacing.sm },
});
