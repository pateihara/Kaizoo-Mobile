import { colors, spacing } from "@/theme";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

type Variant = "default" | "highlight";

type CardProps = ViewProps & {
    variant?: Variant;
    children: React.ReactNode;
};

export default function Card({
    variant = "default",
    style,
    children,
    ...rest
}: CardProps) {
    return (
        <View
            {...rest}
            style={[
                styles.base,
                variant === "highlight" && styles.highlight,
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    highlight: {
        borderWidth: 2,
        borderColor: colors.brand.primary,
        backgroundColor: colors.brand.accent,
    },
});
