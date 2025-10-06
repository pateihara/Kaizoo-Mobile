//src/components/atoms/Button.tsx
import Text from "@/components/atoms/Text";
import { colors, radius, spacing } from "@/theme";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    PressableProps,
    StyleProp,
    ViewStyle,
} from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "onboardingFilled" | "onboardingOutline";

export interface ButtonProps
    extends Omit<PressableProps, "style" | "children" | "onPress"> {
    onPress?: () => void | Promise<void>;
    variant?: Variant;
    disabled?: boolean;
    loading?: boolean;
    style?: StyleProp<ViewStyle>;
    /** Texto do botão (API nova) */
    label?: string;
    /** Alias p/ compatibilidade com usos antigos */
    title?: string;
    /** Conteúdo livre; se existir, ignora label/title */
    children?: React.ReactNode;
    /** Ocupa 100% da largura disponível */
    fullWidth?: boolean;
    /** Se não passar, cai no label/title */
    accessibilityLabel?: string;
}

function getVariantStyles(variant: Variant, disabled?: boolean) {
    const brandBg = colors.brand.primary;
    const brandDisabled = colors.gray[300];
    const brandText = colors.ui.inverse;

    if (variant === "secondary") {
        return {
            backgroundColor: disabled ? colors.gray[200] : colors.mascots.paleTurquoise,
            textColor: colors.brand.primary,
            borderColor: "transparent",
        };
    }

    if (variant === "ghost") {
        return {
            backgroundColor: "transparent",
            textColor: colors.gray[900],
            borderColor: "transparent",
        };
    }

    if (variant === "onboardingOutline") {
        return {
            backgroundColor: "transparent",
            textColor: colors.mascots.paleTurquoise,
            borderColor: colors.mascots.paleTurquoise,
        };
    }

    if (variant === "onboardingFilled") {
        return {
            backgroundColor: colors.mascots.paleTurquoise,
            textColor: colors.black,
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
    title, // compat
    children,
    fullWidth,
    accessibilityLabel,
    ...rest // <- pega todas as props do Pressable (inclui accessibilityRole, accessibilityHint, testID etc.)
}: ButtonProps) {
    const vs = getVariantStyles(variant, disabled);
    const text = label ?? title;

    return (
        <Pressable
            {...rest}
            // se não passar, vira "button" por padrão
            accessibilityRole={rest.accessibilityRole ?? "button"}
            accessibilityLabel={accessibilityLabel ?? text}
            onPress={disabled || loading ? undefined : onPress}
            style={[
                {
                    minHeight: 48, // acessibilidade (área de toque)
                    paddingVertical: 10,
                    width: fullWidth ? "100%" : undefined,
                    borderRadius: radius.md,
                    paddingHorizontal: spacing.md,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: vs.backgroundColor as string,
                    borderWidth: (vs.borderColor as string) === "transparent" ? 0 : 1,
                    borderColor: vs.borderColor as string,
                    opacity: disabled ? 0.6 : 1,
                },
                style,
            ]}
            hitSlop={rest.hitSlop ?? { top: 6, bottom: 6, left: 6, right: 6 }}
        >
            {loading ? (
                <ActivityIndicator color={vs.textColor as string} />
            ) : children ? (
                children
            ) : (
                <Text
                    variant="button"
                    color={vs.textColor as string}
                    style={{ textAlign: "center", width: "100%" }}
                >
                    {text}
                </Text>
            )}
        </Pressable>
    );
}
