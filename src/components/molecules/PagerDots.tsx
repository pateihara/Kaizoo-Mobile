// src/components/molecules/PagerDots.tsx
import { spacing } from "@/theme";
import React from "react";
import { View } from "react-native";

type Props = {
    total: number;           // quantidade de páginas
    index: number;           // página atual (0-based)
    size?: number;           // diâmetro do ponto
    activeColor?: string;    // cor do ponto ativo
    inactiveColor?: string;  // cor dos pontos inativos
};

export default function PagerDots({
    total,
    index,
    size = 8,
    activeColor = "#fff",                 // padrão bom pro fundo preto
    inactiveColor = "rgba(255,255,255,.35)",
}: Props) {
    return (
        <View
            style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: spacing.xs,
            }}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: total - 1, now: index }}
        >
            {Array.from({ length: total }).map((_, i) => (
                <View
                    key={i}
                    style={{
                        width: i === index ? size + 2 : size,
                        height: i === index ? size + 2 : size,
                        borderRadius: 999,
                        backgroundColor: i === index ? activeColor : inactiveColor,
                        opacity: 1,
                    }}
                />
            ))}
        </View>
    );
}
