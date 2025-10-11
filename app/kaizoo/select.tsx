// app/kaizoo/select.tsx
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Easing,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import { useAuth } from "@/contexts/AuthContext";
import { finishOnboarding } from "@/services/profile";
import { colors, radius, spacing } from "@/theme";

// ⚠️ IMPORTS RELATIVOS PARA WEB/VERCEL
import frontdino from "../../assets/images/card-dino.png";
import frontkaia from "../../assets/images/card-kaia.png";
import frontkoa from "../../assets/images/card-koa.png";
import frontpenny from "../../assets/images/card-penny.png";
import fronttato from "../../assets/images/card-tato.png";

import backdino from "../../assets/images/StarDino.png";
import backkaia from "../../assets/images/StarKaia.png";
import backkoa from "../../assets/images/StarKoa.png";
import backpenny from "../../assets/images/StarPenny.png";
import backtato from "../../assets/images/StarTato.png";

type MascotKey = "tato" | "dino" | "koa" | "kaia" | "penny";
type Mascot = {
    key: MascotKey;
    title: string;
    subtitle: string;
    frontImage?: any;
    backImage?: any;
    personality?: {
        favorite?: string;
        traits?: Array<{ label: string; score: number }>;
        goals?: string[];
    };
};

// cores
const ACCENT: Record<MascotKey, string> = {
    tato: "#F37997",
    dino: "#FFB24A",
    koa: "#3AB8A9",
    kaia: "#7C8BFF",
    penny: "#7E7AF5",
};

// catálogo
const MASCOTS: Mascot[] = [
    {
        key: "tato",
        title: "TATO",
        subtitle: "TARTARUGA FOCADA",
        frontImage: fronttato,
        backImage: backtato,
        personality: {
            favorite: "Caminhada ao ar livre e trilhas.",
            traits: [
                { label: "Tranquilo", score: 4 },
                { label: "Constante", score: 3 },
                { label: "Comprometido", score: 4 },
            ],
            goals: ["Manter saúde cardiovascular.", "Controlar o estresse do dia a dia."],
        },
    },
    {
        key: "dino",
        title: "DINO",
        subtitle: "O DINOSSAURINHO FORTE",
        frontImage: frontdino,
        backImage: backdino,
        personality: {
            favorite: "Treinamento de força.",
            traits: [
                { label: "Determinado", score: 4 },
                { label: "Extrovertido", score: 4 },
                { label: "Competitivo", score: 5 },
            ],
            goals: ["Ganhar força.", "Melhorar a composição corporal."],
        },
    },
    {
        key: "koa",
        title: "KOA",
        subtitle: "A COALINHA PROTETORA",
        frontImage: frontkoa,
        backImage: backkoa,
        personality: {
            favorite: "Exercícios curtos e adaptados para mães.",
            traits: [
                { label: "Acolhedora", score: 4 },
                { label: "Resiliente", score: 5 },
                { label: "Protetora", score: 4 },
            ],
            goals: ["Retomar a forma física.", "Equilibrar autocuidado e maternidade."],
        },
    },
    {
        key: "kaia",
        title: "KAIA",
        subtitle: "A GATA ENERGÉTICA",
        frontImage: frontkaia,
        backImage: backkaia,
        personality: {
            favorite: "Corridas e treinos aeróbicos.",
            traits: [
                { label: "Animada", score: 3 },
                { label: "Otimista", score: 5 },
                { label: "Ativa", score: 5 },
            ],
            goals: [
                "Melhorar o condicionamento físico.",
                "Aliviar o estresse do trabalho com atividades prazerosas.",
            ],
        },
    },
    {
        key: "penny",
        title: "PENNY",
        subtitle: "A PINGUIM SERENA",
        frontImage: frontpenny,
        backImage: backpenny,
        personality: {
            favorite: "Yoga, meditação e alongamento.",
            traits: [
                { label: "Tranquila", score: 3 },
                { label: "Introspectiva", score: 5 },
                { label: "Emocional", score: 4 },
            ],
            goals: ["Reduzir estresse.", "Melhorar flexibilidade e bem-estar emocional."],
        },
    },
];

// 👉 rota após escolher
const NEXT_ROUTE = "/kaizoo/form";

export default function KaizooSelect() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: winW, height: winH } = useWindowDimensions();

    // responsivo: limita largura/altura do card
    const cardWidth = Math.min(420, Math.max(320, Math.floor(winW * 0.86)));
    const cardHeight = Math.max(420, Math.min(560, Math.floor(winH * 0.7)));

    const pageWidth = winW; // para snap/scroll

    const { refreshProfile, replaceUser } = useAuth() as {
        refreshProfile?: () => Promise<void>;
        replaceUser?: (u: any) => void;
    };

    const listRef = useRef<FlatList<Mascot>>(null);
    const [index, setIndex] = useState(0);
    const [saving, setSaving] = useState(false);

    // flip
    const [isBack, setIsBack] = useState(false);
    const flip = useRef(new Animated.Value(0)).current;

    const frontRot = flip.interpolate({
        inputRange: [0, 180],
        outputRange: ["0deg", "180deg"],
    });
    const backRot = flip.interpolate({
        inputRange: [0, 180],
        outputRange: ["180deg", "360deg"],
    });

    // 👇 extra: controla visibilidade para Web (quando backfaceVisibility não segura)
    const frontOpacity = flip.interpolate({
        inputRange: [0, 90, 180],
        outputRange: [1, 0, 0],
        extrapolate: "clamp",
    });
    const backOpacity = flip.interpolate({
        inputRange: [0, 90, 180],
        outputRange: [0, 0, 1],
        extrapolate: "clamp",
    });

    const animateTo = (deg: number) =>
        Animated.timing(flip, {
            toValue: deg,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        });

    const resetFlip = () => {
        setIsBack(false);
        flip.stopAnimation();
        flip.setValue(0);
    };

    const toggleFlip = () => {
        if (isBack) animateTo(0).start(() => setIsBack(false));
        else animateTo(180).start(() => setIsBack(true));
    };

    const goNext = () => {
        const next = (index + 1) % MASCOTS.length;
        resetFlip();
        // usar scrollToOffset para web ser mais sólido
        listRef.current?.scrollToOffset({ offset: next * pageWidth, animated: true });
        setIndex(next);
    };

    const onScroll = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            const x = e.nativeEvent.contentOffset.x;
            const i = Math.round(x / Math.max(1, pageWidth));
            if (i !== index) {
                setIndex(i);
                resetFlip();
            }
        },
        [index, pageWidth]
    );

    const chooseThis = async () => {
        if (saving) return;
        setSaving(true);
        const sel = MASCOTS[index];

        try {
            const updatedProfile = await finishOnboarding(sel.key as MascotKey);
            if (updatedProfile && typeof replaceUser === "function") {
                replaceUser(updatedProfile as any);
            } else if (typeof refreshProfile === "function") {
                await refreshProfile();
            }
            router.replace(NEXT_ROUTE);
        } catch (e: any) {
            const msg = e?.data?.error ?? e?.message ?? "Falha ao concluir onboarding";
            Alert.alert("Não foi possível salvar seu Kaizoo", String(msg));
        } finally {
            setSaving(false);
        }
    };

    const accent = (k: MascotKey) => ACCENT[k];

    return (
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
            <View style={styles.container}>
                <Step title="1. Escolha seu Kaizoo" />

                <View style={{ flex: 1 }}>
                    <FlatList
                        ref={listRef}
                        data={MASCOTS}
                        keyExtractor={(m) => m.key}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        // Mobile: paging; Web: snap
                        pagingEnabled={Platform.OS !== "web"}
                        snapToInterval={Platform.OS === "web" ? pageWidth : undefined}
                        snapToAlignment={Platform.OS === "web" ? "start" : undefined}
                        disableIntervalMomentum={Platform.OS === "web"}
                        decelerationRate={Platform.OS === "web" ? "fast" : "normal"}
                        bounces={false}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                        style={{ flex: 1 }}
                        contentContainerStyle={{ paddingVertical: spacing.lg }}
                        renderItem={({ item }) => (
                            <View style={{ width: pageWidth, alignItems: "center" }}>
                                <View
                                    style={[
                                        styles.card,
                                        {
                                            width: cardWidth,
                                            height: cardHeight,
                                        },
                                    ]}
                                >
                                    {/* Frente */}
                                    <Animated.View
                                        style={[
                                            styles.faceFront,
                                            {
                                                transform: [{ perspective: 1000 }, { rotateY: frontRot }],
                                                opacity: frontOpacity,
                                                // RN Web dicas de performance:
                                                ...(Platform.OS === "web" ? ({ willChange: "transform" } as any) : null),
                                            },
                                        ]}
                                        accessibilityLabel={`Imagem do mascote ${item.title}`}
                                        pointerEvents={isBack ? "none" : "auto"}
                                    >
                                        {item.frontImage ? (
                                            <Image
                                                source={item.frontImage}
                                                style={StyleSheet.absoluteFillObject}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View style={[StyleSheet.absoluteFillObject, styles.heroPlaceholder]} />
                                        )}

                                        <View style={styles.cardTitleBand}>
                                            <Text weight="bold" style={styles.cardTitle}>
                                                {item.title}
                                            </Text>
                                            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                                        </View>

                                        <View
                                            style={[
                                                styles.overlayBtn,
                                                { bottom: insets.bottom + spacing.lg, width: cardWidth - spacing.lg * 2 },
                                            ]}
                                        >
                                            <Button
                                                variant="primary"
                                                label="Ver personalidade"
                                                onPress={toggleFlip}
                                                fullWidth
                                            />
                                        </View>
                                    </Animated.View>

                                    {/* Verso */}
                                    <Animated.View
                                        style={[
                                            styles.faceBack,
                                            {
                                                transform: [{ perspective: 1000 }, { rotateY: backRot }],
                                                opacity: backOpacity,
                                                paddingBottom: insets.bottom + spacing.md,
                                                ...(Platform.OS === "web" ? ({ willChange: "transform" } as any) : null),
                                            },
                                        ]}
                                        pointerEvents={isBack ? "auto" : "none"}
                                    >
                                        {!!item.backImage && (
                                            <Image
                                                source={item.backImage}
                                                style={styles.badge}
                                                resizeMode="contain"
                                                accessible={false}
                                            />
                                        )}

                                        <View style={{ rowGap: spacing.md, flexGrow: 1 }}>
                                            {!!item.personality?.favorite && (
                                                <View>
                                                    <Text weight="bold" style={styles.sectionTitle}>
                                                        ATIVIDADE FAVORITA
                                                    </Text>
                                                    <Text style={styles.sectionBody}>{item.personality.favorite}</Text>
                                                </View>
                                            )}

                                            {!!item.personality?.traits?.length && (
                                                <View>
                                                    <Text weight="bold" style={styles.sectionTitle}>
                                                        PERSONALIDADE
                                                    </Text>
                                                    <View style={{ rowGap: 10 }}>
                                                        {item.personality.traits!.map((t, i) => (
                                                            <View key={i} style={styles.traitRow}>
                                                                <Text style={styles.traitLabel}>{t.label} →</Text>
                                                                <ScoreDots score={t.score} color={accent(item.key)} />
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            )}

                                            {!!item.personality?.goals?.length && (
                                                <View>
                                                    <Text weight="bold" style={styles.sectionTitle}>
                                                        OBJETIVOS
                                                    </Text>
                                                    <View style={{ rowGap: 8 }}>
                                                        {item.personality.goals!.map((g, i) => (
                                                            <View key={i} style={styles.goalRow}>
                                                                <View
                                                                    style={[
                                                                        styles.goalCheck,
                                                                        { borderColor: accent(item.key) },
                                                                    ]}
                                                                >
                                                                    <Text
                                                                        style={[
                                                                            styles.goalCheckMark,
                                                                            { color: accent(item.key) },
                                                                        ]}
                                                                    >
                                                                        ✓
                                                                    </Text>
                                                                </View>
                                                                <Text style={styles.sectionBody}>{g}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            )}
                                        </View>

                                        <Button
                                            variant="secondary"
                                            label="ver imagem"
                                            onPress={toggleFlip}
                                            fullWidth
                                            style={{ marginTop: spacing.md }}
                                        />
                                    </Animated.View>
                                </View>
                            </View>
                        )}
                    />
                </View>

                <View style={styles.actions}>
                    <Button
                        variant="onboardingFilled"
                        label="Quero este!"
                        onPress={chooseThis}
                        fullWidth
                        loading={saving}
                        disabled={saving}
                    />
                    <Button
                        variant="onboardingOutline"
                        label="ver o próximo!"
                        onPress={goNext}
                        fullWidth
                        disabled={saving}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

function Step({ title }: { title: string }) {
    return (
        <View style={{ padding: spacing.lg, paddingTop: spacing.xl }}>
            <View style={styles.stepPill}>
                <Text weight="bold" style={{ textAlign: "center" }}>
                    {title}
                </Text>
            </View>
        </View>
    );
}

function ScoreDots({ score = 0, color = "#888" }: { score?: number; color?: string }) {
    const total = 5;
    return (
        <View style={{ flexDirection: "row", columnGap: 8 }}>
            {Array.from({ length: total }).map((_, i) => {
                const filled = i < score;
                return (
                    <View
                        key={i}
                        style={[styles.dot, { opacity: filled ? 1 : 0.2, backgroundColor: color }]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "black" },
    container: { flex: 1, backgroundColor: "black" },

    stepPill: {
        alignSelf: "center",
        backgroundColor: "white",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 999,
    },

    actions: { padding: spacing.lg, gap: spacing.sm },

    card: {
        backgroundColor: "white",
        borderRadius: radius?.lg ?? 16,
        overflow: "hidden",
        // centraliza e dá respiro nas telas largas
        marginHorizontal: spacing.lg,
        position: "relative",
        // dica rnw: stacking context estável
        ...(Platform.OS === "web" ? ({ willChange: "transform" } as any) : null),
    },

    faceFront: {
        ...StyleSheet.absoluteFillObject,
        backfaceVisibility: "hidden",
        zIndex: 2,
    },
    faceBack: {
        ...StyleSheet.absoluteFillObject,
        backfaceVisibility: "hidden",
        backgroundColor: "white",
        padding: spacing.lg,
        paddingTop: 60,
        zIndex: 3,
        justifyContent: "flex-start",
    },

    cardTitleBand: {
        backgroundColor: "#222",
        paddingVertical: 12,
        paddingHorizontal: spacing.md,
    },
    cardTitle: { color: "white", fontSize: 22, textAlign: "center" },
    cardSubtitle: { color: "white", opacity: 0.9, textAlign: "center" },

    heroPlaceholder: { backgroundColor: colors?.gray?.[200] ?? "#eee" },

    overlayBtn: {
        position: "absolute",
        left: spacing.lg,
        right: spacing.lg,
    },

    badge: { alignSelf: "center", width: 140, height: 140, marginBottom: spacing.md },
    sectionTitle: { fontSize: 16, marginBottom: 6 },
    sectionBody: { fontSize: 16 },

    traitRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    traitLabel: { fontSize: 16 },

    goalRow: { flexDirection: "row", alignItems: "center", columnGap: 10 },
    goalCheck: {
        width: 22,
        height: 22,
        borderRadius: 22,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    goalCheckMark: { fontSize: 14, fontWeight: "700" },

    dot: { width: 16, height: 16, borderRadius: 999 },
});
