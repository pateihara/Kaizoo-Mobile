// app/(tabs)/comunidade.tsx
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import Screen from "@/components/templates/Screen";
import { useAuth } from "@/contexts/AuthContext";
import { bus } from "@/lib/bus"; // 👈 ouvir eventos de comentário
import {
    addComment,
    createPost,
    fetchPosts,
    likePost,
    type CommunityPost,
} from "@/services/community";
import { colors, radius, spacing } from "@/theme";

// ------------------ Tipos de UI ------------------
type Mood = "feliz" | "neutro" | "cansado" | "orgulhoso" | "relaxado";

const MOOD_LABEL: Record<Mood, string> = {
    feliz: "Feliz",
    neutro: "Neutro",
    cansado: "Cansado",
    orgulhoso: "Orgulhoso",
    relaxado: "Relaxado",
};

// Atividades — pode trocar para seu enum ActivityKey depois
const ACTIVITIES = ["Alongamento", "Caminhada", "Corrida", "Pedalada", "Yoga", "Outro"] as const;

export default function CommunityPage() {
    const { user } = useAuth(); // { id, email }

    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Campos do modal de criação
    const [content, setContent] = useState("");
    const [activity, setActivity] = useState<typeof ACTIVITIES[number]>("Alongamento");
    const [durationMin, setDurationMin] = useState<string>("30");
    const [mood, setMood] = useState<Mood>("feliz");
    const [imageUri, setImageUri] = useState<string | undefined>(undefined); // só galeria agora

    // ---- Carregar lista inicial ----
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await fetchPosts();
                if (mounted) setPosts(data);
            } catch {
                Alert.alert("Falha ao carregar posts", "Tente novamente em instantes.");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // ---- Ouvinte: comentário criado na tela de comentários ----
    useEffect(() => {
        function onCommentAdded(postId: string) {
            setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)));
        }
        bus.on("community:commentAdded", onCommentAdded);
        return () => {
            bus.off("community:commentAdded", onCommentAdded);
        };
    }, []);

    // ---- Ações: like / comentar (composer rápido no card) ----
    async function onLike(id: string) {
        // Optimistic
        setPosts((prev) =>
            prev.map((p) =>
                p.id === id
                    ? { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes - 1 : p.likes + 1 }
                    : p
            )
        );
        try {
            await likePost(id);
        } catch {
            // rollback
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === id
                        ? { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes - 1 : p.likes + 1 }
                        : p
                )
            );
            Alert.alert("Não foi possível curtir agora");
        }
    }

    async function onAddComment(id: string, text: string) {
        if (!text.trim()) return;
        // Optimistic local
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, comments: p.comments + 1 } : p)));
        try {
            await addComment(id, text);
            // não precisa emitir aqui, já atualizamos localmente
        } catch {
            // rollback
            setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, comments: Math.max(0, p.comments - 1) } : p)));
            Alert.alert("Não foi possível comentar agora");
        }
    }

    // ---- Criar Post ----
    async function pickImageFromGallery() {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert("Permissão necessária", "Precisamos de acesso às suas fotos para anexar a imagem.");
            return;
        }
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.85,
        });
        if (!res.canceled && res.assets?.length) {
            setImageUri(res.assets[0].uri);
        }
    }

    async function submitPost() {
        if (!content.trim()) {
            Alert.alert("Conte algo no post 😊");
            return;
        }
        const minutes = Number(durationMin);
        if (!Number.isFinite(minutes) || minutes <= 0) {
            Alert.alert("Tempo inválido", "Informe os minutos de atividade (ex.: 30).");
            return;
        }

        const optimistic: CommunityPost = {
            id: `temp-${Date.now()}`,
            author: user ? user.email?.split("@")[0] || "Você" : "Você",
            authorAvatarColor: "#7C4DFF",
            createdAtISO: new Date().toISOString(),
            content: content.trim(),
            activity,
            durationMin: minutes,
            mood,
            imageUri, // só galeria
            likes: 0,
            comments: 0,
            likedByMe: false,
        };

        // Optimistic UI
        setPosts((prev) => [optimistic, ...prev]);
        setCreating(false);
        resetComposer();

        try {
            const saved = await createPost({
                content: optimistic.content,
                activity: optimistic.activity,
                durationMin: optimistic.durationMin,
                mood: optimistic.mood,
                imageUri: optimistic.imageUri,
            });
            // Reconcile
            setPosts((prev) => prev.map((p) => (p.id === optimistic.id ? saved : p)));
        } catch {
            // Rollback
            setPosts((prev) => prev.filter((p) => p.id !== optimistic.id));
            Alert.alert("Não foi possível publicar agora, tente mais tarde.");
        }
    }

    function resetComposer() {
        setContent("");
        setActivity("Alongamento");
        setDurationMin("30");
        setMood("feliz");
        setImageUri(undefined);
    }

    const moodKeys = Object.keys(MOOD_LABEL) as (keyof typeof MOOD_LABEL)[];

    return (
        <Screen>
            <Text variant="title" weight="bold" style={{ marginBottom: spacing.sm }}>
                Comunidade
            </Text>

            {/* Botão para abrir modal de criação */}
            <View style={{ marginTop: spacing.xs }}>
                <Button label="Criar um Novo Post" fullWidth onPress={() => setCreating(true)} />
            </View>

            {/* Lista */}
            {loading ? (
                <Text variant="body" style={{ marginTop: spacing.md }}>
                    Carregando...
                </Text>
            ) : posts.length === 0 ? (
                <Card style={{ padding: spacing.lg, marginTop: spacing.md }}>
                    <Text variant="subtitle" weight="bold">
                        Ainda não há posts
                    </Text>
                    <Text variant="body" color={colors.gray[600]} style={{ marginTop: spacing.xs }}>
                        Comece compartilhando seu primeiro momento com a comunidade!
                    </Text>
                </Card>
            ) : (
                posts.map((p) => (
                    <PostCard key={p.id} post={p} onLike={() => onLike(p.id)} onSendComment={(txt) => onAddComment(p.id, txt)} />
                ))
            )}

            {/* Modal: Criar Post */}
            <Modal visible={creating} animationType="slide" onRequestClose={() => setCreating(false)}>
                <Screen>
                    <Text variant="title" weight="bold">
                        Novo Post
                    </Text>

                    {/* Texto do post */}
                    <Card style={{ padding: spacing.md, marginTop: spacing.md }}>
                        <Text variant="body" weight="bold">
                            O que você quer compartilhar?
                        </Text>
                        <TextInput
                            placeholder="Escreva aqui..."
                            placeholderTextColor={colors.gray[500]}
                            value={content}
                            onChangeText={setContent}
                            style={{
                                marginTop: spacing.sm,
                                minHeight: 90,
                                padding: spacing.md,
                                backgroundColor: colors.gray[100],
                                borderRadius: radius.md,
                                textAlignVertical: "top",
                            }}
                            multiline
                        />
                    </Card>

                    {/* Atividade + Tempo + Humor */}
                    <Card style={{ padding: spacing.md, marginTop: spacing.sm }}>
                        <Text variant="body" weight="bold">
                            Atividade
                        </Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm }}>
                            {ACTIVITIES.map((a) => {
                                const selected = activity === a;
                                return (
                                    <TouchableOpacity
                                        key={a}
                                        onPress={() => setActivity(a)}
                                        style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 12,
                                            borderRadius: 999,
                                            backgroundColor: selected ? colors.gray[800] : colors.gray[200],
                                        }}
                                    >
                                        <Text variant="body" weight="semibold" color={selected ? colors.white : colors.gray[800]}>
                                            {a}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text variant="body" weight="bold" style={{ marginTop: spacing.md }}>
                            Tempo (min)
                        </Text>
                        <TextInput
                            keyboardType={"numeric"}
                            placeholder="Ex.: 30"
                            placeholderTextColor={colors.gray[500]}
                            value={durationMin}
                            onChangeText={setDurationMin}
                            style={{
                                marginTop: spacing.sm,
                                padding: spacing.md,
                                backgroundColor: colors.gray[100],
                                borderRadius: radius.md,
                                width: 120,
                            }}
                        />

                        <Text variant="body" weight="bold" style={{ marginTop: spacing.md }}>
                            Como você se sentiu?
                        </Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm }}>
                            {moodKeys.map((k) => {
                                const selected = mood === k;
                                return (
                                    <TouchableOpacity
                                        key={k}
                                        onPress={() => setMood(k as Mood)}
                                        style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 12,
                                            borderRadius: 999,
                                            backgroundColor: selected ? colors.gray[800] : colors.gray[200],
                                        }}
                                    >
                                        <Text variant="body" weight="semibold" color={selected ? colors.white : colors.gray[800]}>
                                            {MOOD_LABEL[k as Mood]}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Card>

                    {/* Imagem opcional (somente galeria) */}
                    <Card style={{ padding: spacing.md, marginTop: spacing.sm }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }}>
                            <View style={{ flex: 1 }}>
                                <Text variant="body" weight="bold">
                                    Imagem (opcional)
                                </Text>
                                <Text variant="body" color={colors.gray[600]}>
                                    Anexe uma foto da sua galeria.
                                </Text>
                            </View>
                            <Button label={imageUri ? "Trocar foto" : "Galeria"} variant="secondary" onPress={pickImageFromGallery} />
                        </View>

                        {imageUri && (
                            <View
                                style={{
                                    height: 180,
                                    borderRadius: radius.md,
                                    overflow: "hidden",
                                    marginTop: spacing.md,
                                    backgroundColor: colors.gray[200],
                                }}
                            >
                                <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                            </View>
                        )}
                    </Card>

                    {/* Ações */}
                    <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
                        <Button label="Publicar" onPress={submitPost} />
                        <Button label="Cancelar" variant="secondary" onPress={() => setCreating(false)} />
                    </View>
                </Screen>
            </Modal>

            <View style={{ height: spacing.lg }} />
        </Screen>
    );
}

/* ----------------- Components locais ----------------- */

function PostCard({
    post,
    onLike,
    onSendComment,
}: {
    post: CommunityPost;
    onLike: () => void;
    onSendComment: (text: string) => void;
}) {
    const timeText = useMemo(() => formatTimeAgo(post.createdAtISO), [post.createdAtISO]);
    const [commentText, setCommentText] = useState("");
    const router = useRouter();

    return (
        <Card style={{ padding: spacing.md, borderRadius: radius.lg }}>
            {/* Cabeçalho */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <View
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 999,
                        backgroundColor: post.authorAvatarColor ?? "#9C27B0",
                    }}
                />
                <View style={{ flex: 1 }}>
                    <Text variant="subtitle" weight="bold">
                        {post.author}
                    </Text>
                    <Text variant="body" color={colors.gray[600]}>
                        {timeText}
                    </Text>
                </View>
            </View>

            {/* Imagem (opcional) */}
            {post.imageUri ? (
                <View
                    style={{
                        height: 170,
                        backgroundColor: colors.gray[300],
                        borderRadius: radius.md,
                        marginTop: spacing.md,
                        overflow: "hidden",
                    }}
                >
                    <Image source={{ uri: post.imageUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                </View>
            ) : null}

            {/* Texto */}
            {!!post.content && (
                <Text variant="body" color={colors.gray[800]} style={{ marginTop: spacing.md }}>
                    {post.content}
                </Text>
            )}

            {/* Metadados da atividade */}
            <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
                <InfoRow label="Atividade" value={post.activity} />
                <InfoRow label="Tempo" value={`${post.durationMin}min.`} />
                <InfoRow label="Sentimento" value={MOOD_LABEL[post.mood]} />
            </View>

            {/* Ações (curtir/comentar) */}
            <View
                style={{
                    marginTop: spacing.md,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: spacing.md,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.lg }}>
                    <TouchableOpacity onPress={onLike} activeOpacity={0.8} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text variant="subtitle">{post.likedByMe ? "❤️" : "♡"}</Text>
                        <Text variant="body" weight="semibold">{post.likes}</Text>
                    </TouchableOpacity>

                    {/* abre a tela de comentários */}
                    <TouchableOpacity
                        onPress={() => router.push(`/comentarios/${post.id}`)}
                        activeOpacity={0.8}
                        style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                    >
                        <Text variant="subtitle">💬</Text>
                        <Text variant="body" weight="semibold">{post.comments}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Composer de comentário rápido */}
            <View style={{ marginTop: spacing.sm, flexDirection: "row", gap: spacing.xs }}>
                <TextInput
                    placeholder="Escreva um comentário..."
                    placeholderTextColor={colors.gray[500]}
                    value={commentText}
                    onChangeText={setCommentText}
                    style={{
                        flex: 1,
                        paddingHorizontal: spacing.md,
                        paddingVertical: 10,
                        backgroundColor: colors.gray[100],
                        borderRadius: radius.md,
                    }}
                />
                <Button
                    label="Enviar"
                    onPress={() => {
                        const txt = commentText.trim();
                        if (!txt) return;
                        onSendComment(txt);
                        setCommentText("");
                    }}
                />
            </View>
        </Card>
    );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
    return (
        <Text variant="body">
            <Text weight="bold">{label}:</Text>{" "}
            <Text>{String(value)}</Text>
        </Text>
    );
}

// Util simples pra "x min atrás"
function formatTimeAgo(iso: string): string {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diffMin = Math.max(0, Math.round((now - then) / (1000 * 60)));
    if (diffMin < 60) return `${diffMin}min atrás`;
    const h = Math.round(diffMin / 60);
    if (h < 24) return `${h}h atrás`;
    const d = Math.round(h / 24);
    return `${d}d atrás`;
}
