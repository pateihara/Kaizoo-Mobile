// app/(tabs)/desafios.tsx
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import Screen from "@/components/templates/Screen";
import {
    estimateCaloriesFor,
    useActivitySelector,
    type ChallengeExt as ChallengeExtStore,
} from "@/contexts/ActivityContext";

import { useAuth } from "@/contexts/AuthContext";
import { bus } from "@/lib/bus";
import { createActivity, type ActivityPayload } from "@/services/activities";
import type { ActivityKey, Intensity } from "@/services/challenges";
import {
    activateAvailableChallenge,
    completeChallengeServer,
    joinChallengeEvent,
    listAvailableChallenges,
    listChallenges,
    listCommunityEvents,
    type Challenge as ChallengeAPI,
    type CommunityEvent,
} from "@/services/challenges";
import { colors, spacing } from "@/theme";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";

/* --------- mocks com MÉTRICAS definidas ---------- */
type ChallengeBase = {
    id: string;
    title: string;
    description?: string;
    rewardXP: number;
    durationDays?: number;
    expiresInDays?: number;
    metricType?: ActivityKey;
    metricDurationMin?: number;
    metricDistanceKm?: number;
    metricIntensity?: Intensity;
    metricCalories?: number;
};

const AVAILABLE_SOURCE: ChallengeBase[] = [
    {
        id: "v1",
        title: "Corrida Matinal 5km",
        description: "Correr 5km pela manhã!",
        rewardXP: 45,
        durationDays: 7,
        metricType: "corrida",
        metricDistanceKm: 5,
        metricDurationMin: 35,
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
    // ===== Store (via selector real de Context) =====
    const activeChallenges = useActivitySelector((s) => s.activeChallenges ?? []);
    const completedChallenges = useActivitySelector((s) => s.completedChallenges ?? []);

    const setActiveFromServer = useActivitySelector((s) => s.setActiveFromServer);
    const addAvailableChallengeToActive = useActivitySelector((s) => s.addAvailableChallengeToActive);
    const joinEventToActive = useActivitySelector((s) => s.joinEventToActive);
    const completeFromServer = useActivitySelector((s) => s.completeFromServer);
    const pushActivity = useActivitySelector((s) => s.pushActivity);

    const { token } = useAuth() as { token?: string }; // se não usar, pode remover

    // ===== Local state =====
    const [available, setAvailable] = useState<ChallengeBase[]>(AVAILABLE_SOURCE);
    const [events, setEvents] = useState<CommunityEvent[]>(EVENTS_SOURCE);
    const [loading, setLoading] = useState(true);

    const [joining, setJoining] = useState<Record<string, boolean>>({});
    const [completing, setCompleting] = useState<Record<string, boolean>>({});
    const [activating, setActivating] = useState<Record<string, boolean>>({});

    // ===== Espelho local dos ativos (garante UI reativa mesmo sem store) =====
    const [activeMirror, setActiveMirror] = useState<ChallengeExtStore[]>([]);

    // Hidratação: mescla (não apaga quando vier vazio)
    useEffect(() => {
        if (Array.isArray(activeChallenges) && activeChallenges.length > 0) {
            mergeIntoActiveMirror(activeChallenges as any);
        }
    }, [activeChallenges]);

    // dedup dos ativos (no espelho)
    const activeUnique = useMemo(() => {
        const out: ChallengeExtStore[] = [];
        const seen = new Set<string>();
        const src = Array.isArray(activeMirror) ? activeMirror : [];
        for (let i = 0; i < src.length; i++) {
            const c = src[i];
            if (!c || typeof c !== "object") continue;
            const key = String((c as any).id ?? "");
            if (!key || seen.has(key)) continue;
            seen.add(key);
            out.push(c);
        }
        return out;
    }, [activeMirror]);

    const activeIds = useMemo(() => {
        const set = new Set<string>();
        const src = Array.isArray(activeUnique) ? activeUnique : [];
        for (let i = 0; i < src.length; i++) {
            const id = String(src[i]?.id ?? "");
            if (id) set.add(id);
        }
        return set;
    }, [activeUnique]);

    // << chave para filtrar por fonte >>
    const activeSourceIds = useMemo(() => {
        const s = new Set<string>();
        const src = Array.isArray(activeUnique) ? activeUnique : [];
        for (let i = 0; i < src.length; i++) {
            const sid = String(src[i]?.sourceId ?? src[i]?.id ?? "");
            if (sid) s.add(sid);
        }
        return s;
    }, [activeUnique]);

    // ---------- API fetch com fallback ----------
    useEffect(() => {
        (async () => {
            try {
                const [availRes, eventsRes] = await Promise.allSettled([
                    listAvailableChallenges(),
                    listCommunityEvents(),
                ]);

                if (availRes.status === "fulfilled" && Array.isArray(availRes.value)) {
                    const list = availRes.value as ChallengeAPI[];
                    const filtered = list.filter((c) => !activeSourceIds.has(c.id));
                    setAvailable(filtered as any);
                } else {
                    setAvailable(AVAILABLE_SOURCE.filter((c) => !activeSourceIds.has(c.id)));
                }

                if (eventsRes.status === "fulfilled" && Array.isArray(eventsRes.value)) {
                    setEvents(eventsRes.value);
                } else {
                    setEvents(EVENTS_SOURCE);
                }
            } catch (e: any) {
                console.log("[Desafios] erro ao carregar da API:", e?.message);
                Alert.alert(
                    "Aviso",
                    "Não foi possível carregar desafios da comunidade agora. Mostrando conteúdo padrão."
                );
                setAvailable(AVAILABLE_SOURCE.filter((c) => !activeSourceIds.has(c.id)));
                setEvents(EVENTS_SOURCE);
            } finally {
                setLoading(false);
            }
        })();
    }, [activeSourceIds]);

    // ---------- helpers ----------
    const guessType = (title: string, desc?: string): ActivityKey => {
        const t = (title + " " + (desc ?? "")).toLowerCase();
        if (t.includes("corrid")) return "corrida";
        if (t.includes("caminh")) return "caminhada";
        if (t.includes("pedal") || t.includes("bike") || t.includes("cicl")) return "pedalada";
        if (t.includes("yoga")) return "yoga";
        if (t.includes("alonga")) return "alongamento";
        return "outro";
    };

    const extractKm = (text?: string): number | undefined => {
        if (!text) return undefined;
        const m = text.toLowerCase().match(/(\d+(?:[.,]\d+)?)\s*km/);
        if (!m) return undefined;
        return parseFloat(m[1].replace(",", "."));
    };

    const extractMinutes = (text?: string): number | undefined => {
        if (!text) return undefined;
        const t = text.toLowerCase();
        const m1 = t.match(/(\d+)\s*(?:min|minutos?)/);
        if (m1) return parseInt(m1[1], 10);
        const m2 = t.match(/(\d+)\s*(?:h|hora?s?)/);
        if (m2) return parseInt(m2[1], 10) * 60;
        return undefined;
    };

    const estimateDuration = (
        type: ActivityKey,
        distanceKm?: number,
        minutesHint?: number
    ): number => {
        if (typeof minutesHint === "number") return minutesHint;
        if (typeof distanceKm === "number") {
            switch (type) {
                case "caminhada":
                    return Math.round(distanceKm * 12);
                case "corrida":
                    return Math.round(distanceKm * 7);
                case "pedalada":
                    return Math.round(distanceKm * 3);
            }
        }
        switch (type) {
            case "alongamento":
                return 15;
            case "yoga":
                return 30;
            default:
                return 30;
        }
    };

    const defaultIntensity = (type: ActivityKey): Intensity => {
        switch (type) {
            case "alongamento":
                return "low";
            case "corrida":
                return "high";
            case "yoga":
                return "medium";
            default:
                return "medium";
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
        const dur =
            ch.metricDurationMin ??
            estimateDuration(t, ch.metricDistanceKm, extractMinutes(ch.description));
        const intensity = ch.metricIntensity ?? defaultIntensity(t);
        const kcal = ch.metricCalories ?? estimateCaloriesFor(t, dur, intensity);
        return `${kcal} kcal`;
    };

    // === helper pra criar atividade local/POST ===
    function buildActivityPayloadFromChallenge(ch: ChallengeExtStore): ActivityPayload {
        const t = (ch.metricType ?? guessType(ch.title, ch.description)) as ActivityPayload["type"];
        const dur =
            ch.metricDurationMin ??
            estimateDuration(t as ActivityKey, ch.metricDistanceKm, extractMinutes(ch.description));
        const intensity = (ch.metricIntensity ?? defaultIntensity(t as ActivityKey)) as ActivityPayload["intensity"];
        const kcal = ch.metricCalories ?? estimateCaloriesFor(t as ActivityKey, dur, intensity as any);

        return {
            type: t,
            dateISO: new Date().toISOString(),
            durationMin: dur,
            distanceKm: ch.metricDistanceKm,
            intensity,
            mood: 3,
            environment: "open",
            notes: `Gerada ao concluir "${ch.title}"`,
            calories: kcal,
        };
    }

    // ---------- helpers locais para atualizar o espelho ----------
    const mergeIntoActiveMirror = (items: ChallengeExtStore[] | ChallengeAPI[]) => {
        const arr = Array.isArray(items) ? items : [items];
        const normalized: ChallengeExtStore[] = (arr as any[]).map((c: any) => ({
            id: String(c.id),
            sourceId: String(c.sourceId ?? c.id),
            title: String(c.title ?? ""),
            description: c.description ?? "",
            rewardXP: Number(c.rewardXP ?? 0),
            status: (c.status ?? "active") as any,
            expiresInDays: c.expiresInDays,
            durationDays: c.durationDays,
            metricType: c.metricType,
            metricDurationMin: c.metricDurationMin,
            metricDistanceKm: c.metricDistanceKm,
            metricIntensity: c.metricIntensity,
            metricCalories: c.metricCalories,
            fromEvent: !!c.fromEvent,
            eventTitle: c.eventTitle,
            eventDate: c.eventDate,
            eventLocation: c.eventLocation,
            startedAt: c.startedAt,
            instanceId: c.instanceId,
            completedAt: c.completedAt,
        }));

        setActiveMirror((prev) => {
            const prevArr = Array.isArray(prev) ? prev : [];
            const map = new Map<string, ChallengeExtStore>();
            [...prevArr, ...normalized].forEach((it) => {
                if (it?.id) map.set(it.id, it);
            });
            return Array.from(map.values());
        });
    };

    const refetchAndMirrorActives = async () => {
        try {
            const serverActives = await listChallenges("active");
            setActiveFromServer?.(serverActives as any);
            mergeIntoActiveMirror(serverActives as any);
        } catch { }
    };

    // ---------- JOIN (Evento) ----------
    const handleJoinEvent = async (ev: CommunityEvent) => {
        if (joining[ev.id]) return;
        try {
            setJoining((m) => ({ ...m, [ev.id]: true }));

            const created = await joinChallengeEvent({
                id: ev.id,
                title: ev.title,
                date: ev.date,
                location: ev.location,
            });

            if (typeof joinEventToActive === "function") {
                joinEventToActive({
                    id: created.id,
                    title: created.title,
                    description: created.description ?? "",
                    rewardXP: created.rewardXP,
                    status: "active",
                    expiresInDays: created.expiresInDays,
                    durationDays: created.durationDays,
                    metricType: created.metricType as ActivityKey | undefined,
                    metricDurationMin: created.metricDurationMin,
                    metricDistanceKm: created.metricDistanceKm,
                    metricIntensity: created.metricIntensity as Intensity | undefined,
                    metricCalories: created.metricCalories,
                    fromEvent: true,
                    eventTitle: created.eventTitle ?? created.title,
                    eventDate: created.eventDate,
                    eventLocation: created.eventLocation,
                    startedAt: created.startedAt,
                    sourceId: (created as any).sourceId ?? ev.id,
                } as any);
            } else {
                console.warn("[Desafios] joinEventToActive ausente — usando fallback local.");
            }

            // espelho local garante UI
            mergeIntoActiveMirror([{ ...created, sourceId: (created as any).sourceId ?? ev.id } as any]);

            Alert.alert("Inscrição confirmada", `Você entrou em: ${ev.title}`);
        } catch (e: any) {
            if (e?.status === 409) {
                await refetchAndMirrorActives();
                Alert.alert("Você já está participando", "Esse evento já está nos seus Desafios Ativos.");
            } else {
                Alert.alert("Não foi possível participar", String(e?.message ?? e));
            }
        } finally {
            setJoining((m) => ({ ...m, [ev.id]: false }));
        }
    };

    // ---------- COMPLETE ----------
    const onComplete = async (ch: ChallengeExtStore) => {
        if (completing[ch.id]) return;
        setCompleting((m) => ({ ...m, [ch.id]: true }));
        try {
            const { activeRemovedId, completedAdded, createdActivity } =
                await completeChallengeServer(ch.id);

            // Atualiza listas (ativo -> concluído)
            completeFromServer?.({
                activeRemovedId: activeRemovedId || ch.id,
                completedAdded: { ...completedAdded, status: "completed" } as any,
            });

            // Remove do espelho local
            setActiveMirror((prev) =>
                Array.isArray(prev) ? prev.filter((x) => x.id !== (activeRemovedId || ch.id)) : []
            );

            if (createdActivity) {
                // veio do servidor -> só empurra e dispara refresh das métricas
                pushActivity?.({
                    id: createdActivity.id,
                    type: createdActivity.type,
                    dateISO: createdActivity.dateISO,
                    durationMin: createdActivity.durationMin,
                    distanceKm: createdActivity.distanceKm,
                    intensity: createdActivity.intensity,
                    mood: createdActivity.mood,
                    environment: createdActivity.environment,
                    notes: createdActivity.notes,
                    calories: createdActivity.calories,
                });
                bus.emit("metrics:refresh");
            } else {
                // não veio atividade -> cria manualmente e persiste
                const payload = buildActivityPayloadFromChallenge(ch);
                try {
                    const saved = await createActivity(payload);
                    pushActivity?.({
                        id: saved.id,
                        type: saved.type,
                        dateISO: saved.dateISO,
                        durationMin: saved.durationMin,
                        distanceKm: saved.distanceKm,
                        intensity: saved.intensity,
                        mood: saved.mood,
                        environment: saved.environment,
                        notes: saved.notes,
                        calories: saved.calories,
                    });
                    bus.emit("metrics:refresh");
                } catch (err: any) {
                    console.warn("[Desafios] createActivity falhou:", err?.message);
                    // fallback local
                    pushActivity?.({
                        id: `local-${ch.id}-${Date.now()}`,
                        ...payload,
                    });
                    bus.emit("metrics:refresh");
                }
            }

            Alert.alert("Boa!", `Desafio concluído: ${ch.title}`);
        } catch (e: any) {
            if (String(e?.message || "").includes("404") || e?.status === 404) {
                // Fallback offline: conclui localmente e ainda tenta persistir a atividade
                completeFromServer?.({
                    activeRemovedId: ch.id,
                    completedAdded: {
                        ...ch,
                        status: "completed",
                        instanceId: `comp-${ch.id}-${Date.now()}`,
                        completedAt: new Date().toISOString(),
                    } as any,
                });
                setActiveMirror((prev) => (Array.isArray(prev) ? prev.filter((x) => x.id !== ch.id) : []));

                const payload = buildActivityPayloadFromChallenge(ch);
                try {
                    const saved = await createActivity(payload);
                    pushActivity?.({
                        id: saved.id,
                        type: saved.type,
                        dateISO: saved.dateISO,
                        durationMin: saved.durationMin,
                        distanceKm: saved.distanceKm,
                        intensity: saved.intensity,
                        mood: saved.mood,
                        environment: saved.environment,
                        notes: saved.notes,
                        calories: saved.calories,
                    });
                    bus.emit("metrics:refresh");
                } catch {
                    pushActivity?.({
                        id: `local-${ch.id}-${Date.now()}`,
                        ...payload,
                    });
                    bus.emit("metrics:refresh");
                }
            } else {
                Alert.alert("Erro ao concluir", String(e?.message ?? e));
            }
        } finally {
            setCompleting((m) => ({ ...m, [ch.id]: false }));
        }
    };

    return (
        <Screen>
            <Text variant="title" weight="bold" style={{ marginBottom: spacing.sm }}>
                Desafios
            </Text>

            {loading ? (
                <ActivityIndicator style={{ marginTop: spacing.md }} />
            ) : (
                <>
                    {/* Desafios Ativos */}
                    <Section title="Desafios Ativos">
                        {(activeUnique?.length ?? 0) === 0 ? (
                            <EmptyState
                                text="Você ainda não tem desafios ativos."
                                hint="Adicione um desafio disponível ou participe de um evento da comunidade."
                            />
                        ) : (
                            (Array.isArray(activeUnique) ? activeUnique : []).map((ch) => (
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
                                        loading={!!completing[ch.id]}
                                        disabled={!!completing[ch.id]}
                                        style={{ marginTop: spacing.sm }}
                                    />
                                </ChallengeItem>
                            ))
                        )}
                    </Section>

                    {/* Desafios Disponíveis */}
                    <Section title="Desafios Disponíveis">
                        {(available?.length ?? 0) === 0 ? (
                            <EmptyState text="Sem novos desafios no momento." hint="Fique de olho, em breve teremos mais!" />
                        ) : (
                            (Array.isArray(available) ? available : []).map((ch) => (
                                <ChallengeItem
                                    key={ch.id}
                                    challenge={
                                        {
                                            ...ch,
                                            status: "active",
                                        } as unknown as ChallengeExtStore
                                    }
                                    bgColor={colors.mascots.lightSteelBlue}
                                    footerLine="Tempo de duração: "
                                    footerStrong={`${ch.durationDays ?? "—"} dias`}
                                    meta={{
                                        duration: formatDurationHuman(ch.metricDurationMin),
                                        distance: formatDistanceHuman(ch.metricDistanceKm),
                                        xp: `${ch.rewardXP} XP`,
                                        calories: (() => {
                                            const t = ch.metricType ?? guessType(ch.title, ch.description);
                                            const dur =
                                                ch.metricDurationMin ??
                                                estimateDuration(t, ch.metricDistanceKm, extractMinutes(ch.description));
                                            const intensity = ch.metricIntensity ?? defaultIntensity(t);
                                            const kcal = ch.metricCalories ?? estimateCaloriesFor(t, dur, intensity);
                                            return `${kcal} kcal`;
                                        })(),
                                    }}
                                >
                                    <Button
                                        label={activeSourceIds.has(ch.id) ? "Já adicionado" : "Adicionar Desafio"}
                                        fullWidth
                                        disabled={activeSourceIds.has(ch.id) || !!activating[ch.id]}
                                        loading={!!activating[ch.id]}
                                        onPress={async () => {
                                            if (activating[ch.id]) return;
                                            setActivating((m) => ({ ...m, [ch.id]: true }));

                                            try {
                                                const created = await activateAvailableChallenge(ch);

                                                if (typeof addAvailableChallengeToActive === "function") {
                                                    addAvailableChallengeToActive({
                                                        id: created.id,
                                                        sourceId: (created as any).sourceId ?? ch.id,
                                                        title: created.title,
                                                        description: created.description ?? "",
                                                        rewardXP: created.rewardXP,
                                                        durationDays: created.durationDays,
                                                        expiresInDays: created.expiresInDays,
                                                        metricType: created.metricType as ActivityKey | undefined,
                                                        metricDurationMin: created.metricDurationMin,
                                                        metricDistanceKm: created.metricDistanceKm,
                                                        metricIntensity: created.metricIntensity as Intensity | undefined,
                                                        metricCalories: created.metricCalories,
                                                        startedAt: created.startedAt,
                                                    } as any);
                                                } else {
                                                    console.warn("[Desafios] addAvailableChallengeToActive ausente — usando fallback local.");
                                                }

                                                // espelho local
                                                mergeIntoActiveMirror([
                                                    { ...created, sourceId: (created as any).sourceId ?? ch.id } as any,
                                                ]);

                                                // remove dos disponíveis (id da fonte)
                                                setAvailable((prev) =>
                                                    Array.isArray(prev) ? prev.filter((v) => v.id !== ch.id) : []
                                                );
                                            } catch (e: any) {
                                                if (e?.status === 409) {
                                                    await refetchAndMirrorActives();
                                                    setAvailable((prev) =>
                                                        Array.isArray(prev)
                                                            ? prev.filter((v) => !activeSourceIds.has(v.id))
                                                            : []
                                                    );
                                                    Alert.alert("Já está ativo", "Esse desafio já está na sua lista de Ativos.");
                                                } else {
                                                    Alert.alert("Erro", String(e?.message ?? e));
                                                }
                                            } finally {
                                                setActivating((m) => ({ ...m, [ch.id]: false }));
                                            }
                                        }}
                                        style={{ marginTop: spacing.sm }}
                                    />
                                </ChallengeItem>
                            ))
                        )}
                    </Section>

                    {/* Eventos da Comunidade */}
                    <Section title="Eventos da Comunidade">
                        {(Array.isArray(events) ? events : []).map((ev) => {
                            const alreadyJoined = (activeUnique ?? []).some(
                                (a) => a?.fromEvent && String(a.sourceId ?? a.id) === ev.id
                            );
                            const isLoading = !!joining[ev.id];
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
                                            const dur =
                                                ev.metricDurationMin ??
                                                estimateDuration(t, ev.metricDistanceKm, extractMinutes(ev.description));
                                            const intensity = ev.metricIntensity ?? defaultIntensity(t);
                                            const kcal = ev.metricCalories ?? estimateCaloriesFor(t, dur, intensity);
                                            return `${kcal} kcal`;
                                        })(),
                                    }}
                                >
                                    <Button
                                        label={alreadyJoined ? "Já participando" : "Participar do Evento"}
                                        fullWidth
                                        disabled={alreadyJoined || isLoading}
                                        loading={isLoading}
                                        onPress={() => handleJoinEvent(ev)}
                                        style={{ marginTop: spacing.sm }}
                                    />
                                </EventItem>
                            );
                        })}
                    </Section>

                    {/* Desafios Concluídos */}
                    <Section title="Desafios Concluídos">
                        {(completedChallenges?.length ?? 0) === 0 ? (
                            <EmptyState text="Nenhum desafio concluído ainda." hint="Quando concluir, eles aparecem aqui." />
                        ) : (
                            (Array.isArray(completedChallenges) ? completedChallenges : []).map(
                                (ch: ChallengeExtStore, idx: number) => (
                                    <ChallengeItem
                                        key={ch.instanceId ?? `${ch.id}-${idx}`}
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
                                )
                            )
                        )}
                    </Section>

                    <View style={{ height: spacing.lg }} />
                </>
            )}
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
                opacity: muted ? 0.85 : 1,
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
    meta?: { duration?: string; distance?: string; calories?: string; xp?: string };
    children?: React.ReactNode;
}) {
    const location =
        event.location && event.location !== "—" ? event.location : "Parque do Ibirapuera";
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
