// app/kaizoo/form.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import { saveOnboardingPreferences } from "@/services/profile";
import { radius, spacing } from "@/theme";

const Q1 = {
    title: "Qual o seu objetivo principal com exercícios?",
    key: "goal",
    options: ["Perder peso", "Ganho de massa muscular", "Aumentar resistência"],
} as const;

const Q2 = {
    title: "Com qual frequência se exercita atualmente?",
    key: "freq",
    options: ["Diariamente", "3–4 vezes por semana", "menos de 3 vezes por semana"],
} as const;

const Q3 = {
    title: "Quais atividades você mais gosta?",
    key: "likes",
    options: ["Corrida / Caminhada", "Ciclismo", "Musculação", "Yoga / Alongamento"],
} as const;

type Answers = { goal?: string; freq?: string; likes: string[] };

export default function KaizooForm() {
    const router = useRouter();
    const [answers, setAnswers] = React.useState<Answers>({ likes: [] });

    const setAnswer = (k: "goal" | "freq", v: string) => setAnswers((a) => ({ ...a, [k]: v }));
    const toggleLike = (opt: string) =>
        setAnswers((a) => ({ ...a, likes: a.likes.includes(opt) ? a.likes.filter((x) => x !== opt) : [...a.likes, opt] }));

    const validate = () => {
        if (!answers.goal || !answers.freq || answers.likes.length === 0) {
            Alert.alert("Falta responder", "Responda todas as perguntas (escolha ao menos uma atividade) para continuar.");
            return false;
        }
        return true;
    };

    const finalize = async () => {
        if (!validate()) return;
        try {
            await saveOnboardingPreferences({ goal: answers.goal!, freq: answers.freq!, likes: answers.likes });
            router.replace("/kaizoo/success");
        } catch (e: any) {
            Alert.alert("Não foi possível finalizar", String(e?.message ?? e));
        }
    };

    const goBack = () => router.replace("/kaizoo/select");

    return (
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
            <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }} style={styles.container}>
                <View style={{ padding: spacing.lg, paddingTop: spacing.xl }}>
                    <View style={styles.stepPill}>
                        <Text weight="bold">2. Breve Questionário</Text>
                    </View>
                </View>

                <View style={{ paddingHorizontal: spacing.lg }}>
                    <View style={styles.card}>
                        <Text variant="title" weight="bold" style={{ marginBottom: spacing.md }}>
                            Me conte suas preferências
                        </Text>

                        <View style={styles.block}>
                            <Text weight="bold" style={styles.blockTitle}>
                                {Q1.title}
                            </Text>
                            <View style={{ gap: 14, marginTop: spacing.sm }}>
                                {Q1.options.map((opt) => (
                                    <RadioRow key={opt} label={opt} selected={answers.goal === opt} onPress={() => setAnswer("goal", opt)} />
                                ))}
                            </View>
                        </View>

                        <View style={styles.block}>
                            <Text weight="bold" style={styles.blockTitle}>
                                {Q2.title}
                            </Text>
                            <View style={{ gap: 14, marginTop: spacing.sm }}>
                                {Q2.options.map((opt) => (
                                    <RadioRow key={opt} label={opt} selected={answers.freq === opt} onPress={() => setAnswer("freq", opt)} />
                                ))}
                            </View>
                        </View>

                        <View style={styles.block}>
                            <Text weight="bold" style={styles.blockTitle}>
                                {Q3.title}
                            </Text>
                            <View style={{ gap: 14, marginTop: spacing.sm }}>
                                {Q3.options.map((opt) => (
                                    <CheckboxRow key={opt} label={opt} checked={answers.likes.includes(opt)} onPress={() => toggleLike(opt)} />
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ padding: spacing.lg, gap: spacing.sm }}>
                    <Button label="finalizar" variant="onboardingFilled" onPress={finalize} fullWidth />
                    <Button label="voltar" variant="onboardingOutline" onPress={goBack} fullWidth />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function RadioRow({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.radioRow}
            accessibilityRole="radio"
            accessibilityState={{ selected: !!selected }}
        >
            <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>{selected ? <View style={styles.radioInner} /> : null}</View>
            <Text style={styles.radioLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

function CheckboxRow({ label, checked, onPress }: { label: string; checked?: boolean; onPress?: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.checkboxRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: !!checked }}
        >
            <View style={[styles.checkboxBox, checked && styles.checkboxBoxActive]}>{checked ? <View style={styles.checkboxTick} /> : null}</View>
            <Text style={styles.checkboxLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "black" },
    container: { flex: 1, backgroundColor: "black" },
    stepPill: { alignSelf: "center", backgroundColor: "white", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 999 },
    card: { backgroundColor: "white", borderRadius: radius.lg ?? 16, padding: spacing.lg },
    block: { marginTop: spacing.lg },
    blockTitle: { fontSize: 16, lineHeight: 22 },
    radioRow: { flexDirection: "row", alignItems: "center", columnGap: 12 },
    radioOuter: { width: 26, height: 26, borderRadius: 26, borderWidth: 2, borderColor: "#2B2B2B", alignItems: "center", justifyContent: "center" },
    radioOuterActive: { borderColor: "#86E3D2" },
    radioInner: { width: 14, height: 14, borderRadius: 14, backgroundColor: "#86E3D2" },
    radioLabel: { fontSize: 18, lineHeight: 24, color: "#111" },
    checkboxRow: { flexDirection: "row", alignItems: "center", columnGap: 12 },
    checkboxBox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: "#2B2B2B", alignItems: "center", justifyContent: "center" },
    checkboxBoxActive: { borderColor: "#86E3D2", backgroundColor: "#E9FBF7" },
    checkboxTick: { width: 14, height: 14, borderRadius: 3, backgroundColor: "#86E3D2" },
    checkboxLabel: { fontSize: 18, lineHeight: 24, color: "#111" },
});
