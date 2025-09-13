import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import { colors, spacing } from "@/theme";

export default function AchievementsSection() {
    return (
        <Card style={{ padding: spacing.md }}>
            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.xs }}>
                Conquistas Recentes
            </Text>
            <Text variant="body" color={colors.gray[600]}>
                Você ganhou 2 troféus!
            </Text>
        </Card>
    );
}
