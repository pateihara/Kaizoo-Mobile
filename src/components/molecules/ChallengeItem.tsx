//src/components/molecules/ChallengeItem.tsx
import Text from "@/components/atoms/Text";
import { colors, radius, spacing } from "@/theme";
import React from "react";
import { View } from "react-native";

type Props = {
    title: string;
    description: string;
    rewardXP: number;
    expiresIn: string; // "4 dias"
    bg?: string;
};

export default function ChallengeItem({ title, description, rewardXP, expiresIn, bg = colors.mascots.navajoWhite }: Props) {
    return (
        <View style={{ backgroundColor: bg, borderRadius: radius.lg, padding: spacing.md }}>
            <Text variant="body" weight="bold">🧍‍♂️ {title}</Text>
            <Text variant="body">{description}</Text>
            <Text variant="body">Recompensa: <Text weight="bold">{rewardXP}XP</Text></Text>
            <Text variant="body">Expira em: <Text weight="bold">{expiresIn}</Text></Text>
        </View>
    );
}
