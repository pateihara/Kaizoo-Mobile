//app/galeria/[id].tsx
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, TextInput, View } from "react-native";

import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import Screen from "@/components/templates/Screen";
import { colors, radius, spacing } from "@/theme";

import { useAuth } from "@/contexts/AuthContext";
import {
    addComment,
    fetchPosts,
    likePost,
    listComments,
    type Comment,
    type CommunityPost,
} from "@/services/community";

export default function PostDetalhePage() {
    const { id: rawId } = useLocalSearchParams<{ id?: string | string[] }>();
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState<CommunityPost | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState("");

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const [posts] = await Promise.all([fetchPosts()]);
                const found = posts.find((p) => p.id === id) || null;

                if (!mounted) return;
                setPost(found);

                // comentários
                if (found?.id) {
                    const list = await listComments(found.id);
                    if (!mounted) return;
                    setComments(list);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [id]);

    const isMine = useMemo(() => {
        if (!post) return false;
        const me = (user?.email || "").split("@")[0]?.toLowerCase?.();
        return post.author === "Você" || post.author?.toLowerCase?.() === me;
    }, [post, user?.email]);

    async function onToggleLike() {
        if (!post) return;
        // optimistic
        setPost((prev) =>
            prev
                ? { ...prev, likedByMe: !prev.likedByMe, likes: prev.likedByMe ? Math.max(0, prev.likes - 1) : prev.likes + 1 }
                : prev
        );
        try {
            await likePost(post.id);
        } catch {
            // rollback
            setPost((prev) =>
                prev
                    ? { ...prev, likedByMe: !prev.likedByMe, likes: prev.likedByMe ? Math.max(0, prev.likes - 1) : prev.likes + 1 }
                    : prev
            );
        }
    }

    async function onSendComment() {
        if (!post || !text.trim()) return;
        const optimistic: Comment = {
            id: `temp-${Date.now()}`,
            postId: post.id,
            author: (user?.email || "Você").split("@")[0],
            authorAvatarColor: "#03A9F4",
            text: text.trim(),
            createdAtISO: new Date().toISOString(),
        };
        setComments((prev) => [optimistic, ...prev]);
        setText("");

        try {
            const saved = await addComment(post.id, optimistic.text, optimistic.author);
            setComments((prev) => prev.map((c) => (c.id === optimistic.id ? saved : c)));
            // atualiza contador do post localmente
            setPost((prev) => (prev ? { ...prev, comments: prev.comments + 1 } : prev));
        } catch {
            setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
        }
    }

    if (loading) {
        return (
            <>
                <Stack.Screen options={{ headerShown: true, title: "Post" }} />
                <Screen>
                    <Text variant="body">Carregando...</Text>
                </Screen>
            </>
        );
    }

    if (!post) {
        return (
            <>
                <Stack.Screen options={{ headerShown: true, title: "Post" }} />
                <Screen>
                    <Card style={{ padding: spacing.md }}>
                        <Text variant="body">Post não encontrado.</Text>
                    </Card>
                </Screen>
            </>
        );
    }

    const src = post.image ?? (post.imageUri ? { uri: post.imageUri } : undefined);

    return (
        <>
            <Stack.Screen options={{ headerShown: true, title: isMine ? "Meu Post" : post.author }} />
            <Screen>
                {/* Cabeçalho do post */}
                <Card style={{ padding: spacing.md, gap: spacing.sm }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                        <View style={{ width: 28, height: 28, borderRadius: 999, backgroundColor: post.authorAvatarColor ?? "#9C27B0" }} />
                        <Text variant="body" weight="bold">{isMine ? "Você" : post.author}</Text>
                    </View>

                    {src ? (
                        <Image
                            source={src}
                            style={{ width: "100%", height: undefined, aspectRatio: 1, borderRadius: radius.md }}
                        />
                    ) : null}

                    <Text variant="body" style={{ marginTop: spacing.xs }}>{post.content}</Text>

                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.xs }}>
                        <Pill label={`Atividade: ${post.activity}`} />
                        <Pill label={`Duração: ${post.durationMin} min`} />
                        <Pill label={`Humor: ${post.mood}`} />
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm }}>
                        <Text variant="body">❤️ {post.likes}</Text>
                        <Text variant="body">💬 {post.comments}</Text>
                    </View>

                    <Button
                        label={post.likedByMe ? "Remover like" : "Curtir"}
                        onPress={onToggleLike}
                        variant={post.likedByMe ? "secondary" : "primary"}
                    />
                </Card>

                {/* Comentários */}
                <Card style={{ padding: spacing.md, marginTop: spacing.md, gap: spacing.sm }}>
                    <Text variant="subtitle" weight="bold">Comentários</Text>

                    <TextInput
                        placeholder="Escreva um comentário..."
                        placeholderTextColor={colors.gray[500]}
                        value={text}
                        onChangeText={setText}
                        style={{
                            padding: spacing.md,
                            backgroundColor: colors.gray[100],
                            borderRadius: radius.md,
                        }}
                        multiline
                    />
                    <Button label="Enviar" onPress={onSendComment} />
                </Card>

                {comments.length === 0 ? (
                    <Card style={{ padding: spacing.md, marginTop: spacing.sm }}>
                        <Text variant="body" color={colors.gray[600]}>Seja o primeiro a comentar!</Text>
                    </Card>
                ) : (
                    comments.map((c) => (
                        <Card
                            key={c.id}
                            style={{ padding: spacing.md, flexDirection: "row", gap: spacing.sm, alignItems: "flex-start", marginTop: spacing.sm }}
                        >
                            <View
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 999,
                                    backgroundColor: c.authorAvatarColor ?? "#9C27B0",
                                    marginTop: 2,
                                }}
                            />
                            <View style={{ flex: 1 }}>
                                <Text variant="body" weight="bold">{c.author}</Text>
                                <Text variant="body" color={colors.gray[800]} style={{ marginTop: 2 }}>
                                    {c.text}
                                </Text>
                            </View>
                        </Card>
                    ))
                )}

                <View style={{ height: spacing.lg }} />
            </Screen>
        </>
    );
}

function Pill({ label }: { label: string }) {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.black,
                borderRadius: radius.md,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
            }}
        >
            <Text variant="body" color={colors.white}>{label}</Text>
        </View>
    );
}
