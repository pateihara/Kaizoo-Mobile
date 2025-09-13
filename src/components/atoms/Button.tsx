import Text from "@/components/atoms/Text";
import { colors, radius, spacing } from "@/theme";
import React from "react";
import { ActivityIndicator, Pressable, ViewStyle } from "react-native";

type Variant = "primary" | "secondary" | "ghost";

export type ButtonProps = {
    onPress?: () => void;
    variant?: Variant;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle | ViewStyle[];
    /** Texto do botão (API nova) */
    label?: string;
    /** Alias p/ compatibilidade com usos antigos */
    title?: string;
    /** Conteúdo livre; se existir, ignora label/title */
    children?: React.ReactNode;
    /** Ocupa 100% da largura disponível */
    fullWidth?: boolean;
    accessibilityLabel?: string;
};

function getVariantStyles(variant: Variant, disabled?: boolean) {
    // seu tema: colors.brand.{primary, primaryDark, accent} e colors.gray[…]
    const brandBg = colors.brand.primary;
    const brandDisabled = colors.gray[300];
    const brandText = colors.black;

    if (variant === "secondary") {
        return {
            backgroundColor: disabled ? colors.gray[200] : colors.gray[100],
            textColor: colors.gray[900],
            borderColor: colors.gray[200],
        };
    }

    if (variant === "ghost") {
        return {
            backgroundColor: "transparent",
            textColor: colors.gray[900],
            borderColor: "transparent",
        };
    }

    // primary
    return {
        backgroundColor: disabled ? brandDisabled : brandBg,
        textColor: brandText,
        borderColor: "transparent",
    };
}

export default function Button({
    onPress,
    variant = "primary",
    disabled,
    loading,
    style,
    label,
    title,     // <- compat
    children,
    fullWidth, // <- novo
    accessibilityLabel,
}: ButtonProps) {
    const vs = getVariantStyles(variant, disabled);
    const text = label ?? title; // mantém compatibilidade

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? text}
            onPress={disabled || loading ? undefined : onPress}
            style={[
                {
                    height: 44,
                    width: fullWidth ? "100%" : undefined,
                    borderRadius: radius.md,
                    paddingHorizontal: spacing.md,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: vs.backgroundColor as string,
                    borderWidth: vs.borderColor === "transparent" ? 0 : 1,
                    borderColor: vs.borderColor as string,
                    opacity: disabled ? 0.6 : 1,
                },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={vs.textColor as string} />
            ) : children ? (
                children
            ) : (
                <Text variant="button" color={vs.textColor as string}>
                    {text}
                </Text>
            )}
        </Pressable>
    );
}
