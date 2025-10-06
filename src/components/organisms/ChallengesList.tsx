//src/components/organisms/ChallengesList.tsx
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import ChallengeItem from "@/components/molecules/ChallengeItem";
import { spacing } from "@/theme";
import React from "react";
import { View } from "react-native";

export default function ChallengesList() {
    return (
        <Card style={{ padding: spacing.md }}>
            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
                🔥 Desafios Ativos
            </Text>

            <View style={{ gap: spacing.md }}>
                <ChallengeItem title="Corrida Matinal" description="Correr 3km pela manhã!" rewardXP={45} expiresIn="4 dias" />
                <ChallengeItem title="Corrida Matinal" description="Correr 3km pela manhã!" rewardXP={45} expiresIn="4 dias" />
                <ChallengeItem title="Corrida Matinal" description="Correr 3km pela manhã!" rewardXP={45} expiresIn="4 dias" />
            </View>
        </Card>
    );
}
