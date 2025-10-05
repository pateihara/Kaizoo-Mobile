// app/(tabs)/perfil.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import Screen from "@/components/templates/Screen";

import { useAuth } from "@/contexts/AuthContext";
import { fetchMyProfile } from "@/services/profile";
import { colors, radius, spacing } from "@/theme";

/** Tipos de UI (color opcional) */
type MetricItem = { value: string; label: string; color?: string; bordered?: boolean };
type ProfileUI = {
    name: string;
    bio: string;
    statsTop: { friends: number; communities: number; mascots: number };
    metrics: MetricItem[];
    badges: number[];
    gallery: number[];
    favorites: string[];
};

/** --------- MOCK (fallback) --------- */
const PROFILE_FALLBACK: ProfileUI = {
    name: "Julia Costa",
    bio:
        "Adoro começar o dia com movimento e boas energias. Entre um alongamento e uma pedalada no parque, busco leveza, saúde e motivação no meu ritmo.",
    statsTop: { friends: 35, communities: 10, mascots: 1 },
    metrics: [
        { value: "43", label: "Dias Ativos", color: colors.mascots.navajoWhite },
        { value: "344", label: "Horas Ativas", color: colors.mascots.lightSteelBlue },
        { value: "134", label: "Desafios Concluídos", color: "#EAC4D5" },
        { value: "32", label: "Recordes Batidos", color: colors.white, bordered: true },
        { value: "1230", label: "Km Percorridos", color: colors.white, bordered: true },
        { value: "10K", label: "Calorias Queimadas", color: "#EAC4D5" },
        { value: "156", label: "Metas Cumpridas", color: colors.mascots.navajoWhite },
        { value: "5", label: "Atividades Praticadas", color: colors.mascots.lightSteelBlue },
    ],
    badges: [1, 2, 3],
    gallery: [1, 2, 3, 4],
    favorites: ["🚶‍♀️", "🧘‍♀️", "🙆‍♂️", "🏃‍♂️", "🚴‍♀️", "🌿"],
};
/** ----------------------------------- */

export default function PerfilScreen() {
    const router = useRouter();
    const { signOut, user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileUI | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const u = await fetchMyProfile(); // GET /profile/me
                const mapped: ProfileUI = {
                    name: u.name || PROFILE_FALLBACK.name,
                    bio: u.bio || PROFILE_FALLBACK.bio,
                    statsTop: {
                        friends: u.statsTop?.friends ?? PROFILE_FALLBACK.statsTop.friends,
                        communities: u.statsTop?.communities ?? PROFILE_FALLBACK.statsTop.communities,
                        mascots: u.statsTop?.mascots ?? PROFILE_FALLBACK.statsTop.mascots,
                    },
                    // color pode vir ausente; o componente já tem fallback visual
                    metrics: Array.isArray(u.metrics) && u.metrics.length ? u.metrics : PROFILE_FALLBACK.metrics,
                    badges: Array.isArray(u.badges) ? u.badges : PROFILE_FALLBACK.badges,
                    gallery: Array.isArray(u.gallery) ? u.gallery : PROFILE_FALLBACK.gallery,
                    favorites: Array.isArray(u.favorites) ? u.favorites : PROFILE_FALLBACK.favorites,
                };
                setProfile(mapped);
            } catch {
                setProfile(PROFILE_FALLBACK);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Seu AuthContext expõe somente { id, email }, então não use user.name.
    const displayName = useMemo(() => {
        return profile?.name || user?.email || PROFILE_FALLBACK.name;
    }, [profile?.name, user?.email]);

    const onInvite = () => { };
    const onShare = () => { };
    const onSignOut = async () => {
        await signOut();
        router.replace("/(auth)/login");
    };

    if (loading || !profile) {
        return (
            <Screen>
                <Text variant="title" weight="bold" style={{ marginBottom: spacing.sm }}>
                    Perfil
                </Text>
                <ActivityIndicator style={{ marginTop: spacing.md }} />
            </Screen>
        );
    }

    return (
        <Screen>
            {/* TÍTULO */}
            <Text variant="title" weight="bold" style={{ marginBottom: spacing.sm }}>
                Perfil
            </Text>

            {/* CARD DE PERFIL */}
            <Card style={{ padding: spacing.lg, borderRadius: radius.lg }}>
                {/* Avatar */}
                <View
                    style={{
                        width: 140,
                        height: 140,
                        borderRadius: 999,
                        alignSelf: "center",
                        backgroundColor: colors.gray[200],
                        marginBottom: spacing.md,
                        overflow: "hidden",
                    }}
                >
                    {/* Se tiver imagem real, troque por: <Image source={{ uri: profile.avatarUrl }} /> */}
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Text variant="title" weight="bold">🙂</Text>
                    </View>
                </View>

                {/* Nome + Bio */}
                <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.xs }}>
                    {displayName}
                </Text>
                <Text variant="body" color={colors.gray[800]}>
                    {profile.bio}
                </Text>

                {/* Linha de stats */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: colors.black,
                        borderRadius: 999,
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.lg,
                        marginTop: spacing.md,
                    }}
                >
                    <MiniStat label="AMIGOS" value={profile.statsTop.friends} />
                    <MiniStat label="COMUNIDADES" value={profile.statsTop.communities} />
                    <MiniStat label="MASCOTES" value={profile.statsTop.mascots} />
                </View>

                {/* Ações */}
                <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                    <Button label="Convidar Amigos" fullWidth onPress={onInvite} />
                    <Button label="Compartilhar" variant="secondary" fullWidth onPress={onShare} />

                    <Button
                        variant="secondary"
                        fullWidth
                        style={{ backgroundColor: colors.mascots.navajoWhite }}
                        onPress={onSignOut}
                    >
                        <Text variant="button" color={colors.black} style={{ textAlign: "center", width: "100%" }}>
                            sair do app
                        </Text>
                    </Button>
                </View>
            </Card>

            {/* Badges */}
            <Card style={{ padding: spacing.md }}>
                <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
                    Badges
                </Text>
                <View style={{ flexDirection: "row", gap: spacing.md }}>
                    {(profile.badges || []).map((b, idx) => (
                        <View
                            key={`${b}-${idx}`}
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: 999,
                                borderWidth: 2,
                                borderColor: colors.gray[800],
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                            }}
                        >
                            {/* Placeholder; troque por <Image source={...} /> */}
                            <Text variant="body">🏅</Text>
                        </View>
                    ))}
                </View>
            </Card>

            {/* Métricas em grade */}
            <MetricsGrid items={profile.metrics} />

            {/* Galeria de Registros */}
            <Card style={{ padding: spacing.md }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
                    <Text variant="subtitle" weight="bold">Galeria de Registros</Text>
                    <Text variant="body" weight="bold" color={colors.gray[700]}>ver todas</Text>
                </View>

                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                    {(profile.gallery || []).map((g, idx) => (
                        <View
                            key={`${g}-${idx}`}
                            style={{
                                width: 64, height: 64, borderRadius: radius.md,
                                backgroundColor: colors.gray[200],
                            }}
                        />
                    ))}
                </View>
            </Card>

            {/* Atividades Preferidas */}
            <Card style={{ padding: spacing.md }}>
                <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
                    Atividades Preferidas
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                    {(profile.favorites || []).map((emoji, idx) => (
                        <DarkPill key={idx} emoji={emoji} />
                    ))}
                </View>
            </Card>

            <View style={{ height: spacing.lg }} />
        </Screen>
    );
}

/** ---------- Helpers ---------- */
function MiniStat({ label, value }: { label: string; value: number | string }) {
    return (
        <View style={{ alignItems: "center" }}>
            <Text variant="subtitle" weight="bold" color={colors.white}>
                {String(value)}
            </Text>
            <Text variant="body" color={colors.white}>
                {label}
            </Text>
        </View>
    );
}

function MetricsGrid({ items }: { items: MetricItem[] }) {
    return (
        <View
            style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: spacing.sm,
            }}
        >
            {items.map((m, idx) => (
                <View
                    key={idx}
                    style={{
                        width: "48%",
                        backgroundColor: m.color ?? colors.gray[200],
                        borderRadius: radius.lg,
                        paddingVertical: spacing.lg,
                        paddingHorizontal: spacing.md,
                        borderWidth: m.bordered ? 1 : 0,
                        borderColor: colors.gray[200],
                        shadowColor: "#000",
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 2,
                    }}
                >
                    <Text variant="subtitle" weight="bold">
                        {m.value}
                    </Text>
                    <Text variant="body" weight="bold">
                        {m.label.toUpperCase()}
                    </Text>
                </View>
            ))}
        </View>
    );
}

function DarkPill({ emoji }: { emoji: string }) {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: spacing.xs,
                backgroundColor: colors.black,
                borderRadius: radius.md,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                minWidth: 64,
            }}
        >
            <Text variant="subtitle" color={colors.white}>{emoji}</Text>
        </View>
    );
}
