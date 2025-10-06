//src/components/molecules/StarRow.tsx
import { colors, spacing } from "@/theme";
import { View } from "react-native";
import Text from "../atoms/Text";

type Props = { label: string; value: string };

export default function StatRow({ label, value }: Props) {
    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: spacing.sm }}>
            <Text color={colors.gray[600]}>{label}</Text>
            <Text weight="semibold">{value}</Text>
        </View>
    );
}
