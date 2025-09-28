// app/(tabs)/atividade.tsx
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Text from "@/components/atoms/Text";
import FriendAvatar from "@/components/molecules/FriendAvatar";
import Screen from "@/components/templates/Screen";
import { useActivityStore } from "@/contexts/ActivityContext";
import { colors, radius, spacing } from "@/theme";
import DateTimePicker, { AndroidNativeProps, IOSNativeProps } from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import { Dimensions, Platform, Pressable, View } from "react-native";

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

// Simplificado conforme sua orientação
const SPECIFIC_BY_ACTIVITY: Record<ActivityKey, Array<{ key: string; type: "text" | "number" | "multiline" }>> = {
    alongamento: [{ key: "Observações", type: "multiline" }],
    caminhada: [{ key: "Distância (km)", type: "number" }],
    corrida: [{ key: "Distância (km)", type: "number" }],
    pedalada: [{ key: "Distância (km)", type: "number" }],
    yoga: [{ key: "Observações", type: "multiline" }],
    outro: [
        { key: "Nome da atividade", type: "text" },
        { key: "Observações", type: "multiline" },
    ],
};

// Intensidade e Humor (emojis)
type Intensity = "low" | "medium" | "high";
const INTENSITY_OPTIONS: Array<{ key: Intensity; label: string }> = [
    { key: "low", label: "Baixa" },
    { key: "medium", label: "Média" },
    { key: "high", label: "Alta" },
];

type Mood = 1 | 2 | 3 | 4 | 5;
const MOOD_OPTIONS: Array<{ value: Mood; emoji: string; label: string }> = [
    { value: 1, emoji: "😢", label: "Muito ruim" },
    { value: 2, emoji: "🙁", label: "Ruim" },
    { value: 3, emoji: "😐", label: "Neutro" },
    { value: 4, emoji: "🙂", label: "Bom" },
    { value: 5, emoji: "😄", label: "Ótimo" },
];

// Ambiente
type Environment = "open" | "closed";

/** ----------------------------- page ------------------------------ */
export default function ActivityPage() {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [activity, setActivity] = useState<ActivityKey | null>(null);

    // Campos padrão
    const [date, setDate] = useState<Date>(new Date());

    // Duração em MINUTOS (evita fuso/DST)
    const [durationMin, setDurationMin] = useState<number>(30); // 00:30 padrão

    const [intensity, setIntensity] = useState<Intensity | null>(null);
    const [mood, setMood] = useState<Mood | null>(null);
    const [environment, setEnvironment] = useState<Environment | null>(null);

    // Pickers (visibilidade)
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Amigos (step 3)
    const [friendQuery, setFriendQuery] = useState("");
    const [addedFriends, setAddedFriends] = useState<Array<"dino" | "kaia" | "penny" | "tato">>([]);

    // Campos específicos
    const specificSchema = useMemo(
        () => SPECIFIC_BY_ACTIVITY[activity ?? "alongamento"],
        [activity]
    );
    const [specificValues, setSpecificValues] = useState<Record<string, string>>({});
    const updateSpecific = (key: string, v: string) =>
        setSpecificValues((p) => ({ ...p, [key]: v }));

    const goNext = () => {
        if (step === 1) return setStep(2);
        if (step === 2) return setStep(3);
        if (step === 3) return setStep(4);
    };
    const goBack = () => {
        if (step === 3) return setStep(2);
        if (step === 2) return setStep(1);
    };

    // Handlers Date/Time (Android/iOS)
    const onPickDate: AndroidNativeProps["onChange"] & IOSNativeProps["onChange"] = (_, selected) => {
        if (Platform.OS === "android") setShowDatePicker(false);
        if (selected) setDate(selected);
    };

    const onPickTime: AndroidNativeProps["onChange"] & IOSNativeProps["onChange"] = (_, selected) => {
        if (Platform.OS === "android") setShowTimePicker(false);
        if (selected) {
            const h = selected.getHours() || 0;
            const m = selected.getMinutes() || 0;
            setDurationMin(h * 60 + m);
        }
    };

    // Helpers para exibição
    const formatDate = (d: Date) =>
        d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });

    const formatDuration = (mins: number) => {
        const h = Math.floor(mins / 60).toString().padStart(2, "0");
        const m = (mins % 60).toString().padStart(2, "0");
        return `${h}:${m}`;
    };

    // Date para alimentar o picker (só para a UI do relógio)
    const durationAsDate = useMemo(() => {
        const h = Math.floor(durationMin / 60);
        const m = durationMin % 60;
        return new Date(1970, 0, 1, h, m, 0, 0);
    }, [durationMin]);

    // Store global (salvar atividade)
    const { addActivity } = useActivityStore();

    return (
        <Screen>
            {step !== 4 && <Stepper current={step} onJump={(s) => setStep(s)} />}

            <Text variant="title" weight="bold" style={{ marginBottom: spacing.sm }}>
                Registrar Atividade
            </Text>

            {step !== 4 ? (
                <Card
                    style={{
                        padding: spacing.lg,
                        borderRadius: radius.lg,
                    }}
                >
                    {/* Step 1 — Escolha de atividade */}
                    {step === 1 && (
                        <>
                            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.md }}>
                                Escolha a Atividade
                            </Text>

                            <View style={{ gap: spacing.sm }}>
                                {ACTIVITY_OPTIONS.map((opt) => (
                                    <OptionPill
                                        key={opt.key}
                                        label={opt.label}
                                        icon={opt.icon}
                                        onPress={() => {
                                            setActivity(opt.key);
                                            setStep(2); // avança automaticamente
                                        }}
                                    />
                                ))}
                            </View>
                        </>
                    )}

                    {/* Step 2 — Campos padrão + específicos */}
                    {step === 2 && (
                        <View style={{ gap: spacing.lg }}>
                            {/* Chip com atividade selecionada no topo */}
                            {activity && (
                                <SelectedActivityChip
                                    activity={activity}
                                    onChange={() => {
                                        setActivity(null);
                                        setStep(1); // voltar e trocar
                                    }}
                                />
                            )}

                            {/* Campos padrão */}
                            <View style={{ gap: spacing.md }}>
                                <Text variant="subtitle" weight="bold">Dados Padrão</Text>

                                {/* Data */}
                                <FieldLabel label="Data" />
                                <Pressable
                                    onPress={() => setShowDatePicker(true)}
                                    style={pressablePillStyle}
                                    accessibilityRole="button"
                                    accessibilityLabel="Selecionar data"
                                >
                                    <Text variant="body">{formatDate(date)}</Text>
                                </Pressable>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={date}
                                        mode="date"
                                        onChange={onPickDate}
                                        display={Platform.OS === "ios" ? "inline" : "default"}
                                    />
                                )}

                                {/* Duração */}
                                <FieldLabel label="Duração (hh:mm)" />
                                <Pressable
                                    onPress={() => setShowTimePicker(true)}
                                    style={pressablePillStyle}
                                    accessibilityRole="button"
                                    accessibilityLabel="Selecionar duração"
                                >
                                    <Text variant="body">{formatDuration(durationMin)}</Text>
                                </Pressable>
                                {showTimePicker && (
                                    <DateTimePicker
                                        value={durationAsDate}
                                        mode="time"
                                        onChange={onPickTime}
                                        is24Hour
                                        display={Platform.OS === "ios" ? "spinner" : "default"}
                                    />
                                )}

                                {/* Intensidade */}
                                <FieldLabel label="Intensidade" />
                                <SegmentedPills<Intensity>
                                    options={INTENSITY_OPTIONS}
                                    selected={intensity}
                                    onSelect={setIntensity}
                                />

                                {/* Humor */}
                                <FieldLabel label="Como você está se sentindo?" />
                                <MoodPicker value={mood} onChange={setMood} />

                                {/* Ambiente */}
                                <FieldLabel label="Ambiente" />
                                <SegmentedBinary
                                    left={{ key: "open", label: "Aberto" }}
                                    right={{ key: "closed", label: "Fechado" }}
                                    selected={environment}
                                    onSelect={setEnvironment}
                                />
                            </View>

                            {/* Dados específicos */}
                            {activity && specificSchema.length > 0 && (
                                <View style={{ gap: spacing.md }}>
                                    <Text variant="subtitle" weight="bold">Dados Específicos</Text>
                                    {specificSchema.map((f) => {
                                        if (f.type === "multiline") {
                                            return (
                                                <Input
                                                    key={f.key}
                                                    placeholder={f.key}
                                                    multiline
                                                    autoGrow
                                                    multilineMinHeight={120}
                                                    multilineMaxHeight={220}
                                                    value={specificValues[f.key] ?? ""}
                                                    onChangeText={(t) => updateSpecific(f.key, t)}
                                                    style={{ width: "100%" }}
                                                />
                                            );
                                        }
                                        if (f.type === "number") {
                                            return (
                                                <Input
                                                    key={f.key}
                                                    placeholder={f.key}
                                                    keyboardType="decimal-pad"
                                                    value={specificValues[f.key] ?? ""}
                                                    onChangeText={(t) => updateSpecific(f.key, t)}
                                                    style={{ width: "100%" }}
                                                />
                                            );
                                        }
                                        return (
                                            <Input
                                                key={f.key}
                                                placeholder={f.key}
                                                value={specificValues[f.key] ?? ""}
                                                onChangeText={(t) => updateSpecific(f.key, t)}
                                                style={{ width: "100%" }}
                                            />
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Step 3 — Amigos */}
                    {step === 3 && (
                        <View style={{ marginTop: spacing.xs, gap: spacing.md }}>
                            <Text variant="subtitle" weight="bold">Adicionar Amigos</Text>

                            <Input
                                placeholder="buscar por e-mail"
                                value={friendQuery}
                                onChangeText={setFriendQuery}
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="email-address"
                                textContentType="emailAddress"
                                autoComplete="email"
                                style={{ width: "100%" }}
                            />

                            {addedFriends.length > 0 ? (
                                <View style={{ marginTop: spacing.md }}>
                                    <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
                                        Adicionados:
                                    </Text>

                                    <View
                                        style={{
                                            flexDirection: "row",
                                            flexWrap: "wrap",
                                            gap: spacing.md,
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        {addedFriends.map((m, i) => (
                                            <FriendAvatar key={`${m}-${i}`} mascot={m} size={44} />
                                        ))}
                                    </View>
                                </View>
                            ) : null}

                            <Button
                                variant="secondary"
                                label="Adicionar amigo mock"
                                onPress={() => {
                                    const pool: any[] = ["dino", "kaia", "penny", "tato"];
                                    const next = pool[(addedFriends.length % pool.length) as number] as
                                        | "dino" | "kaia" | "penny" | "tato";
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

            {/* Ações inferiores */}
            {step !== 4 ? (
                <>
                    <Button
                        label={step === 3 ? "Registrar atividade" : "Próximo"}
                        fullWidth
                        onPress={() => {
                            if (step === 3) {
                                const distStr = (specificValues["Distância (km)"] ?? "").replace(",", ".");
                                const distanceKm = distStr ? parseFloat(distStr) : undefined;

                                addActivity({
                                    type: (activity ?? "outro") as any,
                                    dateISO: new Date(date).toISOString(),
                                    durationMin,
                                    distanceKm,
                                    intensity: (intensity ?? "medium") as any,
                                    mood: (mood ?? 3) as any,
                                    environment: (environment ?? "open") as any,
                                    notes: specificValues["Observações"],
                                });
                            }
                            goNext();
                        }}
                        disabled={
                            (step === 1 && !activity) ||
                            (step === 2 && (!activity || !intensity || !mood || !environment))
                        }
                    />
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
                        // Reset básicos
                        setIntensity(null);
                        setMood(null);
                        setEnvironment(null);
                        setSpecificValues({});
                        setDate(new Date());
                        setDurationMin(30);
                    }}
                />
            )}
        </Screen>
    );
}

/** --------------------------- helpers UI --------------------------- */

// Stepper responsivo
function Stepper({
    current,
    onJump,
}: {
    current: 1 | 2 | 3 | 4;
    onJump?: (s: 1 | 2 | 3) => void;
}) {
    const width = Dimensions.get("window").width;
    const isTiny = width < 340;

    const labelFor = (n: number) => (isTiny ? `0${n}` : `Passo 0${n}`);

    const Item = ({
        n,
        active,
        onPress,
    }: {
        n: 1 | 2 | 3;
        active: boolean;
        onPress?: () => void;
    }) => (
        <Pressable
            onPress={onPress}
            style={{
                paddingHorizontal: isTiny ? spacing.md : spacing.lg,
                paddingVertical: spacing.sm,
                borderRadius: 999,
                backgroundColor: active ? colors.black : "transparent",
                borderWidth: active ? 0 : 2,
                borderColor: colors.gray[400],
                marginRight: spacing.md,
                marginBottom: spacing.sm,
            }}
            accessibilityRole="button"
            accessibilityLabel={labelFor(n)}
            hitSlop={8}
        >
            <Text
                variant="subtitle"
                weight="bold"
                color={active ? colors.white : colors.black}
                style={{ fontSize: isTiny ? 14 : 16 }}
                numberOfLines={1}
            >
                {labelFor(n)}
            </Text>
        </Pressable>
    );

    return (
        <View
            style={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                marginBottom: spacing.md,
            }}
        >
            <Item n={1} active={current === 1} onPress={() => onJump?.(1)} />
            <Arrow />
            <Item n={2} active={current === 2} onPress={() => onJump?.(2)} />
            <Arrow />
            <Item n={3} active={current === 3} onPress={() => onJump?.(3)} />
        </View>
    );
}

function Arrow() {
    return (
        <Text variant="subtitle" color={colors.gray[600]} style={{ marginRight: spacing.md }}>
            →
        </Text>
    );
}

function OptionPill({
    label,
    icon,
    onPress,
}: {
    label: string;
    icon: string;
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
            </View>
        </Button>
    );
}

function SelectedActivityChip({
    activity,
    onChange,
}: {
    activity: ActivityKey;
    onChange: () => void;
}) {
    const meta = ACTIVITY_OPTIONS.find((a) => a.key === activity)!;
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                backgroundColor: colors.mascots.navajoWhite,
                borderRadius: radius.full,
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.md,
                alignSelf: "flex-start",
            }}
        >
            <Text variant="subtitle">{meta.icon}</Text>
            <Text variant="button" weight="bold">{meta.label}</Text>
            <Pressable
                onPress={onChange}
                style={{
                    marginLeft: spacing.xs,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: 999,
                    backgroundColor: colors.gray[200],
                }}
                accessibilityRole="button"
                accessibilityLabel="Trocar atividade"
            >
                <Text variant="button" color={colors.black}>trocar</Text>
            </Pressable>
        </View>
    );
}

const pressablePillStyle = {
    backgroundColor: colors.gray[200],
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
} as const;

function FieldLabel({ label }: { label: string }) {
    return (
        <Text variant="body" weight="bold" style={{ marginLeft: spacing.sm }}>
            {label}
        </Text>
    );
}

function SegmentedPills<T extends string>({
    options,
    selected,
    onSelect,
}: {
    options: Array<{ key: T; label: string }>;
    selected: T | null;
    onSelect: (k: T) => void;
}) {
    return (
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
            {options.map((opt) => {
                const active = selected === opt.key;
                return (
                    <Pressable
                        key={opt.key}
                        onPress={() => onSelect(opt.key)}
                        style={{
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            borderRadius: 999,
                            backgroundColor: active ? colors.black : colors.gray[200],
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={opt.label}
                    >
                        <Text variant="button" color={active ? colors.white : colors.black}>
                            {opt.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

function SegmentedBinary<T extends "open" | "closed">({
    left,
    right,
    selected,
    onSelect,
}: {
    left: { key: T; label: string };
    right: { key: T; label: string };
    selected: T | null;
    onSelect: (k: T) => void;
}) {
    return (
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
            {[left, right].map((opt) => {
                const active = selected === opt.key;
                return (
                    <Pressable
                        key={opt.key}
                        onPress={() => onSelect(opt.key)}
                        style={{
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            borderRadius: 999,
                            backgroundColor: active ? colors.black : colors.gray[200],
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={opt.label}
                    >
                        <Text variant="button" color={active ? colors.white : colors.black}>
                            {opt.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

function MoodPicker({
    value,
    onChange,
}: {
    value: Mood | null;
    onChange: (m: Mood) => void;
}) {
    return (
        <View style={{ flexDirection: "row", gap: spacing.md }}>
            {MOOD_OPTIONS.map((m) => {
                const active = value === m.value;
                return (
                    <Pressable
                        key={m.value}
                        onPress={() => onChange(m.value)}
                        style={{
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            borderRadius: 999,
                            backgroundColor: active ? colors.black : colors.gray[200],
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={m.label}
                    >
                        <Text variant="subtitle">{m.emoji}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
