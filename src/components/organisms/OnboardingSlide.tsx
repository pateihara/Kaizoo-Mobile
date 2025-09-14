import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import { colors, spacing } from "@/theme";
import React, { ReactNode } from "react";
import { Image, ImageSourcePropType, View } from "react-native";

type Props = {
    image: ImageSourcePropType;
    title: string;
    description: string;
    footer?: ReactNode;        // ex: mini checklist/cta
    cardHeight?: number;       // 👈 NOVO
};

export default function OnboardingSlide({
    image,
    title,
    description,
    footer,
    cardHeight,
}: Props) {
    return (
        <View style={{ padding: spacing.lg, flex: 1, justifyContent: "center" }}>
            <Card
                style={{
                    padding: spacing.xl,
                    borderRadius: 24,
                    height: cardHeight,            // 👈 usa a altura padronizada
                    alignSelf: "stretch",
                }}
            >
                <View style={{ alignItems: "center" }}>
                    <Image
                        source={image}
                        style={{ width: 220, height: 220, resizeMode: "contain" }}
                    />
                </View>

                <Text
                    variant="subtitle"
                    style={{ marginTop: spacing.lg, textAlign: "center" }}
                >
                    {title}
                </Text>

                <Text
                    style={{
                        marginTop: spacing.sm,
                        lineHeight: 22,
                        textAlign: "center",
                        color: colors.ui.inverse,
                    }}
                >
                    {description}
                </Text>

                {footer ? <View style={{ marginTop: spacing.lg }}>{footer}</View> : null}
            </Card>
        </View>
    );
}
