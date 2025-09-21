// app/kaizoo/form.tsx
import Button from "@/components/atoms/Button";
import Text from "@/components/atoms/Text";
import { useAuth } from "@/contexts/AuthContext"; // ✅ alias "@"
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
    { key: "tato", title: "TATO", subtitle: "TARTARUGA FOCADA" },
    { key: "dino", title: "DINO", subtitle: "O DINOSSAURINHO FORTE" },
    { key: "koa", title: "KOA", subtitle: "A COALINHA PROTETORA" },
    { key: "kaia", title: "KAIA", subtitle: "A GATA ENERGÉTICA" },
    { key: "penny", title: "PENNY", subtitle: "A PINGUIM SERENA" },
];

export default function SelectKaizoo() {
    const router = useRouter();
    const { refreshProfile } = useAuth();
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

        // 1) Salva Kaizoo — SE falhar, avisa e não navega
        try {
            await finishOnboarding(sel.key);
        } catch (e: any) {
            const msg = e?.data?.error ?? e?.message ?? "Falha ao concluir onboarding";
            Alert.alert("Não foi possível salvar seu Kaizoo", String(msg));
            setSaving(false);
            return;
        }

        // 2) Atualiza perfil — SE falhar, só loga e segue
        try {
            await refreshProfile();
        } catch (e: any) {
            console.warn("refreshProfile falhou após salvar Kaizoo:", e?.message ?? e);
        }

        // 3) Vai pras tabs de qualquer forma (já salvou o Kaizoo no backend)
        router.replace("/(tabs)");
        setSaving(false);
    };

    return (
        <View style={styles.screen}>
            <Step title="1. Escolha seu Kaizoo" />

            {/* ...seu FlatList e UI permanecem iguais... */}

            <View style={{ padding: spacing.lg, gap: spacing.sm }}>
                <Button label="quero este!" onPress={chooseThis} fullWidth loading={saving} disabled={saving} />
                {index < MASCOTS.length - 1 && (
                    <Button variant="secondary" label="ver o próximo!" onPress={goNext} fullWidth disabled={saving} />
                )}
                {index > 0 && <Button variant="ghost" label="voltar" onPress={goPrev} fullWidth disabled={saving} />}
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
