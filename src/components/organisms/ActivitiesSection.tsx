import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import ActivityChip from "@/components/molecules/ActivityChip";
import { spacing } from "@/theme";
import { View } from "react-native";

const MOCK_ACTIVITIES = [
    { icon: "personIcon", label: "34min." },
    { icon: "walkIcon", label: "1h30min." },
    { icon: "bikeIcon", label: "45min." },
];

export default function ActivitiesSection() {
    return (
        <Card style={{ padding: spacing.md }}>
            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
                Minhas Atividades
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
                {MOCK_ACTIVITIES.map((a, idx) => (
                    <ActivityChip key={idx} icon={a.icon} label={a.label} />
                ))}
            </View>
        </Card>
    );
}
