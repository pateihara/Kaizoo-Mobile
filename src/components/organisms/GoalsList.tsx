//src/components/organisms/GoalsList.tsx
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import GoalItem from "@/components/molecules/GoalItem";
import { radius, spacing } from "@/theme";
import React from "react";
import { View } from "react-native";

export default function GoalsList() {
    return (
        <Card style={{ padding: spacing.md }}>
            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
                🎯 Metas da Semana
            </Text>

            <View style={{ gap: spacing.sm }}>
                <GoalItem label="Se manter ativo por 5 dias" />
                <GoalItem label="Percorrer 7 km em uma semana" done />
                <GoalItem label="Correr por 3 min. seguidos" done />
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
                <Text variant="body" weight="bold">🐾 Falta apenas 1 meta!</Text>
            </View>
        </Card>
    );
}
