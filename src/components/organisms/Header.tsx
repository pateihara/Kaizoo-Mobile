// //src/components/organisms/Header.tsx
import { colors, spacing } from "@/theme";
import { View } from "react-native";
import Icon from "../atoms/Icon";
import Text from "../atoms/Text";

export default function Header({ title }: { title: string }) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <Icon name="sparkles-outline" size={22} color={colors.brand.primary} />
            <Text variant="subtitle">{title}</Text>
        </View>
    );
}
