import Text from "@/components/atoms/Text";
import ChallengesList from "@/components/organisms/ChallengesList";
import GoalsList from "@/components/organisms/GoalsList";
import MetricsGrid from "@/components/organisms/MetricsGrid";
import RecordsList from "@/components/organisms/RecordsList";
import Screen from "@/components/templates/Screen";
import { spacing } from "@/theme";
import React from "react";
import { View } from "react-native";

export default function MetricasPage() {
    return (
        <Screen>
            <Text variant="title" weight="bold" style={{ marginBottom: spacing.sm }}>
                📊 Métricas da Semana
            </Text>

            <MetricsGrid />
            <GoalsList />
            <RecordsList />
            <ChallengesList />

            <View style={{ height: spacing.lg }} />
        </Screen>
    );
}
