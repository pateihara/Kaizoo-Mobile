// app/(tabs)/desafios.tsx
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import Screen from "@/components/templates/Screen";
import { colors, spacing } from "@/theme";
import React from "react";
import { View } from "react-native";

type Challenge = {
    id: string;
    title: string;
    description: string;
    rewardXP: number;
    expiresInDays?: number;     // para ativos/disponíveis
    durationDays?: number;      // para disponíveis (tempo total)
    completed?: boolean;        // para concluídos
};

type CommunityEvent = {
    id: string;
    title: string;
    description: string;
    rewardXP: number;
    date: string;
    location: string;
};

const ACTIVE: Challenge[] = [
    { id: "a1", title: "Corrida Matinal", description: "Correr 3km pela manhã!", rewardXP: 45, expiresInDays: 4 },
    { id: "a2", title: "Corrida Matinal", description: "Correr 3km pela manhã!", rewardXP: 45, expiresInDays: 4 },
    { id: "a3", title: "Corrida Matinal", description: "Correr 3km pela manhã!", rewardXP: 45, expiresInDays: 4 },
];

const AVAILABLE: Challenge[] = [
    { id: "v1", title: "Corrida Matinal", description: "Correr 5km pela manhã!", rewardXP: 45, durationDays: 7 },
    { id: "v2", title: "Corrida Matinal", description: "Correr 5km pela manhã!", rewardXP: 45, durationDays: 7 },
];

const EVENTS: CommunityEvent[] = [
    {
        id: "e1",
        title: "Yoga ao Ar Livre",
        description: "Relaxe e recarregue suas energias ao ar livre!",
        rewardXP: 110,
        date: "10/06/2025",
        location: "Parque Barigui",
    },
    {
        id: "e2",
        title: "Maratona de Caridade",
        description: "Corra por uma causa e ajude a arrecadar fundos!",
        rewardXP: 1000,
        date: "15/08/2025",
        location: "—",
    },
    {
        id: "e3",
        title: "Corrida Virtual",
        description: "Participe da corrida virtual de 5km e conquiste novas medalhas!",
        rewardXP: 210,
        date: "07/09/2025",
        location: "—",
    },
];

const COMPLETED: Challenge[] = [
    { id: "c1", title: "Corrida Matinal", description: "Finalizado com Sucesso!", rewardXP: 45, completed: true },
    { id: "c2", title: "Corrida Matinal", description: "Finalizado com Sucesso!", rewardXP: 45, completed: true },
    { id: "c3", title: "Corrida Matinal", description: "Finalizado com Sucesso!", rewardXP: 45, completed: true },
];

export default function DesafiosPage() {
    return (
        <Screen>
            <Text variant="title" weight="bold" style={{ marginBottom: spacing.sm }}>
                Desafios
            </Text>

            {/* Desafios Ativos */}
            <Section title="Desafios Ativos">
                {ACTIVE.map((ch) => (
                    <ChallengeItem
                        key={ch.id}
                        challenge={ch}
                        bgColor={colors.mascots.navajoWhite}
                        footerLine={`Expira em: `}
                        footerStrong={`${ch.expiresInDays} dias`}
                    />
                ))}
            </Section>

            {/* Desafios Disponíveis */}
            <Section title="Desafios Disponíveis">
                {AVAILABLE.map((ch) => (
                    <ChallengeItem
                        key={ch.id}
                        challenge={ch}
                        bgColor={colors.mascots.lightSteelBlue}
                        footerLine={`Tempo de duração: `}
                        footerStrong={`${ch.durationDays} dias`}
                    >
                        <Button label="Adicionar Desafio" fullWidth style={{ marginTop: spacing.sm }} />
                    </ChallengeItem>
                ))}
            </Section>

            {/* Eventos da Comunidade */}
            <Section title="Eventos da Comunidade">
                {EVENTS.map((ev) => (
                    <EventItem key={ev.id} event={ev}>
                        <Button label="Participar do Evento" fullWidth style={{ marginTop: spacing.sm }} />
                    </EventItem>
                ))}
            </Section>

            {/* Desafios Concluídos */}
            <Section title="Desafios Concluídos">
                {COMPLETED.map((ch) => (
                    <ChallengeItem
                        key={ch.id}
                        challenge={ch}
                        bgColor={colors.gray[200]}
                        muted
                        footerLine="Recompensa: "
                        footerStrong={`${ch.rewardXP}XP`}
                    />
                ))}
            </Section>

            <View style={{ height: spacing.lg }} />
        </Screen>
    );
}

/** ---------- helpers locais (organisms/molecules inline) ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Card style={{ padding: spacing.md }}>
            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
                {title}
            </Text>
            <View style={{ gap: spacing.md }}>{children}</View>
        </Card>
    );
}

function ChallengeItem({
    challenge,
    bgColor,
    footerLine,
    footerStrong,
    muted,
    children,
}: {
    challenge: Challenge;
    bgColor: string;
    footerLine: string;
    footerStrong: string;
    muted?: boolean;
    children?: React.ReactNode;
}) {
    return (
        <View
            style={{
                backgroundColor: bgColor,
                borderRadius: 16,
                padding: spacing.md,
            }}
        >
            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.xs }}>
                {/* pequeno ícone/emoji para lembrar o mock */}
                <Text>🧍‍♂️ </Text>
                {challenge.title}
            </Text>

            <Text variant="body" style={{ marginBottom: 2 }}>
                {challenge.description}
            </Text>
            <Text variant="body">
                Recompensa: <Text weight="bold">{challenge.rewardXP}XP</Text>
            </Text>

            {footerLine ? (
                <Text variant="body" style={{ marginTop: 2, opacity: muted ? 0.8 : 1 }}>
                    {footerLine}
                    <Text weight="bold">{footerStrong}</Text>
                </Text>
            ) : null}

            {children}
        </View>
    );
}

function EventItem({
    event,
    children,
}: {
    event: CommunityEvent;
    children?: React.ReactNode;
}) {
    return (
        <View
            style={{
                backgroundColor: colors.mascots.thistle,
                borderRadius: 16,
                padding: spacing.md,
            }}
        >
            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.xs }}>
                <Text>🗓️ </Text>
                {event.title}
            </Text>

            <Text variant="body" style={{ marginBottom: spacing.xs }}>
                {event.description}
            </Text>

            <Text variant="body">
                Recompensa: <Text weight="bold">{event.rewardXP}XP</Text>
            </Text>
            <Text variant="body">Data: <Text weight="bold">{event.date}</Text></Text>
            {event.location && (
                <Text variant="body">Local: <Text weight="bold">{event.location}</Text></Text>
            )}

            {children}
        </View>
    );
}
