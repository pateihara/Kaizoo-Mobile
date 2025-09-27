// app/atividade.tsx
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import FriendAvatar from "@/components/molecules/FriendAvatar";
import Screen from "@/components/templates/Screen";
import { colors, radius, spacing } from "@/theme";
import React, { useMemo, useState } from "react";
import { TextInput, View } from "react-native";

/** ------------------------- tipos e mocks ------------------------- */
type ActivityKey = "alongamento" | "caminhada" | "corrida" | "pedalada" | "yoga" | "outro";

const ACTIVITY_OPTIONS: { key: ActivityKey; label: string; icon: string }[] = [
    { key: "alongamento", label: "Alongamento", icon: "🙆" },
    { key: "caminhada", label: "Caminhada", icon: "🚶" },
    { key: "corrida", label: "Corrida", icon: "🏃" },
    { key: "pedalada", label: "Pedalada", icon: "🚴" },
    { key: "yoga", label: "Yoga", icon: "🧘" },
    { key: "outro", label: "Outro", icon: "➕" },
];

// campos por atividade (layout dos prints)
const SPECIFIC_FIELDS: Record<ActivityKey, string[]> = {
    alongamento: ["Tipo de prática", "Foco corporal", "Ambiente"],
    caminhada: ["Distância em km", "Passos", "Ritmo", "Local"],
    corrida: ["Distância em km", "Passos", "Ritmo", "Local"],
    pedalada: ["Distância em km", "Altimetria", "Tipo de pedal", "Equipameneto"],
    yoga: ["Tipo de prática", "Foco corporal", "Ambiente"],
    outro: ["Nome da atividade", "observações (multilinha)"],
};

const DEFAULT_FIELDS = ["Data", "Duração", "Intensidade", "Nota de bom humor"];

/** ----------------------------- page ------------------------------ */
export default function ActivityPage() {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [activity, setActivity] = useState<ActivityKey | null>(null);
    const [friendQuery, setFriendQuery] = useState("");
    const [addedFriends, setAddedFriends] = useState<Array<"dino" | "kaia" | "penny" | "tato">>([]);

    const specificFields = useMemo(() => SPECIFIC_FIELDS[activity ?? "alongamento"], [activity]);

    const goNext = () => {
        if (step === 1) return setStep(2);
        if (step === 2) return setStep(3);
        if (step === 3) return setStep(4);
    };
    const goBack = () => {
        if (step === 3) return setStep(2);
        if (step === 2) return setStep(1);
    };

    return (
        <Screen>
            {/* Stepper */}
            <Stepper current={step} />

            <Text variant="title" weight="bold" style={{ marginBottom: spacing.sm }}>
                Registrar Atividade
            </Text>

            {step !== 4 ? (
                <Card style={{ padding: spacing.lg, borderRadius: radius.lg }}>
                    {/* Escolha da atividade (sempre visível no topo) */}
                    <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.md }}>
                        Escolha a Atividade
                    </Text>

                    {/* Linha selecionada (quando já escolheu) */}
                    {step > 1 && activity ? (
                        <OptionPill
                            label={ACTIVITY_OPTIONS.find((a) => a.key === activity)?.label ?? ""}
                            icon={ACTIVITY_OPTIONS.find((a) => a.key === activity)?.icon ?? ""}
                            selected
                            onPress={() => setStep(1)}
                        />
                    ) : (
                        <View style={{ gap: spacing.sm }}>
                            {ACTIVITY_OPTIONS.map((opt) => (
                                <OptionPill
                                    key={opt.key}
                                    label={opt.label}
                                    icon={opt.icon}
                                    selected={activity === opt.key}
                                    onPress={() => {
                                        setActivity(opt.key);
                                        setStep(2);
                                    }}
                                />
                            ))}
                        </View>
                    )}

                    {/* Passo 2: campos */}
                    {step === 2 && (
                        <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
                            <Text variant="subtitle" weight="bold">
                                Dados Padrão
                            </Text>
                            <View style={{ gap: spacing.sm }}>
                                {DEFAULT_FIELDS.map((f) => (
                                    <FieldPill key={f} placeholder={f} />
                                ))}
                            </View>

                            <Text variant="subtitle" weight="bold" style={{ marginTop: spacing.md }}>
                                Dados Específicos
                            </Text>
                            <View style={{ gap: spacing.sm }}>
                                {specificFields.map((f) =>
                                    f.toLowerCase().includes("observa") ? (
                                        <FieldPill key={f} placeholder="observações" multiline />
                                    ) : (
                                        <FieldPill key={f} placeholder={f} />
                                    )
                                )}
                            </View>
                        </View>
                    )}

                    {/* Passo 3: amigos */}
                    {step === 3 && (
                        <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
                            <Text variant="subtitle" weight="bold">
                                Adicionar Amigos
                            </Text>
                            <FieldPill
                                placeholder="buscar por e-mail"
                                value={friendQuery}
                                onChangeText={setFriendQuery}
                            />

                            {addedFriends.length > 0 ? (
                                <View style={{ marginTop: spacing.md }}>
                                    <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
                                        Adicionados:
                                    </Text>
                                    <View style={{ flexDirection: "row", gap: spacing.md }}>
                                        {addedFriends.map((m) => (
                                            <FriendAvatar key={m} mascot={m} size={44} />
                                        ))}
                                    </View>
                                </View>
                            ) : null}

                            {/* Simula adicionar alguém ao tocar no campo */}
                            <Button
                                variant="secondary"
                                label="Adicionar amigo mock"
                                onPress={() => {
                                    const pool: any[] = ["dino", "kaia", "penny", "tato"];
                                    const next = pool[(addedFriends.length % pool.length) as number] as
                                        | "dino"
                                        | "kaia"
                                        | "penny"
                                        | "tato";
                                    setAddedFriends((p) => [...p, next]);
                                }}
                            />
                        </View>
                    )}
                </Card>
            ) : (
                // Passo 4: sucesso
                <Card
                    style={{
                        padding: spacing.lg,
                        borderRadius: radius.lg,
                        alignItems: "center",
                        gap: spacing.lg,
                    }}
                >
                    <Text variant="subtitle" style={{ fontSize: 56, lineHeight: 64 }}>
                        🐱🐢🦖🐧🐨
                    </Text>
                    <Text variant="subtitle" weight="bold" style={{ textAlign: "center" }}>
                        Atividade{"\n"}Registrada com{"\n"}Sucesso!
                    </Text>
                </Card>
            )}

            {/* Ações inferiores (como no layout) */}
            {step !== 4 ? (
                <>
                    <Button label={step === 3 ? "Registrar atividade" : "Próximo"} fullWidth onPress={goNext} />
                    {step > 1 ? (
                        <Button
                            variant="secondary"
                            fullWidth
                            onPress={goBack}
                            style={{ backgroundColor: colors.mascots.paleTurquoise }}
                        >
                            <Text variant="button" color={colors.black} style={{ textAlign: "center", width: "100%" }}>
                                voltar
                            </Text>
                        </Button>
                    ) : null}
                </>
            ) : (
                <Button
                    label="Registrar outra"
                    fullWidth
                    onPress={() => {
                        setStep(1);
                        setActivity(null);
                        setFriendQuery("");
                        setAddedFriends([]);
                    }}
                />
            )}
        </Screen>
    );
}

/** --------------------------- helpers UI --------------------------- */

function Stepper({ current }: { current: 1 | 2 | 3 | 4 }) {
    const Item = ({ n, active }: { n: number; active: boolean }) => (
        <View
            style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                borderRadius: 999,
                backgroundColor: active ? colors.black : "transparent",
            }}
        >
            <Text variant="subtitle" weight="bold" color={active ? colors.white : colors.black}>
                {`Passo 0${n}`}
            </Text>
        </View>
    );

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                marginBottom: spacing.md,
            }}
        >
            <Item n={1} active={current === 1} />
            <Arrow />
            <Item n={2} active={current === 2} />
            <Arrow />
            <Item n={3} active={current === 3} />
        </View>
    );
}

function Arrow() {
    return (
        <Text variant="subtitle" color={colors.gray[600]}>
            →
        </Text>
    );
}

function OptionPill({
    label,
    icon,
    selected,
    onPress,
}: {
    label: string;
    icon: string;
    selected?: boolean;
    onPress?: () => void;
}) {
    return (
        <Button
            variant="secondary"
            onPress={onPress}
            fullWidth
            style={{
                backgroundColor: colors.mascots.navajoWhite,
                borderRadius: radius.full,
                paddingVertical: spacing.md,
                alignItems: "flex-start",
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <Text variant="subtitle">{icon}</Text>
                <Text variant="subtitle" weight="bold">
                    {label}
                </Text>
                {selected ? <Text variant="subtitle">✓</Text> : null}
            </View>
        </Button>
    );
}

function FieldPill({
    placeholder,
    value,
    onChangeText,
    multiline,
}: {
    placeholder: string;
    value?: string;
    onChangeText?: (t: string) => void;
    multiline?: boolean;
}) {
    return (
        <View
            style={{
                backgroundColor: colors.gray[200],
                borderRadius: radius.full,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
            }}
        >
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
                style={{
                    minHeight: multiline ? 120 : undefined,
                    fontSize: 18,
                }}
                placeholderTextColor={colors.gray[600]}
            />
        </View>
    );
}
