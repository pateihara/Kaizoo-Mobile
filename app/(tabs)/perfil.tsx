// app/(tabs)/perfil.tsx
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import Screen from "@/components/templates/Screen";
import { useAuth } from "@/contexts/AuthContext";
import { colors, radius, spacing } from "@/theme";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

/** --------- DATA MOCK (troque depois pelos seus dados reais) --------- */
const PROFILE = {
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
    badges: [1, 2, 3], // placeholders
    gallery: [1, 2, 3, 4], // placeholders
    favorites: ["🚶‍♀️", "🧘‍♀️", "🙆‍♂️", "🏃‍♂️", "🚴‍♀️", "🌿"],
};
/** -------------------------------------------------------------------- */

export default function PerfilScreen() {
    const router = useRouter();
    const { signOut } = useAuth();

    const onInvite = () => { };
    const onShare = () => { };
    const onSignOut = async () => {
        await signOut();
        router.replace("/(auth)/login");
    };

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
                    {/* Se tiver imagem real, troque pelo <Image source={...} /> */}
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Text variant="title" weight="bold">🙂</Text>
                    </View>
                </View>

                {/* Nome + Bio */}
                <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.xs }}>
                    {PROFILE.name}
                </Text>
                <Text variant="body" color={colors.gray[800]}>
                    {PROFILE.bio}
                </Text>

                {/* Linha de stats (amigos / comunidades / mascotes) */}
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
                    <MiniStat label="AMIGOS" value={PROFILE.statsTop.friends} />
                    <MiniStat label="COMUNIDADES" value={PROFILE.statsTop.communities} />
                    <MiniStat label="MASCOTES" value={PROFILE.statsTop.mascots} />
                </View>

                {/* Ações */}
                <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                    <Button label="Convidar Amigos" fullWidth />
                    <Button label="Compartilhar" variant="secondary" fullWidth onPress={onShare} />

                    {/* Botão laranja como no mock (usando children para controlar a cor do texto) */}
                    <Button variant="secondary" fullWidth style={{ backgroundColor: colors.mascots.navajoWhite }} onPress={onSignOut}>
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
                    {PROFILE.badges.map((b) => (
                        <View
                            key={b}
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
            <MetricsGrid />

            {/* Galeria de Registros */}
            <Card style={{ padding: spacing.md }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
                    <Text variant="subtitle" weight="bold">Galeria de Registros</Text>
                    <Text variant="body" weight="bold" color={colors.gray[700]}>ver todas</Text>
                </View>

                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                    {PROFILE.gallery.map((g) => (
                        <View
                            key={g}
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
                    {PROFILE.favorites.map((emoji, idx) => (
                        <DarkPill key={idx} emoji={emoji} />
                    ))}
                </View>
            </Card>

            <View style={{ height: spacing.lg }} />
        </Screen>
    );
}

/** ---------- Helpers locais (molecules/organisms inline) ---------- */

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

function MetricsGrid() {
    const items = PROFILE.metrics;

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
                        backgroundColor: m.color,
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
