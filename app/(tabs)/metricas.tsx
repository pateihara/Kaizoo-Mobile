// app/(tabs)/metricas.tsx
import Text from "@/components/atoms/Text";
import GoalsList from "@/components/organisms/GoalsList";
import MetricsGrid from "@/components/organisms/MetricsGrid";
import RecordsList from "@/components/organisms/RecordsList";
import Screen from "@/components/templates/Screen";
import { useWeeklyMetrics } from "@/hooks/useWeeklyMetrics";
import { spacing } from "@/theme";
import React from "react";
import { View } from "react-native";

export default function MetricasPage() {
    const { data, loading, error } = useWeeklyMetrics(); // semana atual (seg..dom)

    return (
        <Screen>
            <Text variant="title" weight="bold" style={{ marginBottom: spacing.sm }}>
                📊 Métricas da Semana
            </Text>

            <MetricsGrid
                loading={loading}
                error={error ?? undefined}
                data={
                    data
                        ? {
                            activeDays: data.activeDays,
                            activeMinutes: data.activeMinutes,
                            distanceKm: data.distanceKm,
                            calories: data.calories,
                        }
                        : undefined
                }
            />

            <GoalsList />
            <RecordsList />
            <View style={{ height: spacing.lg }} />
        </Screen>
    );
}
