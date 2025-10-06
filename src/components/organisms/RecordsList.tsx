// src/components/organisms/RecordsList.tsx
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import RecordItem from "@/components/molecules/RecordItem";
import { useActivityStore } from "@/contexts/ActivityContext";
import { radius, spacing } from "@/theme";
import React, { useMemo } from "react";
import { View } from "react-native";

function weekKey(d: Date) {
    const x = new Date(d);
    const day = x.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    x.setDate(x.getDate() + diff);
    x.setHours(0, 0, 0, 0);
    return x.toISOString().slice(0, 10); // yyyy-mm-dd (segunda)
}
function fmtDuration(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${m} min`;
}
function round1(n: number) {
    return Math.round(n * 10) / 10;
}

export default function RecordsList() {
    const { activities } = useActivityStore();

    const { maxKm, maxMin, bestWeekDays } = useMemo(() => {
        let mxKm = 0;
        let mxMin = 0;
        const byWeek = new Map<string, Set<string>>();

        for (const a of activities) {
            mxKm = Math.max(mxKm, a.distanceKm || 0);
            mxMin = Math.max(mxMin, a.durationMin || 0);

            const d = new Date(a.dateISO);
            const key = weekKey(d);
            if (!byWeek.has(key)) byWeek.set(key, new Set<string>());
            byWeek.get(key)!.add(d.toDateString());
        }

        let bestWeek = 0;
        for (const set of byWeek.values()) bestWeek = Math.max(bestWeek, set.size);

        return { maxKm: mxKm, maxMin: mxMin, bestWeekDays: bestWeek };
    }, [activities]);

    return (
        <Card style={{ padding: spacing.md }}>
            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
                🏆 Recordes Pessoais
            </Text>

            <View style={{ gap: 6 }}>
                <RecordItem label="Maior distância percorrida" value={`${round1(maxKm)} km`} />
                <RecordItem label="Maior tempo de atividade" value={fmtDuration(maxMin)} />
                <RecordItem label="Semana mais ativa" value={`${bestWeekDays} dia(s)`} />
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
                <Text variant="body" weight="bold">🐾 Continue assim para bater novos recordes!</Text>
            </View>
        </Card>
    );
}
