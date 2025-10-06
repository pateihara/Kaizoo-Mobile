// app/onboarding/index.tsx
import { colors, radius, spacing } from "@/theme";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

type Slide = {
    key: string;
    title: string;
    description: string;
    image?: any;
};

const SLIDES: Slide[] = [
    {
        key: "kaizoo",
        title: "SEU KAIZOO",
        description:
            "Você irá criar e personalizar seu Kaizoo, que vai te acompanhar na sua jornada de exercícios físicos.",
        image: require("assets/images/TatoListingBack.png"),
    },
    {
        key: "desafios",
        title: "DESAFIOS DIÁRIOS",
        description:
            "Metodologia Kaizen: um pouquinho a cada dia para grandes conquistas!",
        image: require("assets/images/exemploDesafios.png"),
    },
    {
        key: "gamificacao",
        title: "GAMIFICAÇÃO LEVE",
        description:
            "Cada pequena conquista vira celebração. Evolua com diversão e sem pressão.",
        image: require("assets/images/xpStar.png"),
    },
    {
        key: "comunidade",
        title: "COMUNIDADE ACOLHEDORA",
        description:
            "Espaço seguro e motivador onde cada conquista é celebrada e cada passo é incentivado.",
        image: require("assets/images/allTogether.png"),
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const listRef = useRef<FlatList<Slide>>(null);
    const insets = useSafeAreaInsets();

    // splash de 2s
    const [showSplash, setShowSplash] = useState(true);
    useEffect(() => {
        const t = setTimeout(() => setShowSplash(false), 2000);
        return () => clearTimeout(t);
    }, []);

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
            <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
                <View style={styles.splashContainer}>
                    <Image
                        source={require("assets/images/allTogether.png")}
                        style={styles.splashImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.splashTitle}>
                        Mexa-se<Text style={{ color: "yellow" }}>.</Text>{"\n"}
                        Evolua<Text style={{ color: "yellow" }}>.</Text>{"\n"}
                        Divirta-se<Text style={{ color: "yellow" }}>!</Text>
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
            <FlatList
                ref={listRef}
                data={SLIDES}
                keyExtractor={(s) => s.key}
                renderItem={({ item, index: i }) => (
                    <SlideCard
                        slide={item}
                        isLast={i === SLIDES.length - 1}
                        onNext={next}
                        onSkip={skipOrFinish}
                    />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                onMomentumScrollEnd={onMomentumEnd}
            />

            {/* Dots acima dos botões, respeitando a barra do Android */}
            <View style={[styles.dots, { bottom: insets.bottom + 96 }]}>
                {SLIDES.map((_, i) => (
                    <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
                ))}
            </View>
        </SafeAreaView>
    );
}

function SlideCard({
    slide,
    isLast,
    onNext,
    onSkip,
}: {
    slide: Slide;
    isLast: boolean;
    onNext: () => void;
    onSkip: () => void;
}) {
    return (
        <View
            style={{
                width,
                height, // ocupa a altura toda para centralizar verticalmente
                paddingHorizontal: spacing.lg,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <View style={styles.card}>
                {/* IMAGEM */}
                {slide.image ? (
                    <Image source={slide.image} style={styles.cardImage} resizeMode="contain" />
                ) : (
                    <View
                        style={[
                            styles.cardImage,
                            { alignItems: "center", justifyContent: "center" },
                        ]}
                    >
                        <Text style={{ color: colors.gray[400] }}>(adicione a ilustração aqui)</Text>
                    </View>
                )}

                {/* TÍTULO */}
                <Text style={styles.cardTitle}>{slide.title}</Text>

                {/* DESCRIÇÃO */}
                <Text style={styles.cardDesc}>{slide.description}</Text>

                {/* CTA DENTRO DO SLIDE (viaja com o card) */}
                <View style={{ marginTop: spacing.xl, alignItems: "center" }}>
                    <Pressable
                        style={styles.cta}
                        onPress={isLast ? onSkip : onNext}
                        hitSlop={8}
                    >
                        <Text style={styles.ctaText}>
                            {isLast ? "criar minha conta" : "continuar"}
                        </Text>
                    </Pressable>

                    {!isLast && (
                        <Pressable onPress={onSkip} style={{ padding: spacing.md }} hitSlop={8}>
                            <Text style={{ color: colors.gray[500] }}>pular</Text>
                        </Pressable>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "black",
    },

    // Splash
    splashContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "black",
        paddingHorizontal: spacing.lg,
    },
    splashImage: {
        width: width * 0.6,
        height: undefined,
        aspectRatio: 1,
        marginBottom: spacing.lg,
        alignSelf: "center",
    },
    splashTitle: {
        textAlign: "center",
        color: "white",
        fontSize: 28,
        lineHeight: 34,
        fontWeight: "800",
    },

    // Card
    card: {
        backgroundColor: "white",
        borderRadius: radius.lg ?? 16,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
        width: "100%",
        maxWidth: 420,
        minHeight: 520,
        alignSelf: "center",
        // sombra leve
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
    cardImage: {
        width: "100%",
        height: 200,
        alignSelf: "center",
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

    // Dots
    dots: {
        position: "absolute",
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

    // CTA (usado dentro do card)
    cta: {
        width: "100%",
        height: 48,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "black",
    },
    ctaText: {
        color: "white",
        fontWeight: "800",
        fontSize: 16,
        textTransform: "lowercase",
    },
});
