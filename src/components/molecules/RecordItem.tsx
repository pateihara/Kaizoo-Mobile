//src/components/molecules/RecordItem.tsx
import Text from "@/components/atoms/Text";
import { spacing } from "@/theme";
import React from "react";
import { View } from "react-native";

type Props = { label: string; value: string };

export default function RecordItem({ label, value }: Props) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Text variant="subtitle">⭐</Text>
            <Text variant="body">
                {label}: <Text weight="bold">{value}</Text>
            </Text>
        </View>
    );
}
