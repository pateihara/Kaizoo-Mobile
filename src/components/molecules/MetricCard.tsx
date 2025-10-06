//src/components/molecules/MetricCard.tsx
import Text from "@/components/atoms/Text";
import { colors, radius, spacing } from "@/theme";
import React from "react";
import { View } from "react-native";

type Props = {
    value: string | number;
    label: string;
    bg?: string;
    bordered?: boolean;
};

export default function MetricCard({ value, label, bg = colors.white, bordered }: Props) {
    return (
        <View
            style={{
                width: "48%",
                backgroundColor: bg,
                borderRadius: radius.lg,
                paddingVertical: spacing.lg,
                paddingHorizontal: spacing.md,
                marginBottom: spacing.md,
                alignItems: "center",
                borderWidth: bordered ? 1 : 0,
                borderColor: colors.gray[200],
                shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
            }}
        >
            <Text variant="subtitle" weight="bold">{String(value)}</Text>
            <Text variant="body" weight="bold" style={{ textAlign: "center" }}>
                {label.toUpperCase()}
            </Text>
        </View>
    );
}
