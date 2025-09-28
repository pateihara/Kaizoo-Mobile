// app/(tabs)/desafios.tsx
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import Screen from "@/components/templates/Screen";
import type {
    ActivityKey,
    ChallengeBase,
    ChallengeExt as ChallengeExtStore,
    Intensity,
} from "@/contexts/ActivityContext";
import {
    estimateCaloriesFor,
    useActivityStore,
} from "@/contexts/ActivityContext";
import { colors, spacing } from "@/theme";
import React, { useMemo, useState } from "react";
import { View } from "react-native";

type CommunityEvent = ChallengeBase & {
    date: string;
    location: string;
};

// --------- mocks com MÉTRICAS definidas ----------
const AVAILABLE_SOURCE: ChallengeBase[] = [
    {
        id: "v1",
        title: "Corrida Matinal 5km",
        description: "Correr 5km pela manhã!",
        rewardXP: 45,
        durationDays: 7,
        metricType: "corrida",
        metricDistanceKm: 5,
        metricDurationMin: 35,     // ~7 min/km
        metricIntensity: "high",
    },
    {
        id: "v2",
        title: "Alongamento Diário",
        description: "10 minutos de alongamento por dia.",
        rewardXP: 30,
        durationDays: 5,
        metricType: "alongamento",
        metricDurationMin: 10,
        metricIntensity: "low",
    },
];

const EVENTS_SOURCE: CommunityEvent[] = [
    {
        id: "e1",
        title: "Yoga ao Ar Livre",
        description: "Relaxe e recarregue suas energias ao ar livre!",
        rewardXP: 110,
        date: "10/06/2025",
        location: "Parque Barigui",
        metricType: "yoga",
        metricDurationMin: 45,
        metricIntensity: "medium",
    },
    {
        id: "e2",
        title: "Maratona de Caridade 10km",
        description: "Corra por uma causa e ajude a arrecadar fundos!",
        rewardXP: 1000,
        date: "15/08/2025",
        location: "—",
        metricType: "corrida",
        metricDistanceKm: 10,
        metricDurationMin: 70,
        metricIntensity: "high",
    },
    {
        id: "e3",
        title: "Corrida Virtual 5km",
        description: "Participe da corrida virtual de 5km e conquiste novas medalhas!",
        rewardXP: 210,
        date: "07/09/2025",
        location: "",
        metricType: "corrida",
        metricDistanceKm: 5,
        metricDurationMin: 35,
        metricIntensity: "high",
    },
];

export default function DesafiosPage() {
    const {
        activeChallenges,
        completedChallenges,
        addAvailableChallengeToActive,
        joinEventToActive,
        completeChallenge,
        addActivity,
    } = useActivityStore();

    const [available, setAvailable] = useState<ChallengeBase[]>(AVAILABLE_SOURCE);
    const [events] = useState<CommunityEvent[]>(EVENTS_SOURCE);

    const activeIds = useMemo(() => new Set(activeChallenges.map(a => a.id)), [activeChallenges]);

    // ---------- helpers ----------
    const guessType = (title: string, desc: string): ActivityKey => {
        const t = (title + " " + desc).toLowerCase();
        if (t.includes("corrid")) return "corrida";
        if (t.includes("caminh")) return "caminhada";
        if (t.includes("pedal") || t.includes("bike") || t.includes("cicl")) return "pedalada";
        if (t.includes("yoga")) return "yoga";
        if (t.includes("alonga")) return "alongamento";
        return "outro";
    };

    const extractKm = (text: string): number | undefined => {
        const m = text.toLowerCase().match(/(\d+(?:[.,]\d+)?)\s*km/);
        if (!m) return undefined;
        return parseFloat(m[1].replace(",", "."));
    };

    const extractMinutes = (text: string): number | undefined => {
        const t = text.toLowerCase();
        const m1 = t.match(/(\d+)\s*(?:min|minutos?)/);
        if (m1) return parseInt(m1[1], 10);
        const m2 = t.match(/(\d+)\s*(?:h|hora?s?)/);
        if (m2) return parseInt(m2[1], 10) * 60;
        return undefined;
    };

    const estimateDuration = (type: ActivityKey, distanceKm?: number, minutesHint?: number): number => {
        if (typeof minutesHint === "number") return minutesHint;
        if (typeof distanceKm === "number") {
            switch (type) {
                case "caminhada": return Math.round(distanceKm * 12);
                case "corrida": return Math.round(distanceKm * 7);
                case "pedalada": return Math.round(distanceKm * 3);
            }
        }
        switch (type) {
            case "alongamento": return 15;
            case "yoga": return 30;
            default: return 30;
        }
    };

    const defaultIntensity = (type: ActivityKey): Intensity => {
        switch (type) {
            case "alongamento": return "low";
            case "corrida": return "high";
            case "yoga": return "medium";
            default: return "medium";
        }
    };

    const formatDurationHuman = (min?: number) => {
        if (typeof min !== "number") return "—";
        const h = Math.floor(min / 60);
        const m = min % 60;
        if (h && m) return `${h}h ${m}min`;
        if (h) return `${h}h`;
        return `${m}min`;
    };

    const formatDistanceHuman = (km?: number) => {
        if (typeof km !== "number") return "—";
        return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
    };

    const caloriesPreview = (ch: ChallengeExtStore) => {
        const t = ch.metricType ?? guessType(ch.title, ch.description);
        const dur = ch.metricDurationMin ?? estimateDuration(t, ch.metricDistanceKm, extractMinutes(ch.description));
        const intensity = ch.metricIntensity ?? defaultIntensity(t);
        const kcal = ch.metricCalories ?? estimateCaloriesFor(t, dur, intensity);
        return `${kcal} kcal`;
    };

    const onComplete = (ch: ChallengeExtStore) => {
        const type = ch.metricType ?? guessType(ch.title, ch.description);
        const durationMin =
            ch.metricDurationMin ?? estimateDuration(type, ch.metricDistanceKm, extractMinutes(ch.description));
        const distanceKm = ch.metricDistanceKm ?? extractKm(`${ch.title} ${ch.description}`);
        const intensity = ch.metricIntensity ?? defaultIntensity(type);

        // 👉 REGISTRA COM A DATA/HORA ATUAL (garante cair na semana vigente)
        const when = new Date();

        addActivity({
            type,
            dateISO: when.toISOString(),
            durationMin,
            distanceKm,
            intensity,
            mood: 4,
            environment: "open",
            calories: ch.metricCalories, // se vier, respeitamos
            notes: ch.fromEvent
                ? `Registro do evento: ${ch.eventTitle ?? ch.title} (data do evento: ${ch.eventDate ?? "—"})`
                : `Registro do desafio: ${ch.title}`,
        });

        completeChallenge(ch.id);
    };

    return (
        <Screen>
            <Text variant="title" weight="bold" style={{ marginBottom: spacing.sm }}>
                Desafios
            </Text>

            {/* Desafios Ativos */}
            <Section title="Desafios Ativos">
                {activeChallenges.length === 0 ? (
                    <EmptyState
                        text="Você ainda não tem desafios ativos."
                        hint="Adicione um desafio disponível ou participe de um evento da comunidade."
                    />
                ) : (
                    activeChallenges.map((ch) => (
                        <ChallengeItem
                            key={ch.id}
                            challenge={ch}
                            bgColor={colors.mascots.navajoWhite}
                            footerLine={ch.fromEvent ? undefined : "Expira em: "}
                            footerStrong={ch.fromEvent ? undefined : `${ch.expiresInDays ?? "—"} dias`}
                            meta={{
                                duration: formatDurationHuman(ch.metricDurationMin),
                                distance: formatDistanceHuman(ch.metricDistanceKm),
                                xp: `${ch.rewardXP} XP`,
                                calories: caloriesPreview(ch),
                            }}
                        >
                            <Button
                                label="Concluir desafio"
                                fullWidth
                                onPress={() => onComplete(ch)}
                                style={{ marginTop: spacing.sm }}
                            />
                        </ChallengeItem>
                    ))
                )}
            </Section>

            {/* Desafios Disponíveis */}
            <Section title="Desafios Disponíveis">
                {available.length === 0 ? (
                    <EmptyState text="Sem novos desafios no momento." hint="Fique de olho, em breve teremos mais!" />
                ) : (
                    available.map((ch) => (
                        <ChallengeItem
                            key={ch.id}
                            challenge={ch as unknown as ChallengeExtStore}
                            bgColor={colors.mascots.lightSteelBlue}
                            footerLine="Tempo de duração: "
                            footerStrong={`${ch.durationDays ?? "—"} dias`}
                            meta={{
                                duration: formatDurationHuman(ch.metricDurationMin),
                                distance: formatDistanceHuman(ch.metricDistanceKm),
                                xp: `${ch.rewardXP} XP`,
                                calories: (() => {
                                    const t = ch.metricType ?? guessType(ch.title, ch.description);
                                    const dur = ch.metricDurationMin ?? estimateDuration(t, ch.metricDistanceKm, extractMinutes(ch.description));
                                    const intensity = ch.metricIntensity ?? defaultIntensity(t);
                                    const kcal = ch.metricCalories ?? estimateCaloriesFor(t, dur, intensity);
                                    return `${kcal} kcal`;
                                })(),
                            }}
                        >
                            <Button
                                label={activeIds.has(ch.id) ? "Já adicionado" : "Adicionar Desafio"}
                                fullWidth
                                disabled={activeIds.has(ch.id)}
                                onPress={() => {
                                    addAvailableChallengeToActive(ch);
                                    setAvailable((prev) => prev.filter((v) => v.id !== ch.id));
                                }}
                                style={{ marginTop: spacing.sm }}
                            />
                        </ChallengeItem>
                    ))
                )}
            </Section>

            {/* Eventos da Comunidade */}
            <Section title="Eventos da Comunidade">
                {events.map((ev) => {
                    const syntheticId = `ev-${ev.id}`;
                    const alreadyJoined = activeIds.has(syntheticId);
                    return (
                        <EventItem
                            key={ev.id}
                            event={ev}
                            meta={{
                                duration: formatDurationHuman(ev.metricDurationMin),
                                distance: formatDistanceHuman(ev.metricDistanceKm),
                                xp: `${ev.rewardXP} XP`,
                                calories: (() => {
                                    const t = ev.metricType ?? guessType(ev.title, ev.description);
                                    const dur = ev.metricDurationMin ?? estimateDuration(t, ev.metricDistanceKm, extractMinutes(ev.description));
                                    const intensity = ev.metricIntensity ?? defaultIntensity(t);
                                    const kcal = ev.metricCalories ?? estimateCaloriesFor(t, dur, intensity);
                                    return `${kcal} kcal`;
                                })(),
                            }}
                        >
                            <Button
                                label={alreadyJoined ? "Já participando" : "Participar do Evento"}
                                fullWidth
                                disabled={alreadyJoined}
                                onPress={() =>
                                    joinEventToActive({
                                        ...ev,
                                        date: ev.date,
                                        location: ev.location,
                                    })
                                }
                                style={{ marginTop: spacing.sm }}
                            />
                        </EventItem>
                    );
                })}
            </Section>

            {/* Desafios Concluídos */}
            <Section title="Desafios Concluídos">
                {completedChallenges.length === 0 ? (
                    <EmptyState text="Nenhum desafio concluído ainda." hint="Quando concluir, eles aparecem aqui." />
                ) : (
                    completedChallenges.map((ch, idx) => (
                        <ChallengeItem
                            key={ch.instanceId ?? `${ch.id}-${idx}` /* chave sempre única */}
                            challenge={ch}
                            bgColor={colors.gray[200]}
                            muted
                            footerLine={ch.fromEvent ? undefined : "Tempo de duração: "}
                            footerStrong={
                                ch.fromEvent
                                    ? undefined
                                    : `${(ch as any).durationDays ?? ch.expiresInDays ?? "—"} dias`
                            }
                            meta={{
                                duration: formatDurationHuman(ch.metricDurationMin),
                                distance: formatDistanceHuman(ch.metricDistanceKm),
                                xp: `${ch.rewardXP} XP`,
                                calories: caloriesPreview(ch),
                            }}
                        />
                    ))
                )}
            </Section>

            <View style={{ height: spacing.lg }} />
        </Screen>
    );
}

/** ---------- helpers UI ---------- */

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

function EmptyState({ text, hint }: { text: string; hint?: string }) {
    return (
        <View
            style={{
                backgroundColor: colors.gray[200],
                borderRadius: 16,
                padding: spacing.md,
            }}
        >
            <Text variant="body" weight="bold" style={{ marginBottom: 4 }}>
                {text}
            </Text>
            {hint ? <Text variant="body" style={{ opacity: 0.8 }}>{hint}</Text> : null}
        </View>
    );
}

function MetaRow({
    duration,
    distance,
    xp,
    calories,
}: {
    duration?: string;
    distance?: string;
    xp?: string;
    calories?: string;
}) {
    const Item = ({ label, value }: { label: string; value?: string }) => (
        <View
            style={{
                backgroundColor: "rgba(0,0,0,0.06)",
                borderRadius: 999,
                paddingVertical: 6,
                paddingHorizontal: 10,
            }}
        >
            <Text variant="body">
                <Text weight="bold">{label}: </Text>
                {value ?? "—"}
            </Text>
        </View>
    );

    return (
        <View
            style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: spacing.xs,
                marginTop: spacing.sm,
            }}
        >
            <Item label="Duração" value={duration} />
            <Item label="Distância" value={distance} />
            <Item label="XP" value={xp} />
            <Item label="Calorias" value={calories} />
        </View>
    );
}

function ChallengeItem({
    challenge,
    bgColor,
    footerLine,
    footerStrong,
    muted,
    meta,
    children,
}: {
    challenge: ChallengeExtStore;
    bgColor: string;
    footerLine?: string;
    footerStrong?: string;
    muted?: boolean;
    meta?: { duration?: string; distance?: string; xp?: string; calories?: string };
    children?: React.ReactNode;
}) {
    const isEvent = !!challenge.fromEvent;
    const eventTitle = challenge.eventTitle ?? challenge.title;
    const eventDate = challenge.eventDate ?? "A definir";
    const eventLocation = challenge.eventLocation ?? "Parque do Ibirapuera";

    return (
        <View
            style={{
                backgroundColor: bgColor,
                borderRadius: 16,
                padding: spacing.md,
            }}
        >
            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.xs }}>
                <Text>🧍‍♂️ </Text>
                {challenge.title}
            </Text>

            <Text variant="body" style={{ marginBottom: 2 }}>
                {challenge.description}
            </Text>

            {isEvent && (
                <View style={{ marginTop: spacing.xs }}>
                    <Text variant="body">
                        Evento: <Text weight="bold">{eventTitle}</Text>
                    </Text>
                    <Text variant="body">
                        Data: <Text weight="bold">{eventDate}</Text>
                    </Text>
                    <Text variant="body">
                        Local: <Text weight="bold">{eventLocation}</Text>
                    </Text>
                </View>
            )}

            {meta ? <MetaRow {...meta} /> : null}

            {footerLine && footerStrong ? (
                <Text variant="body" style={{ marginTop: 6, opacity: muted ? 0.8 : 1 }}>
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
    meta,
    children,
}: {
    event: CommunityEvent;
    meta?: { duration?: string; distance?: string; xp?: string; calories?: string };
    children?: React.ReactNode;
}) {
    const location = event.location && event.location !== "—" ? event.location : "Parque do Ibirapuera";
    const date = event.date || "A definir";

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

            {meta ? <MetaRow {...meta} /> : null}

            <Text variant="body" style={{ marginTop: spacing.xs }}>
                Data: <Text weight="bold">{date}</Text>
            </Text>
            <Text variant="body">
                Local: <Text weight="bold">{location}</Text>
            </Text>

            {children}
        </View>
    );
}
