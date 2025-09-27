//src/components/organisms/RecordsList.tsx
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import RecordItem from "@/components/molecules/RecordItem";
import { radius, spacing } from "@/theme";
import React from "react";
import { View } from "react-native";

export default function RecordsList() {
    return (
        <Card style={{ padding: spacing.md }}>
            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
                🏆 Recordes Pessoais
            </Text>

            <View style={{ gap: spacing.xs }}>
                <RecordItem label="Maior distância percorrida" value="15 km" />
                <RecordItem label="Maior tempo de atividade" value="2h30" />
                <RecordItem label="Semana mais ativa" value="6 dias" />
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
                <Text variant="body" weight="bold">🐾 Já bateu 2 recordes na semana!</Text>
            </View>
        </Card>
    );
}
