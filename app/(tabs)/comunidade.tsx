// app/(tabs)/comunidade.tsx
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import Screen from "@/components/templates/Screen";
import { colors, radius, spacing } from "@/theme";
import React from "react";
import { Image, View } from "react-native";

type Post = {
    id: string;
    author: string;
    minutesAgo: number;
    banner?: any; // require(...) | {uri: string}
    content: string;
    activity: string;
    timeText: string; // “32min.” etc
    rewardXP: number;
    mascotMood: string; // “Kaia se sente relaxada!”
    mascotBg: string;   // cor do pill
    likes: number;
    comments: number;
    avatarColor: string;
};

// MOCK (mesmo espírito do layout)
const POSTS: Post[] = [
    {
        id: "p1",
        author: "Ana Martins",
        minutesAgo: 60,
        // banner opcional — pode trocar por um require(...) seu
        banner: undefined,
        content:
            "Hoje consegui acordar 30 minutinhos mais cedo e fiz a sequência de alongamento do Kaizoo antes de começar a trabalhar. Meu pet quase dormiu de tão relaxado! 🐾💤 Alguém mais tentando manter a rotina com leveza?",
        activity: "Yoga",
        timeText: "32min.",
        rewardXP: 50,
        mascotMood: "Kaia se sente relaxada!",
        mascotBg: colors.mascots.navajoWhite,
        likes: 43,
        comments: 4,
        avatarColor: "#F6A623",
    },
    {
        id: "p2",
        author: "Lucas Ferreira",
        minutesAgo: 120,
        banner: undefined,
        content:
            "Confesso que tava meio desanimado, mas o desafio da semana me deu o empurrão que eu precisava! 12km pedalando e o Kaikinho já subiu de nível 🐲✨ Bora seguir firme!",
        activity: "Pedalar",
        timeText: "40min.",
        rewardXP: 55,
        mascotMood: "Dino se sente energizado!",
        mascotBg: colors.mascots.paleTurquoise,
        likes: 65,
        comments: 7,
        avatarColor: "#4CAF50",
    },
];

export default function CommunityPage() {
    return (
        <Screen>
            <Text variant="title" weight="bold" style={{ marginBottom: spacing.sm }}>
                Comunidade
            </Text>

            {POSTS.map((p) => (
                <PostCard key={p.id} post={p} />
            ))}

            <View style={{ alignItems: "center", marginTop: spacing.md }}>
                <Button
                    variant="secondary"
                    label="Carregar Mais"
                    style={{ paddingHorizontal: spacing.lg }}
                />
            </View>

            <View style={{ marginTop: spacing.md }}>
                <Button label="Criar um Novo Post" fullWidth />
            </View>

            <View style={{ height: spacing.lg }} />
        </Screen>
    );
}

/* ----------------- Components locais ----------------- */

function PostCard({ post }: { post: Post }) {
    return (
        <Card style={{ padding: spacing.md, borderRadius: radius.lg }}>
            {/* Cabeçalho */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <View
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 999,
                        backgroundColor: post.avatarColor,
                    }}
                />
                <View style={{ flex: 1 }}>
                    <Text variant="subtitle" weight="bold">
                        {post.author}
                    </Text>
                    <Text variant="body" color={colors.gray[600]}>
                        postado a {Math.round(post.minutesAgo / 60) === 0
                            ? `${post.minutesAgo}min.`
                            : `${Math.round(post.minutesAgo / 60)}h.`}
                    </Text>
                </View>
            </View>

            {/* Banner/Imagem (placeholder visual quando não houver imagem) */}
            <View
                style={{
                    height: 170,
                    backgroundColor: colors.gray[300],
                    borderRadius: radius.md,
                    marginTop: spacing.md,
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {post.banner ? (
                    <Image
                        source={post.banner}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                    />
                ) : (
                    <Text variant="subtitle" weight="bold" color={colors.gray[700]}>
                        {post.rewardXP} XP
                    </Text>
                )}
            </View>

            {/* Texto */}
            <Text
                variant="body"
                color={colors.gray[800]}
                style={{ marginTop: spacing.md }}
            >
                {post.content}
            </Text>

            {/* Metadados da atividade */}
            <View style={{ marginTop: spacing.md, gap: spacing.xs }}>
                <InfoRow label="Atividade" value={post.activity} />
                <InfoRow label="Tempo" value={post.timeText} />
                <InfoRow
                    label="Recompensa"
                    value={`${post.rewardXP}XP`}
                    strongValue
                />
            </View>

            {/* Pill do mascote */}
            <View
                style={{
                    backgroundColor: post.mascotBg,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: 999,
                    marginTop: spacing.md,
                    alignSelf: "stretch",
                }}
            >
                <Text variant="body" weight="bold">
                    🐾 {post.mascotMood}
                </Text>
            </View>

            {/* Ações (curtir/comentar) */}
            <View
                style={{
                    marginTop: spacing.md,
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: spacing.lg,
                }}
            >
                <ActionCounter icon="♡" count={post.likes} />
                <ActionCounter icon="💬" count={post.comments} />
            </View>
        </Card>
    );
}

function InfoRow({
    label,
    value,
    strongValue,
}: {
    label: string;
    value: string | number;
    strongValue?: boolean;
}) {
    return (
        <Text variant="body">
            <Text weight="bold">{label}:</Text>{" "}
            <Text weight={strongValue ? "bold" : "regular"}>{String(value)}</Text>
        </Text>
    );
}

function ActionCounter({ icon, count }: { icon: string; count: number }) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text variant="subtitle">{icon}</Text>
            <Text variant="body" weight="semibold">
                {count}
            </Text>
        </View>
    );
}
