import { colors, spacing } from "@/theme";
import React from "react";
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import Text from "./Text";

type Variant = "primary" | "secondary" | "success" | "error" | "ghost";

type ButtonProps = {
    title?: string;
    label?: string;
    onPress?: () => void;
    onClick?: () => void;
    variant?: Variant;
    disabled?: boolean;
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>;
};

export default function Button({
    title,
    label,
    onPress,
    onClick,
    variant = "primary",
    disabled = false,
    fullWidth = false,
    style,
}: ButtonProps) {
    const text = title ?? label ?? "";
    const handler = onPress ?? onClick ?? (() => { });

    const BRAND = colors.brand.primary;       // "#000000"
    const BRAND_DARK = colors.brand.primaryDark; // se quiser manter, mas podemos usar BRAND mesmo

    const isGhost = variant === "ghost";
    const isSecondary = variant === "secondary";

    // ⚠️ Aqui está o ajuste: texto branco no primário/cores sólidas, preto no ghost/secondary
    const textColor = (isGhost || isSecondary) ? BRAND : colors.white;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handler}
            disabled={disabled}
            style={[
                styles.base,
                fullWidth && styles.fullWidth,
                getVariantStyle(variant, { BRAND, BRAND_DARK }),
                disabled && styles.disabled,
                style,
            ]}
        >
            <Text variant="button" style={{ color: textColor }}>
                {text}
            </Text>
        </TouchableOpacity>
    );
}

function getVariantStyle(
    variant: Variant,
    palette: { BRAND: string; BRAND_DARK: string }
) {
    switch (variant) {
        case "primary":
            return { backgroundColor: palette.BRAND }; // preto
        case "secondary":
            return {
                backgroundColor: colors.white,
                borderWidth: 2,
                borderColor: palette.BRAND, // borda preta
            };
        case "ghost":
            return { backgroundColor: "transparent", borderWidth: 0 };
        case "success":
            return { backgroundColor: colors.success };
        case "error":
            return { backgroundColor: colors.danger };
        default:
            return { backgroundColor: palette.BRAND };
    }
}

const styles = StyleSheet.create({
    base: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    fullWidth: { alignSelf: "stretch" },
    disabled: { opacity: 0.5 },
});
