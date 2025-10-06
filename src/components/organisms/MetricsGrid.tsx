// src/components/organisms/MetricsGrid.tsx
import Text from "@/components/atoms/Text";
import { colors, radius, spacing } from "@/theme";
import React from "react";
import { View } from "react-native";

export type WeeklyData = {
    activeDays: number;
    activeMinutes: number;
    distanceKm: number;
    calories: number;
};

export type MetricsGridProps = {
    loading?: boolean;
    error?: string;
    data?: WeeklyData;
};

export default function MetricsGrid({ loading, error, data }: MetricsGridProps) {
    if (loading) {
        return (
            <View style={{ marginBottom: spacing.lg }}>
                <Text variant="body">Carregando…</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ marginBottom: spacing.lg }}>
                <Text variant="body" color={colors.mascots.lightCoral[600]}>Erro: {error}</Text>
            </View>
        );
    }

    const d: WeeklyData = data ?? { activeDays: 0, activeMinutes: 0, distanceKm: 0, calories: 0 };

    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: spacing.lg }}>
            <MetricCard label="Dias ativos" value={`${d.activeDays}`} />
            <MetricCard label="Minutos ativos" value={`${d.activeMinutes}`} />
            <MetricCard label="Distância (km)" value={d.distanceKm.toFixed(2)} />
            <MetricCard label="Calorias" value={`${Math.round(d.calories)}`} />
        </View>
    );
}

function MetricCard({ label, value }: { label: string; value: string }) {
    return (
        <View style={{ width: "48%", backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md }}>
            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.xs }}>{value}</Text>
            <Text variant="body" color={colors.gray[700]}>{label}</Text>
        </View>
    );
}
