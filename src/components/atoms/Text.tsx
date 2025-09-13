import { colors } from "@/theme";
import React from "react";
import {
    Text as RNText,
    TextProps as RNTextProps,
    StyleSheet,
    TextStyle,
} from "react-native";

type Variant = "title" | "subtitle" | "body" | "button";
type WeightKeyword = "regular" | "medium" | "semibold" | "bold";
type RNFontWeight = NonNullable<TextStyle["fontWeight"]>;
type Weight = WeightKeyword | RNFontWeight;

type Props = RNTextProps & {
    variant?: Variant;
    color?: string;
    weight?: Weight;
    children: React.ReactNode;
};

const weightMap: Record<WeightKeyword, RNFontWeight> = {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
};

function resolveWeight(weight?: Weight): RNFontWeight | undefined {
    if (!weight) return undefined;
    if (typeof weight === "number") return String(weight) as RNFontWeight;
    return (weightMap[weight as WeightKeyword] ?? weight) as RNFontWeight;
}

export default function Text({
    variant = "body",
    color = colors.gray[900],
    weight,
    style,
    children,
    ...rest
}: Props) {
    const fw = resolveWeight(weight);

    return (
        <RNText
            {...rest}
            style={[styles[variant], { color }, fw ? { fontWeight: fw } : null, style]}
        >
            {children}
        </RNText>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 24, fontWeight: "700" },
    subtitle: { fontSize: 18, fontWeight: "600" },
    body: { fontSize: 16, fontWeight: "400" },
    button: { fontSize: 16, fontWeight: "600", textTransform: "uppercase" },
});
