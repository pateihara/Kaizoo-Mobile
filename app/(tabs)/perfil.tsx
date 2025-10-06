//app/(tabs)/perfil.tsx
// app/(tabs)/perfil.tsx
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, View } from "react-native";

import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import Screen from "@/components/templates/Screen";

import { useAuth } from "@/contexts/AuthContext";
import { bus } from "@/lib/bus";
import { fetchPosts, type CommunityPost } from "@/services/community";
import { getProfile } from "@/services/profile";
import { colors, radius, spacing } from "@/theme";

/** --------- UI Types --------- */
type ProfileUI = {
    email: string;
    bio: string;
    avatarUrl?: string; // futura persistência
    stats: { friends: number; communities: number };
    gallery: { id: string; image?: any; imageUri?: string }[];
};

/** --------- Fallback (bio padrão) --------- */
const DEFAULT_BIO =
    "Adoro começar o dia com movimento e boas energias. Entre um alongamento e uma pedalada no parque, busco leveza, saúde e motivação no meu ritmo.";

/** --------- Component --------- */
export default function PerfilScreen() {
    const router = useRouter();
    const { signOut, user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileUI | null>(null);

    // avatar local (visual). Se quiser persistir, suba pro backend e salve em profile.avatarUrl
    const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

    // chave “meu usuário” para filtrar posts: “voce” ou parte antes do @
    const myKey = useMemo(
        () => user?.email?.split("@")[0]?.toLowerCase() ?? "",
        [user?.email]
    );

    /** Carrega / atualiza as infos de perfil + posts do usuário */
    const loadAll = useCallback(async () => {
        try {
            setLoading(true);

            // 1) Perfil do backend
            const p = await getProfile().catch(() => null as any);

            // 2) Posts (minha galeria = só meus posts)
            const all = await safeFetchPosts();
            const mine = all.filter(
                (post) =>
                    post.author === "Você" ||
                    post.author?.toLowerCase() === myKey
            );

            const gallery = mine.map((m) => ({
                id: m.id,
                image: m.image,
                imageUri: m.imageUri,
            }));

            // Contadores: amigos (do evento “profile:friendsChanged”) e comunidades (evento “events:joined”)
            // Caso no futuro venham do backend, mapeie aqui.
            setProfile({
                email: p?.email || user?.email || "usuario@exemplo.com",
                bio: DEFAULT_BIO,
                avatarUrl: undefined,
                stats: {
                    friends: 0,
                    communities: 0,
                },
                gallery,
            });
        } finally {
            setLoading(false);
        }
    }, [myKey, user?.email]);

    /** Listener para manter perfil “vivo” quando o resto do app muda */
    useEffect(() => {
        loadAll();

        const onPostAdded = () => loadAll();
        const onCommentAdded = () => loadAll();

        const onEventJoined = () =>
            setProfile((prev) =>
                prev
                    ? { ...prev, stats: { ...prev.stats, communities: prev.stats.communities + 1 } }
                    : prev
            );

        const onFriendsChanged = () =>
            setProfile((prev) =>
                prev
                    ? { ...prev, stats: { ...prev.stats, friends: Math.max(0, prev.stats.friends + 1) } }
                    : prev
            );

        bus.on("community:postAdded", onPostAdded);
        bus.on("community:commentAdded", onCommentAdded);
        bus.on("events:joined", onEventJoined);
        bus.on("profile:friendsChanged", onFriendsChanged);

        return () => {
            bus.off("community:postAdded", onPostAdded);
            bus.off("community:commentAdded", onCommentAdded);
            bus.off("events:joined", onEventJoined);
            bus.off("profile:friendsChanged", onFriendsChanged);
        };
    }, [loadAll]);

    /** Ações */
    const onInvite = () => {
        // implemente seu fluxo de convite (share link/invite API)
        console.log("Convidar amigos");
    };
    const onShare = () => {
        // implemente um Share.share(...) aqui se quiser
        console.log("Compartilhar perfil/app");
    };
    const onSignOut = async () => {
        await signOut();
        router.replace("/(auth)/login");
    };

    /** Pick avatar (compat com API nova e antiga do expo-image-picker, sem warnings) */
    const pickAvatar = async () => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) return;

            // compat: nova API (MediaType.image) ou antiga (MediaTypeOptions.Images)
            const Media = (ImagePicker as any).MediaType ?? (ImagePicker as any).MediaTypeOptions;
            const mediaImages =
                (Media && (Media.image || Media.Images)) || "images";

            const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: mediaImages as any,
                quality: 0.9,
                allowsEditing: true,
                aspect: [1, 1],
            });

            if (!res.canceled && res.assets?.[0]?.uri) {
                setAvatarUri(res.assets[0].uri);
                // TODO: subir pro backend e salvar em profile.avatarUrl
            }
        } catch (e) {
            console.log("pickAvatar error:", e);
        }
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
                {/* Avatar (clicável pra trocar) */}
                <Pressable
                    onPress={pickAvatar}
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
                    {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={{ width: "100%", height: "100%" }} />
                    ) : profile.avatarUrl ? (
                        <Image source={{ uri: profile.avatarUrl }} style={{ width: "100%", height: "100%" }} />
                    ) : (
                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                            <Text variant="title" weight="bold">🙂</Text>
                        </View>
                    )}
                </Pressable>

                {/* Email + Bio */}
                <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.xs }}>
                    {profile.email}
                </Text>
                <Text variant="body" color={colors.gray[800]}>
                    {profile.bio}
                </Text>

                {/* Linha de stats (amigos, comunidades) */}
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
                    <MiniStat label="AMIGOS" value={profile.stats.friends} />
                    <MiniStat label="COMUNIDADES" value={profile.stats.communities} />
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

            {/* Galeria (posts do usuário) */}
            <Card style={{ padding: spacing.md }}>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: spacing.sm,
                    }}
                >
                    <Text variant="subtitle" weight="bold">Galeria de Registros</Text>
                    {/* Sem “ver todas”: tudo fica nesta tela */}
                </View>

                {/* Grid simples com wrap (evita FlatList dentro de ScrollView) */}
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                    {profile.gallery.length === 0 ? (
                        <Text variant="body" color={colors.gray[700]}>Você ainda não publicou nada.</Text>
                    ) : (
                        profile.gallery.map((g) => (
                            <View
                                key={g.id}
                                style={{
                                    width: "31.5%", // ~3 por linha com gap
                                    aspectRatio: 1,
                                    borderRadius: radius.md,
                                    backgroundColor: colors.gray[200],
                                    overflow: "hidden",
                                }}
                            >
                                {g.image ? (
                                    <Image source={g.image} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                                ) : g.imageUri ? (
                                    <Image source={{ uri: g.imageUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                                ) : (
                                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                        <Text variant="body" color={colors.gray[600]}>sem foto</Text>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
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

/** ---------- Utils ---------- */
let warnedPosts404 = false;
async function safeFetchPosts(): Promise<CommunityPost[]> {
    try {
        return await fetchPosts();
    } catch (e: any) {
        if (!warnedPosts404) {
            console.warn(
                "[community] usando seed local (backend /community/posts não encontrado)"
            );
            warnedPosts404 = true;
        }
        // o próprio fetchPosts já faz seed em memória no catch do service,
        // então aqui devolvemos array vazio só por garantia:
        return [];
    }
}
