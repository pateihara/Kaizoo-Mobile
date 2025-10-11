// app/kaizoo/select.tsx
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { radius, spacing } from "@/theme";

// assets
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

const ACCENT: Record<MascotKey, string> = {
    tato: "#F37997",
    dino: "#FFB24A",
    koa: "#3AB8A9",
    kaia: "#7C8BFF",
    penny: "#7E7AF5",
};

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

const NEXT_ROUTE = "/kaizoo/form";

// (opcional) micro ajustes por-mascote para PNGs com padding interno
const OFFSETS: Partial<Record<MascotKey, { x?: number; y?: number }>> = {
    dino: { y: -6 },
    kaia: { y: -4 },
    // adicione outros se precisar
};

export default function KaizooSelect() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width: winW, height: winH } = useWindowDimensions();

    // cards menores e responsivos
    const cardWidth = Math.max(300, Math.min(380, Math.floor(winW * 0.88)));
    const cardHeight = Math.max(360, Math.min(500, Math.floor(winH * 0.60)));
    const pageWidth = winW;

    const { refreshProfile, replaceUser } = useAuth() as {
        refreshProfile?: () => Promise<void>;
        replaceUser?: (u: any) => void;
    };

    const listRef = useRef<FlatList<Mascot>>(null);
    const [index, setIndex] = useState(0);
    const [saving, setSaving] = useState(false);

    const onScroll = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            const x = e.nativeEvent.contentOffset.x;
            const i = Math.round(x / Math.max(1, pageWidth));
            if (i !== index) setIndex(i);
        },
        [index, pageWidth]
    );

    const goNext = () => {
        const next = (index + 1) % MASCOTS.length;
        listRef.current?.scrollToOffset({ offset: next * pageWidth, animated: true });
        setIndex(next);
    };

    const accent = (k: MascotKey) => ACCENT[k];

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
                        renderItem={({ item, index: i }) => (
                            <View style={{ width: pageWidth, alignItems: "center" }}>
                                <FlipCard
                                    key={item.key}
                                    active={i === index}
                                    width={cardWidth}
                                    height={cardHeight}
                                    insetsBottom={insets.bottom}
                                    item={item}
                                    accent={accent(item.key)}
                                />
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

function FlipCard({
    active,
    width,
    height,
    insetsBottom,
    item,
    accent,
}: {
    active: boolean;
    width: number;
    height: number;
    insetsBottom: number;
    item: Mascot;
    accent: string;
}) {
    const flip = useRef(new Animated.Value(0)).current;
    const [isBack, setIsBack] = useState(false);

    useEffect(() => {
        // quando sair do foco, garante frente
        if (!active) {
            flip.stopAnimation();
            flip.setValue(0);
            setIsBack(false);
        }
    }, [active, flip]);

    const frontRot = flip.interpolate({ inputRange: [0, 180], outputRange: ["0deg", "180deg"] });
    const backRot = flip.interpolate({ inputRange: [0, 180], outputRange: ["180deg", "360deg"] });

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
            duration: 420,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        });

    const toggleFlip = () => {
        if (!active) return; // só vira se for o card ativo
        if (isBack) animateTo(0).start(() => setIsBack(false));
        else animateTo(180).start(() => setIsBack(true));
    };

    // micro offset por-mascote (opcional)
    const off = OFFSETS[item.key] ?? {};

    return (
        <View
            style={[
                styles.card,
                { width, height },
                Platform.OS === "web" ? ({ willChange: "transform" } as any) : null,
            ]}
        >
            {/* Frente */}
            <Animated.View
                style={[
                    styles.faceFront,
                    { transform: [{ perspective: 1000 }, { rotateY: frontRot }], opacity: frontOpacity },
                ]}
                pointerEvents={isBack ? "none" : "auto"}
            >
                {/* imagem 100% centralizada */}
                <Image
                    source={item.frontImage}
                    resizeMode="cover"
                    style={[
                        StyleSheet.absoluteFillObject,
                        Platform.OS === "web"
                            ? ({ objectFit: "cover", objectPosition: "center" } as any)
                            : null,
                        (off.x || off.y) ? { transform: [{ translateX: off.x ?? 0 }, { translateY: off.y ?? 0 }] } : null,
                    ]}
                />

                {/* faixa de título absoluta (não empurra a imagem) */}
                <View style={styles.cardTitleBandAbs}>
                    <Text weight="bold" style={styles.cardTitle}>
                        {item.title}
                    </Text>
                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>

                {/* botão fixo no rodapé */}
                <View
                    style={[
                        styles.overlayBtn,
                        { bottom: insetsBottom + spacing.md, left: spacing.lg, right: spacing.lg },
                    ]}
                >
                    <Button variant="primary" label="Ver personalidade" onPress={toggleFlip} fullWidth />
                </View>
            </Animated.View>

            {/* Verso */}
            <Animated.View
                style={[
                    styles.faceBack,
                    {
                        transform: [{ perspective: 1000 }, { rotateY: backRot }],
                        opacity: backOpacity,
                        paddingBottom: insetsBottom + spacing.md + 56, // espaço para o botão fixo
                    },
                ]}
                pointerEvents={isBack ? "auto" : "none"}
            >
                {!!item.backImage && (
                    <Image
                        source={item.backImage}
                        style={[styles.badge, { marginTop: spacing.sm }]}
                        resizeMode="contain"
                    />
                )}

                {/* conteúdo */}
                <View style={{ rowGap: spacing.md }}>
                    {!!item.personality?.favorite && (
                        <View>
                            <Text weight="bold" style={styles.sectionTitle}>ATIVIDADE FAVORITA</Text>
                            <Text style={styles.sectionBody}>{item.personality.favorite}</Text>
                        </View>
                    )}

                    {!!item.personality?.traits?.length && (
                        <View>
                            <Text weight="bold" style={styles.sectionTitle}>PERSONALIDADE</Text>
                            <View style={{ rowGap: 10 }}>
                                {item.personality.traits!.map((t, i) => (
                                    <View key={i} style={styles.traitRow}>
                                        <Text style={styles.traitLabel}>{t.label} →</Text>
                                        <ScoreDots score={t.score} color={accent} />
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {!!item.personality?.goals?.length && (
                        <View>
                            <Text weight="bold" style={styles.sectionTitle}>OBJETIVOS</Text>
                            <View style={{ rowGap: 8 }}>
                                {item.personality.goals!.map((g, i) => (
                                    <View key={i} style={styles.goalRow}>
                                        <View style={[styles.goalCheck, { borderColor: accent }]}>
                                            <Text style={[styles.goalCheckMark, { color: accent }]}>✓</Text>
                                        </View>
                                        <Text style={styles.sectionBody}>{g}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* botão fixo no rodapé do verso */}
                <View
                    style={[
                        styles.overlayBtn,
                        { bottom: insetsBottom + spacing.md, left: spacing.lg, right: spacing.lg },
                    ]}
                >
                    <Button variant="secondary" label="ver imagem" onPress={toggleFlip} fullWidth />
                </View>
            </Animated.View>
        </View>
    );
}

function Step({ title }: { title: string }) {
    return (
        <View style={{ padding: spacing.lg, paddingTop: spacing.xl }}>
            <View style={styles.stepPill}>
                <Text weight="bold" style={{ textAlign: "center" }}>{title}</Text>
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
                return <View key={i} style={[styles.dot, { opacity: filled ? 1 : 0.2, backgroundColor: color }]} />;
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
        marginHorizontal: spacing.lg,
        position: "relative",
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg, // topo menor → conteúdo sobe, botão aparece
        zIndex: 3,
        justifyContent: "flex-start",
    },

    cardTitleBandAbs: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#222",
        paddingVertical: 10,
        paddingHorizontal: spacing.md,
    },
    cardTitle: { color: "white", fontSize: 20, textAlign: "center" },
    cardSubtitle: { color: "white", opacity: 0.9, textAlign: "center" },

    overlayBtn: { position: "absolute" },

    badge: { alignSelf: "center", width: 120, height: 120, marginBottom: spacing.sm },

    sectionTitle: { fontSize: 15, marginBottom: 6 },
    sectionBody: { fontSize: 15 },

    traitRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    traitLabel: { fontSize: 15 },

    goalRow: { flexDirection: "row", alignItems: "center", columnGap: 10 },
    goalCheck: {
        width: 20,
        height: 20,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    goalCheckMark: { fontSize: 12, fontWeight: "700" },

    dot: { width: 14, height: 14, borderRadius: 999 },
});
