import { colors, spacing } from "@/theme";
import { ReactNode } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";

type Props = { children: ReactNode; scroll?: boolean; };

export default function Screen({ children, scroll = true }: Props) {
    if (scroll) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
                <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
                    {children}
                </ScrollView>
            </SafeAreaView>
        );
    }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50], padding: spacing.xl }}>
            <View style={{ flex: 1 }}>{children}</View>
        </SafeAreaView>
    );
}
