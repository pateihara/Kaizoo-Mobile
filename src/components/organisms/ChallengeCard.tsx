import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import ProgressBar from "@/components/molecules/ProgressBar";
import { colors, spacing } from "@/theme";

const MOCK_CHALLENGE = {
    label: "Meta: 10km corridos",
    progress: 0.5,
};

export default function ChallengeCard() {
    return (
        <Card style={{ padding: spacing.md }}>
            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
                Próximo Desafio
            </Text>
            <Text variant="body" color={colors.gray[600]} style={{ marginBottom: spacing.sm }}>
                {MOCK_CHALLENGE.label}
            </Text>
            <ProgressBar progress={MOCK_CHALLENGE.progress} />
        </Card>
    );
}
