// app/galeria/index.tsx
import { Link, Stack } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Text from "@/components/atoms/Text";
import { useAuth } from "@/contexts/AuthContext";
import { bus } from "@/lib/bus";
import { fetchPosts, type CommunityPost } from "@/services/community";
import { colors, radius, spacing } from "@/theme";

export default function MinhaGaleriaPage() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<CommunityPost[]>([]);

    const myKey = useMemo(
        () => user?.email?.split("@")[0]?.toLowerCase() ?? "",
        [user?.email]
    );

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const posts = await fetchPosts().catch(() => [] as CommunityPost[]);
            const mine = posts.filter(
                (p) => p.author === "Você" || p.author?.toLowerCase() === myKey
            );
            setItems(mine);
        } finally {
            setLoading(false);
        }
    }, [myKey]);

    useEffect(() => {
        load();

        const onAdded = () => load();
        const onComment = () => load();

        bus.on("community:postAdded", onAdded);
        bus.on("community:commentAdded", onComment);

        return () => {
            bus.off("community:postAdded", onAdded);
            bus.off("community:commentAdded", onComment);
        };
    }, [load]);

    return (
        <>
            <Stack.Screen options={{ title: "Minha Galeria" }} />
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
                {loading ? (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Text variant="body">Carregando...</Text>
                    </View>
                ) : items.length === 0 ? (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg }}>
                        <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
                            Sem posts ainda
                        </Text>
                        <Text variant="body" color={colors.gray[600]} style={{ textAlign: "center" }}>
                            Publique algo na comunidade e ele aparece aqui ✨
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={(it) => it.id}
                        numColumns={3}
                        columnWrapperStyle={{ gap: spacing.sm, paddingHorizontal: spacing.md }}
                        contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.md }}
                        renderItem={({ item }) => (
                            // abre a tela de comentários que você já tem
                            <Link
                                href={{ pathname: "/comentarios/[id]", params: { id: item.id } }}
                                asChild
                            >
                                <Pressable
                                    style={{
                                        width: "32%",
                                        aspectRatio: 1,
                                        borderRadius: radius.md,
                                        backgroundColor: colors.gray[200],
                                        overflow: "hidden",
                                    }}
                                >
                                    {item.image ? (
                                        <Image
                                            source={item.image}
                                            style={{ width: "100%", height: "100%" }}
                                            resizeMode="cover"
                                        />
                                    ) : item.imageUri ? (
                                        <Image
                                            source={{ uri: item.imageUri }}
                                            style={{ width: "100%", height: "100%" }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                            <Text variant="body" color={colors.gray[600]}>
                                                sem foto
                                            </Text>
                                        </View>
                                    )}
                                </Pressable>
                            </Link>
                        )}
                    />
                )}
            </SafeAreaView>
        </>
    );
}
