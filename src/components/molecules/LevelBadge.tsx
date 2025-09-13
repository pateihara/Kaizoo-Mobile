import Text from "@/components/atoms/Text";
import { colors, radius, spacing } from "@/theme";
import { View } from "react-native";

export default function LevelBadge({ level, xpToNext }: { level: number; xpToNext: number }) {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.xs,
                alignSelf: "center",
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
                borderRadius: radius.full,
                backgroundColor: colors.gray[100],
            }}
        >
            <View
                style={{
                    width: 28,
                    height: 28,
                    borderRadius: radius.full,
                    backgroundColor: colors.gray[300],
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text variant="body" weight="bold">{level}</Text>
            </View>
            <Text variant="body">{xpToNext}XP para o próximo nível!</Text>
        </View>
    );
}
