//src/components/molecules/LevelBadge.tsx
import Text from "@/components/atoms/Text";
import { colors, radius, spacing } from "@/theme";
import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
    level: number;
    xpToNext: number;            // quanto falta
    totalXPForLevel?: number;    // XP total do nível (opcional)
    currentXP?: number;          // XP ganho no nível (opcional)
    size?: number;
    stroke?: number;
    remainingColor?: string;     // COR DO QUE FALTA (amarelo)
    progressColor?: string;      // COR DO QUE JÁ GANHOU
};

export default function LevelBadge({
    level,
    xpToNext,
    totalXPForLevel,
    currentXP,
    size = 36,
    stroke = 4,
    remainingColor = colors.gray[200],
    progressColor = colors.mascots.paleTurquoise,


}: Props) {
    // progresso 0..1
    const total = totalXPForLevel ?? (currentXP !== undefined ? currentXP + xpToNext : undefined);
    const earned = currentXP ?? (total ? Math.max(total - xpToNext, 0) : 0);
    const progress = total && total > 0 ? Math.min(Math.max(earned / total, 0), 1) : 0;

    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(anim, {
            toValue: progress,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false, // strokeDashoffset é layout
        }).start();
    }, [progress]);

    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;

    const dashoffset = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [c, 0],
    });

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.xs,
                alignSelf: "center",
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
                borderRadius: radius.full,
                backgroundColor: colors.gray[100],
            }}
            accessibilityRole="progressbar"
            accessibilityValue={{ now: Math.round(progress * 100), min: 0, max: 100 }}
        >
            {/* Anel com restante em amarelo + progresso por cima */}
            <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
                <Svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
                >
                    {/* trilha = o que falta (amarelo) */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        stroke={remainingColor}
                        strokeWidth={stroke}
                        fill="none"
                    />
                    {/* progresso (cobre parte do amarelo) */}
                    <AnimatedCircle
                        cx={size / 2}
                        cy={size / 2}
                        r={r}
                        stroke={progressColor}
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={`${c}, ${c}`}
                        strokeDashoffset={dashoffset}
                        fill="none"
                    />
                </Svg>

                <Text variant="body" weight="bold">{level}</Text>
            </View>

            <Text variant="body">{xpToNext}XP para o próximo nível!</Text>
        </View>
    );
}
