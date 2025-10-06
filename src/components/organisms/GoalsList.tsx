// src/components/organisms/GoalsList.tsx
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import GoalItem from "@/components/molecules/GoalItem";
import { useActivityStore } from "@/contexts/ActivityContext";
import { radius, spacing } from "@/theme";
import React, { useMemo } from "react";
import { View } from "react-native";

function startOfWeek(d = new Date()) {
    const x = new Date(d);
    const day = x.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    x.setDate(x.getDate() + diff);
    x.setHours(0, 0, 0, 0);
    return x;
}
function endOfWeek(d = new Date()) {
    const s = startOfWeek(d);
    const e = new Date(s);
    e.setDate(s.getDate() + 7);
    e.setHours(0, 0, 0, 0);
    return e;
}
function isoToDate(iso: string) {
    return new Date(iso);
}

export default function GoalsList() {
    const { activities, activeChallenges, completedChallenges } = useActivityStore();

    const weekStats = useMemo(() => {
        const s = startOfWeek();
        const e = endOfWeek();
        const weekActs = activities.filter((a) => {
            const d = isoToDate(a.dateISO);
            return d >= s && d < e;
        });

        const dayKeys = new Set<string>();
        let min = 0;
        let km = 0;
        let ran3plus = false;

        for (const a of weekActs) {
            dayKeys.add(new Date(a.dateISO).toDateString());
            min += a.durationMin || 0;
            km += a.distanceKm || 0;
            if (a.type === "corrida" && a.durationMin >= 3) ran3plus = true;
        }
        return { days: dayKeys.size, mins: min, km, ran3plus };
    }, [activities]);

    // metas “core”
    const coreGoals = [
        {
            id: "g-days5",
            label: "Se manter ativo por 5 dias",
            done: weekStats.days >= 5,
        },
        {
            id: "g-km7",
            label: "Percorrer 7 km em uma semana",
            done: weekStats.km >= 7,
        },
        {
            id: "g-run3",
            label: "Correr por 3 min. seguidos",
            done: weekStats.ran3plus,
        },
    ];

    // metas derivadas de desafios/eventos ativos
    const dynamicGoals = activeChallenges.map((c) => ({
        id: `c-${c.id}`,
        label: c.fromEvent ? `Participar: ${c.title}` : `Completar: ${c.title}`,
        done: !!completedChallenges.find((x) => x.id === c.id),
    }));

    const allGoals = [...coreGoals, ...dynamicGoals];
    const remaining = allGoals.filter((g) => !g.done).length;

    return (
        <Card style={{ padding: spacing.md }}>
            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
                🎯 Metas da Semana
            </Text>

            <View style={{ gap: spacing.sm }}>
                {allGoals.map((g) => (
                    <GoalItem key={g.id} label={g.label} done={g.done} />
                ))}
            </View>

            <View
                style={{
                    backgroundColor: "#FFE3B3",
                    borderRadius: radius.lg,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    alignItems: "center",
                    marginTop: spacing.md,
                }}
            >
                <Text variant="body" weight="bold">
                    🐾 {remaining === 0 ? "Mandou bem! Todas as metas concluídas." : `Faltam ${remaining} meta${remaining > 1 ? "s" : ""}!`}
                </Text>
            </View>
        </Card>
    );
}
