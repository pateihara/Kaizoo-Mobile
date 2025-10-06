//src/components/molecules/GoalItem.tsx
import Text from "@/components/atoms/Text";
import { colors, radius, spacing } from "@/theme";
import React from "react";
import { View } from "react-native";

type Props = {
    label: string;
    done?: boolean;
};

export default function GoalItem({ label, done }: Props) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <View
                style={{
                    width: 22, height: 22, borderRadius: radius.sm, borderWidth: 2,
                    borderColor: colors.gray[400],
                    alignItems: "center", justifyContent: "center",
                    backgroundColor: done ? colors.black : colors.white,
                }}
            >
                {done ? <Text variant="body" color={colors.white}>✓</Text> : null}
            </View>
            <Text variant="body">{label}</Text>
        </View>
    );
}
