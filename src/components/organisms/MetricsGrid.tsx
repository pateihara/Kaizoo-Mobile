// src/components/organisms/MetricsGrid.tsx
import MetricCard from "@/components/molecules/MetricCard";
import { useActivityStore } from "@/contexts/ActivityContext";
import { colors, spacing } from "@/theme";
import React, { useMemo } from "react";
import { View } from "react-native";

function startOfWeek(d = new Date()) {
    const x = new Date(d);
    const day = x.getDay(); // 0=Dom, 1=Seg...
    const diff = (day === 0 ? -6 : 1) - day; // começar na Segunda
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
function fmtHours(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h${m.toString().padStart(2, "0")}`;
}
function round1(n: number) {
    return Math.round(n * 10) / 10;
}

export default function MetricsGrid() {
    const { activities } = useActivityStore();

    const { daysActive, activeMin, km, kcal } = useMemo(() => {
        const s = startOfWeek();
        const e = endOfWeek();
        const weekActs = activities.filter((a) => {
            const d = isoToDate(a.dateISO);
            return d >= s && d < e;
        });

        const dayKeys = new Set<string>();
        let min = 0;
        let dist = 0;
        let cal = 0;

        for (const a of weekActs) {
            const d = isoToDate(a.dateISO);
            dayKeys.add(d.toDateString());
            min += a.durationMin || 0;
            dist += a.distanceKm || 0;
            cal += a.calories || 0;
        }
        return {
            daysActive: dayKeys.size,
            activeMin: min,
            km: dist,
            kcal: Math.round(cal),
        };
    }, [activities]);

    return (
        <View
            style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                marginBottom: spacing.lg,
                gap: spacing.md,
            }}
        >
            <MetricCard value={String(daysActive)} label="Dias Ativos" bg={colors.mascots.navajoWhite} />
            <MetricCard value={fmtHours(activeMin)} label="Horas Ativas" bg={colors.mascots.lightSteelBlue} />
            <MetricCard value={`${round1(km)} km`} label="Km Percorridos" bordered />
            <MetricCard value={String(kcal)} label="Calorias Queimadas" bg="#EAC4D5" />
        </View>
    );
}
