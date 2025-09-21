// app/onboarding/index.tsx

import { colors, radius, spacing } from "@/theme";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

type Slide = {
    key: string;
    title: string;
    description: string;
    // troque pelo seu require/import
    image?: any;
};

const SLIDES: Slide[] = [
    {
        key: "kaizoo",
        title: "SEU KAIZOO",
        description:
            "Você irá criar e personalizar seu Kaizoo, que vai te acompanhar na sua jornada de exercícios físicos.",
        // image: require("@/assets/onboarding/kaizoo.png"),
    },
    {
        key: "desafios",
        title: "DESAFIOS DIÁRIOS",
        description:
            "Metodologia Kaizen: um pouquinho a cada dia para grandes conquistas!",
        // image: require("@/assets/onboarding/checklist.png"),
    },
    {
        key: "gamificacao",
        title: "GAMIFICAÇÃO LEVE",
        description:
            "Cada pequena conquista vira celebração. Evolua com diversão e sem pressão.",
        // image: require("@/assets/onboarding/xp.png"),
    },
    {
        key: "comunidade",
        title: "COMUNIDADE ACOLHEDORA",
        description:
            "Espaço seguro e motivador onde cada conquista é celebrada e cada passo é incentivado.",
        // image: require("@/assets/onboarding/community.png"),
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const listRef = useRef<FlatList<Slide>>(null);

    // controla “splash de 2s” antes dos cards
    const [showSplash, setShowSplash] = useState(true);
    useEffect(() => {
        const t = setTimeout(() => setShowSplash(false), 2000);
        return () => clearTimeout(t);
    }, []);

    // índice do carrossel
    const [index, setIndex] = useState(0);

    const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const i = Math.round(e.nativeEvent.contentOffset.x / width);
        setIndex(i);
    };

    const next = () => {
        if (index < SLIDES.length - 1) {
            listRef.current?.scrollToIndex({ index: index + 1, animated: true });
            setIndex((i) => i + 1);
        }
    };

    const skipOrFinish = async () => {
        router.replace("/(auth)/register");
    };
    if (showSplash) {
        return (
            <View style={[styles.screen, { justifyContent: "center", alignItems: "center", backgroundColor: "black" }]}>
                {/* Troque por sua arte de abertura */}
                {/* <Image source={require("@/assets/onboarding/mascots.png")} style={{ width: 260, height: 260, marginBottom: spacing.lg }} /> */}
                <Text style={styles.splashTitle}>Mexa-se.{"\n"}Evolua.{"\n"}Divirta-se!</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <FlatList
                ref={listRef}
                data={SLIDES}
                keyExtractor={(s) => s.key}
                renderItem={({ item }) => <SlideCard slide={item} />}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                onMomentumScrollEnd={onMomentumEnd}
            />

            {/* dots */}
            <View style={styles.dots}>
                {SLIDES.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i === index && styles.dotActive,
                        ]}
                    />
                ))}
            </View>

            {/* CTA inferior */}
            <View style={styles.ctaWrapper}>
                <Pressable style={styles.cta} onPress={index === SLIDES.length - 1 ? skipOrFinish : next}>
                    <Text style={styles.ctaText}>
                        {index === SLIDES.length - 1 ? "criar minha conta" : "continuar"}
                    </Text>
                </Pressable>

                {/* botão pular opcional */}
                {index < SLIDES.length - 1 && (
                    <Pressable onPress={skipOrFinish} style={{ padding: spacing.md }}>
                        <Text style={{ color: colors.gray[500] }}>pular</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
}

function SlideCard({ slide }: { slide: Slide }) {
    return (
        <View style={{ width, paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>
            <View style={styles.card}>
                {/* IMAGEM */}
                {slide.image ? (
                    <Image source={slide.image} style={styles.cardImage} resizeMode="contain" />
                ) : (
                    <View style={[styles.cardImage, { alignItems: "center", justifyContent: "center" }]}>
                        <Text style={{ color: colors.gray[400] }}>(adicione a ilustração aqui)</Text>
                    </View>
                )}

                {/* TÍTULO */}
                <Text style={styles.cardTitle}>{slide.title}</Text>

                {/* DESCRIÇÃO */}
                <Text style={styles.cardDesc}>{slide.description}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "black",
    },
    splashTitle: {
        textAlign: "center",
        color: "white",
        fontSize: 28,
        lineHeight: 34,
        fontWeight: "800",
    },

    card: {
        backgroundColor: "white",
        borderRadius: radius.lg ?? 16,
        padding: spacing.lg,
        paddingTop: spacing.xl,
        minHeight: 520,
        // sombra leve
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
    cardImage: {
        height: 180,
        marginBottom: spacing.lg,
    },
    cardTitle: {
        textAlign: "center",
        fontWeight: "800",
        fontSize: 18,
        marginBottom: spacing.sm,
        color: colors.gray?.[900] ?? "#111",
        letterSpacing: 0.2,
    },
    cardDesc: {
        textAlign: "center",
        fontSize: 14,
        lineHeight: 20,
        color: colors.gray?.[600] ?? "#555",
    },

    dots: {
        position: "absolute",
        bottom: 112,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 6,
        backgroundColor: "rgba(255,255,255,0.3)",
    },
    dotActive: {
        backgroundColor: "white",
        width: 16,
    },

    ctaWrapper: {
        position: "absolute",
        left: spacing.lg,
        right: spacing.lg,
        bottom: spacing.lg,
        alignItems: "center",
        gap: spacing.xs,
    },
    cta: {
        width: "100%",
        height: 48,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
    },
    ctaText: {
        color: "black",
        fontWeight: "800",
        fontSize: 16,
        textTransform: "lowercase",
    },
});
