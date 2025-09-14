// app/mascote/index.tsx
import Text from "@/components/atoms/Text";
import Screen from "@/components/templates/Screen";
import { colors, spacing } from "@/theme";
import React from "react";
import { View } from "react-native";

export default function MascotePage() {
    return (
        <Screen backgroundColor={colors.ui.background}>
            <View style={{ padding: spacing.lg }}>
                <Text variant="title">Escolha seu Kaizoo</Text>
            </View>
        </Screen>
    );
}
