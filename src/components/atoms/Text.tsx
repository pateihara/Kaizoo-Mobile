// src/components/atoms/Text.tsx
import { colors, fonts, textVariants } from "@/theme";
import React from "react";
import {
    Text as RNText,
    TextProps as RNTextProps,
    TextStyle,
} from "react-native";

type Variant = keyof typeof textVariants;
type WeightKeyword = "regular" | "medium" | "semibold" | "bold";
type RNFontWeight = NonNullable<TextStyle["fontWeight"]>;

/** Aceita palavras-chave (regular/medium/semibold/bold) ou valores numéricos ("400"..."700") */
type Weight = WeightKeyword | RNFontWeight;

export type TextProps = RNTextProps & {
    variant?: Variant;                         // "title" | "subtitle" | "body" | "button" | ...
    weight?: Weight;                           // controla peso (via fontFamily/fallback fontWeight)
    color?: string;                            // override de cor
    align?: TextStyle["textAlign"];            // "left" | "center" | "right" | ...
    children: React.ReactNode;
};

function resolveFontFamily(weight?: WeightKeyword): string | undefined {
    if (!weight) return undefined;
    switch (weight) {
        case "regular":
            return fonts.family.regular;
        case "medium":
            return fonts.family.medium;
        case "semibold":
            // não temos face semibold; escolha a que preferir como fallback
            return fonts.family.medium; // ou fonts.family.bold se quiser mais forte
        case "bold":
            return fonts.family.bold;
        default:
            return undefined;
    }
}

export default function Text({
    variant = "body",
    weight,
    color = colors.ui.text,
    align,
    style,
    children,
    ...rest
}: TextProps) {
    // Se vier numérico ("600"), usamos fontWeight; se vier keyword, usamos fontFamily
    const isNumeric =
        typeof weight === "string" &&
        /^\d{3}$/.test(weight); // "400" | "500" | "600" | "700" ...

    const family = !isNumeric && typeof weight === "string"
        ? resolveFontFamily(weight as WeightKeyword)
        : undefined;

    const weightStyle: TextStyle | undefined = isNumeric
        ? { fontWeight: weight as RNFontWeight }
        : family
            ? { fontFamily: family }
            : undefined;

    return (
        <RNText
            {...rest}
            style={[
                textVariants[variant],
                { color },
                align ? { textAlign: align } : null,
                weightStyle,
                style,
            ]}
        >
            {children}
        </RNText>
    );
}
