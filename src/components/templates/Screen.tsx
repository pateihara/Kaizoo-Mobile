//src/components/templates/Screen.tsx
import { colors, spacing } from "@/theme";
import React, { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
    children: ReactNode;
    scroll?: boolean;
    backgroundColor?: string;
    padding?: number;
    gap?: number;
};

export default function Screen({
    children,
    scroll = true,
    backgroundColor = colors.gray[50],
    padding = spacing.lg,
    gap = spacing.xs,
}: Props) {
    if (scroll) {
        return (
            <SafeAreaView
                style={{ flex: 1, backgroundColor }}
                // não pega top/bottom para não interferir no header/tab bar
                edges={["left", "right"]}
            >
                <ScrollView
                    style={{ flex: 1, backgroundColor }}
                    contentContainerStyle={{ padding, gap }}
                    // evita overlay sobre a tab bar em Android
                    overScrollMode="never"
                >
                    {children}
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor }}
            edges={["left", "right"]}
        >
            <View style={{ flex: 1, padding, gap }}>{children}</View>
        </SafeAreaView>
    );
}
