// app/kaizoo/select.tsx
import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import { useAuth } from "@/contexts/AuthContext";
import { finishOnboarding } from "@/services/profile";
import { colors, radius, spacing } from "@/theme";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    { key: "tato", title: "TATO", subtitle: "TARTARUGA FOCADA" },
    { key: "dino", title: "DINO", subtitle: "O DINOSSAURINHO FORTE" },
    { key: "koa", title: "KOA", subtitle: "A COALINHA PROTETORA" },
    { key: "kaia", title: "KAIA", subtitle: "A GATA ENERGÉTICA" },
    { key: "penny", title: "PENNY", subtitle: "A PINGUIM SERENA" },
];

export default function SelectKaizoo() {
    const router = useRouter();
    const { refreshProfile, replaceUser } = useAuth();
    const listRef = useRef<FlatList<Mascot>>(null);
    const [index, setIndex] = useState(0);
    const [saving, setSaving] = useState(false);

    // flip (frente/verso)
    const [isBack, setIsBack] = useState(false);
    const flip = useRef(new Animated.Value(0)).current;
    const frontRot = flip.interpolate({ inputRange: [0, 180], outputRange: ["0deg", "180deg"] });
    const backRot = flip.interpolate({ inputRange: [0, 180], outputRange: ["180deg", "360deg"] });
    const animateTo = (deg: number) =>
        Animated.timing(flip, { toValue: deg, duration: 450, easing: Easing.inOut(Easing.ease), useNativeDriver: true });

    const resetFlip = () => { setIsBack(false); flip.stopAnimation(); flip.setValue(0); };
    const toggleFlip = () => { if (isBack) animateTo(0).start(() => setIsBack(false)); else animateTo(180).start(() => setIsBack(true)); };

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

    const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const i = Math.round(e.nativeEvent.contentOffset.x / width);
        if (i !== index) { setIndex(i); resetFlip(); }
    };

    const chooseThis = async () => {
        if (saving) return;
        setSaving(true);
        const sel = MASCOTS[index];

        // 1) Salva Kaizoo — se falhar, mostra alerta e não navega
        let updatedUser: any;
        try {
            updatedUser = await finishOnboarding(sel.key);
        } catch (e: any) {
            const msg = e?.data?.error ?? e?.message ?? "Falha ao concluir onboarding";
            Alert.alert("Não foi possível salvar seu Kaizoo", String(msg));
            setSaving(false);
            return;
        }

        // 2) Se a API devolveu user, usa direto; senão tenta /me (best-effort)
        if (updatedUser) {
            replaceUser(updatedUser);
        } else {
            await refreshProfile(); // não lança erro
        }

        // 3) Vai pras tabs
        router.replace("/(tabs)");
        setSaving(false);
    };

    return (
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
            <View style={styles.container}>
                <Step title="1. Escolha seu Kaizoo" />

                {/* Área dos cards ocupa o restante da tela */}
                <View style={{ flex: 1 }}>
                    <FlatList
                        ref={listRef}
                        horizontal
                        pagingEnabled
                        bounces={false}
                        showsHorizontalScrollIndicator={false}
                        data={MASCOTS}
                        keyExtractor={(m) => m.key}
                        onMomentumScrollEnd={onMomentumEnd}
                        style={{ flex: 1 }}
                        contentContainerStyle={{ paddingVertical: spacing.lg }}
                        renderItem={({ item }) => (
                            <View style={{ width }}>
                                <View style={styles.card}>
                                    <View style={styles.cardTitleBand}>
                                        <Text weight="bold" style={{ color: "white", fontSize: 22, textAlign: "center" }}>
                                            {item.title}
                                        </Text>
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
                                        <Button
                                            variant="secondary"
                                            label="ver personalidade"
                                            onPress={toggleFlip}
                                            fullWidth
                                            style={{ marginTop: spacing.md }}
                                        />
                                    </Animated.View>

                                    {/* Verso */}
                                    <Animated.View style={[styles.face, styles.back, { transform: [{ perspective: 1000 }, { rotateY: backRot }] }]}>
                                        {/* Coloque sua arte/detalhes do verso aqui */}
                                        <Button variant="secondary" label="ver imagem" onPress={toggleFlip} fullWidth style={{ marginTop: spacing.md }} />
                                    </Animated.View>
                                </View>
                            </View>
                        )}
                    />
                </View>

                {/* Ações fixas no rodapé, fora do FlatList */}
                <View style={styles.actions}>
                    <Button label="quero este!" onPress={chooseThis} fullWidth loading={saving} disabled={saving} />
                    {index < MASCOTS.length - 1 && (
                        <Button variant="secondary" label="ver o próximo!" onPress={goNext} fullWidth disabled={saving} />
                    )}
                    {index > 0 && <Button variant="ghost" label="voltar" onPress={goPrev} fullWidth disabled={saving} />}
                </View>
            </View>
        </SafeAreaView>
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
        borderRadius: radius.lg ?? 16,
        overflow: "hidden",
        minHeight: 560,
        marginHorizontal: spacing.lg,
    },
    cardTitleBand: { backgroundColor: "#222", paddingVertical: 12, paddingHorizontal: spacing.md },
    face: { backfaceVisibility: "hidden", padding: spacing.lg },
    back: { position: "absolute", top: 44, left: 0, right: 0, bottom: 0, padding: spacing.lg },
    hero: { height: 420, borderRadius: radius.md ?? 12 },
    badge: { alignSelf: "center", width: 120, height: 120, marginBottom: spacing.md },
    heroPlaceholder: { backgroundColor: colors.gray?.[200] ?? "#eee", alignItems: "center", justifyContent: "center" },
    personaTitle: { textAlign: "center", fontSize: 18, fontWeight: "800", marginTop: 4 },
    personaSub: { textAlign: "center", opacity: 0.8, marginBottom: spacing.sm },
});

