//src/components/organisms/MetricsGrid.tsx
import MetricCard from "@/components/molecules/MetricCard";
import { colors, spacing } from "@/theme";
import React from "react";
import { View } from "react-native";

export default function MetricsGrid() {
    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: spacing.lg }}>
            <MetricCard value="4" label="Dias Ativos" bg={colors.mascots.navajoWhite} />
            <MetricCard value="3h45" label="Ativas" bg={colors.mascots.lightSteelBlue} />
            <MetricCard value="10" label="Km Percorridos" bordered />
            <MetricCard value="345" label="Calorias Queimadas" bg="#EAC4D5" />
        </View>
    );
}
