// //src/components/organisms/DailyHighlightCard.tsx
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import { colors, spacing } from "@/theme";

const MOCK_HIGHLIGHT = "Hoje o seu Kaizoo quer se movimentar por 15 minutos!";

export default function DailyHighlightCard() {
    return (
        <Card style={{ backgroundColor: colors.mascots.navajoWhite, padding: spacing.md }}>
            <Text variant="subtitle" weight="bold">Destaque do Dia</Text>
            <Text variant="body" color={colors.gray[800]} style={{ marginTop: spacing.xs }}>
                “{MOCK_HIGHLIGHT}”
            </Text>
        </Card>
    );
}
