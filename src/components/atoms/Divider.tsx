import { colors, spacing } from "@/theme";
import { View } from "react-native";

export default function Divider() {
    return (
        <View style={{ height: 1, backgroundColor: colors.gray[200], marginVertical: spacing.md }} />
    );
}
