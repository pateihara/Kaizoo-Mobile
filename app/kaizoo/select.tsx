//app/kaizoo/form.tsx
import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import { colors, radius, spacing } from "@/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    View
} from "react-native";

const { width } = Dimensions.get("window");

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

const MASCOTS: Mascot[] = [
    {
        key: "tato", title: "TATO", subtitle: "TARTARUGA FOCADA",
        // frontImage: require("@/assets/kaizoo/tato-front.png"),
        // backImage: require("@/assets/kaizoo/tato-badge.png"),
        personality: {
            favorite: "Caminhada ao ar livre e trilhas.",
            traits: [{ label: "Tranquilo", score: 4 }, { label: "Constante", score: 3 }, { label: "Comprometido", score: 5 }],
            goals: ["Manter saúde cardiovascular.", "Controlar o estresse do dia a dia."]
        }
    },
    {
        key: "dino", title: "DINO", subtitle: "O DINOSSAURINHO FORTE",
        // frontImage: require("@/assets/kaizoo/dino-front.png"),
        // backImage: require("@/assets/kaizoo/dino-badge.png"),
        personality: {
            favorite: "Treinos de força e circuitos.",
            traits: [{ label: "Disciplinado", score: 4 }, { label: "Explosivo", score: 5 }, { label: "Resiliente", score: 4 }],
            goals: ["Ganhar massa", "Aumentar potência"]
        }
    },
    {
        key: "koa", title: "KOA", subtitle: "A COALINHA PROTETORA",
        // frontImage: require("@/assets/kaizoo/koa-front.png"),
        // backImage: require("@/assets/kaizoo/koa-badge.png"),
        personality: {
            favorite: "Alongamentos e mobilidade.",
            traits: [{ label: "Cuidadosa", score: 5 }, { label: "Calma", score: 4 }, { label: "Constante", score: 3 }],
            goals: ["Reduzir tensões", "Cuidar das articulações"]
        }
    },
    {
        key: "kaia", title: "KAIA", subtitle: "A GATA ENERGÉTICA",
        // frontImage: require("@/assets/kaizoo/kaia-front.png"),
        // backImage: require("@/assets/kaizoo/kaia-badge.png"),
        personality: {
            favorite: "Corrida leve e danças.",
            traits: [{ label: "Animada", score: 5 }, { label: "Sociável", score: 4 }, { label: "Improviso", score: 3 }],
            goals: ["Se divertir", "Manter energia em alta"]
        }
    },
    {
        key: "penny", title: "PENNY", subtitle: "A PINGUIM SERENA",
        // frontImage: require("@/assets/kaizoo/penny-front.png"),
        // backImage: require("@/assets/kaizoo/penny-badge.png"),
        personality: {
            favorite: "Yoga e respiração guiada.",
            traits: [{ label: "Serena", score: 5 }, { label: "Atenta", score: 4 }, { label: "Gentil", score: 4 }],
            goals: ["Equilíbrio mente-corpo", "Dormir melhor"]
        }
    },
];

export default function SelectKaizoo() {
    const router = useRouter();
    const listRef = useRef<FlatList<Mascot>>(null);
    const [index, setIndex] = useState(0);

    // GUARD: se perfil já está pronto, pula essa tela
    useEffect(() => {
        (async () => {
            const pr = await AsyncStorage.getItem("profile:ready");
            if (pr === "1") router.replace("/(tabs)");
        })();
    }, []);

    // flip (frente/verso)
    const [isBack, setIsBack] = useState(false);
    const flip = useRef(new Animated.Value(0)).current;
    const frontRot = flip.interpolate({ inputRange: [0, 180], outputRange: ["0deg", "180deg"] });
    const backRot = flip.interpolate({ inputRange: [0, 180], outputRange: ["180deg", "360deg"] });
    const animateTo = (deg: number) =>
        Animated.timing(flip, { toValue: deg, duration: 450, easing: Easing.inOut(Easing.ease), useNativeDriver: true });

    const resetFlip = () => { setIsBack(false); flip.stopAnimation(); flip.setValue(0); };
    const toggleFlip = () => { if (isBack) animateTo(0).start(() => setIsBack(false)); else animateTo(180).start(() => setIsBack(true)); };

    // botões
    const goNext = () => {
        if (index < MASCOTS.length - 1) {
            resetFlip();
            listRef.current?.scrollToIndex({ index: index + 1, animated: true });
            setIndex((i) => i + 1);
        }
    };
    const goPrev = () => {
        if (index > 0) {
            resetFlip();
            listRef.current?.scrollToIndex({ index: index - 1, animated: true });
            setIndex((i) => i - 1);
        }
    };

    // arrasto do carrossel
    const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const i = Math.round(e.nativeEvent.contentOffset.x / width);
        if (i !== index) { setIndex(i); resetFlip(); }
    };

    const chooseThis = async () => {
        const sel = MASCOTS[index];
        await AsyncStorage.setItem("profile:mascot", sel.key);
        router.push({ pathname: "/kaizoo/form", params: { mascot: sel.key } });
    };

    return (
        <View style={styles.screen}>
            <Step title="1. Escolha seu Kaizoo" />

            <FlatList
                ref={listRef}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                data={MASCOTS}
                keyExtractor={(m) => m.key}
                onMomentumScrollEnd={onMomentumEnd}
                renderItem={({ item }) => (
                    <View style={{ width, paddingHorizontal: spacing.lg }}>
                        <View style={styles.card}>
                            <View style={styles.cardTitleBand}>
                                <Text weight="bold" style={{ color: "white", fontSize: 22, textAlign: "center" }}>{item.title}</Text>
                                <Text style={{ color: "white", opacity: 0.9, textAlign: "center" }}>{item.subtitle}</Text>
                            </View>

                            {/* Frente */}
                            <Animated.View style={[styles.face, { transform: [{ perspective: 1000 }, { rotateY: frontRot }] }]}>
                                {item.frontImage ? (
                                    <Image source={item.frontImage} style={styles.hero} resizeMode="cover" />
                                ) : (
                                    <View style={[styles.hero, styles.heroPlaceholder]}>
                                        <Text style={{ color: colors.gray[500] }}>(coloque a ilustração do {item.title} aqui)</Text>
                                    </View>
                                )}
                                <Button variant="secondary" label="ver personalidade" onPress={toggleFlip} fullWidth style={{ marginTop: spacing.md }} />
                            </Animated.View>

                            {/* Verso */}
                            <Animated.View style={[styles.face, styles.back, { transform: [{ perspective: 1000 }, { rotateY: backRot }] }]}>
                                {item.backImage ? (
                                    <Image source={item.backImage} style={styles.badge} resizeMode="contain" />
                                ) : (
                                    <View style={[styles.badge, styles.heroPlaceholder]}>
                                        <Text style={{ color: colors.gray[500] }}>(coloque o selo/persona do {item.title} aqui)</Text>
                                    </View>
                                )}

                                <Text weight="bold" style={styles.personaTitle}>{item.title}</Text>
                                <Text style={styles.personaSub}>{item.subtitle}</Text>

                                {item.personality && (
                                    <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
                                        <Text><Text weight="bold">ATIVIDADE FAVORITA</Text>{"\n"}{item.personality.favorite}</Text>
                                        <View>
                                            <Text weight="bold">PERSONALIDADE</Text>
                                            {item.personality.traits?.map((t) => (
                                                <View key={t.label} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 }}>
                                                    <Text>{t.label} →</Text>
                                                    <View style={{ flexDirection: "row", gap: 6 }}>
                                                        {new Array(5).fill(0).map((_, i) => (
                                                            <View key={i} style={{ width: 12, height: 12, borderRadius: 12, backgroundColor: i < t.score ? "#ff7aa8" : "#ffd8e6" }} />
                                                        ))}
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                        <View>
                                            <Text weight="bold">OBJETIVOS</Text>
                                            {item.personality.goals?.map((g, i) => (<Text key={i}>• {g}</Text>))}
                                        </View>
                                    </View>
                                )}

                                <Button variant="secondary" label="ver imagem" onPress={toggleFlip} fullWidth style={{ marginTop: spacing.md }} />
                            </Animated.View>
                        </View>
                    </View>
                )}
            />

            <View style={{ padding: spacing.lg, gap: spacing.sm }}>
                <Button label="quero este!" onPress={chooseThis} fullWidth />
                {index < MASCOTS.length - 1 && <Button variant="secondary" label="ver o próximo!" onPress={goNext} fullWidth />}
                {index > 0 && <Button variant="ghost" label="voltar" onPress={goPrev} fullWidth />}
            </View>
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

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "black" },
    stepPill: { alignSelf: "center", backgroundColor: "white", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 999 },
    card: { backgroundColor: "white", borderRadius: radius.lg ?? 16, overflow: "hidden", minHeight: 560 },
    cardTitleBand: { backgroundColor: "#222", paddingVertical: 12, paddingHorizontal: spacing.md },
    face: { backfaceVisibility: "hidden", padding: spacing.lg },
    back: { position: "absolute", top: 44, left: 0, right: 0, bottom: 0, padding: spacing.lg },
    hero: { height: 420, borderRadius: radius.md ?? 12 },
    badge: { alignSelf: "center", width: 120, height: 120, marginBottom: spacing.md },
    heroPlaceholder: { backgroundColor: colors.gray?.[200] ?? "#eee", alignItems: "center", justifyContent: "center" },
    personaTitle: { textAlign: "center", fontSize: 18, fontWeight: "800", marginTop: 4 },
    personaSub: { textAlign: "center", opacity: 0.8, marginBottom: spacing.sm },
});
