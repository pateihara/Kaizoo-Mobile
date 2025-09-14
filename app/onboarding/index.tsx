import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import PagerDots from "@/components/molecules/PagerDots";
import OnboardingSlide from "@/components/organisms/OnboardingSlide";
import Screen from "@/components/templates/Screen";
import { setOnboardingSeen } from "@/services/auth";
import { colors, spacing } from "@/theme";
import type { Href } from "expo-router";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { Dimensions, FlatList, ListRenderItem, View } from "react-native";

// ✅ usar índice centralizado de assets
import { mascots, onboarding as obImgs } from "@/assets";

const { width } = Dimensions.get("window");

type Slide = {
    key: string;
    title: string;
    description: string;
    image: any;
    footer?: React.ReactNode;
};

export default function Onboarding() {
    const listRef = useRef<FlatList<Slide>>(null);
    const [index, setIndex] = useState(0);

    const slides: Slide[] = useMemo(
        () => [
            {
                key: "1",
                title: "SEU KAIZOO",
                description:
                    "Você irá criar e personalizar seu Kaizoo, que vai te acompanhar na sua jornada de exercícios físicos.",
                image: mascots.turtle, // << turtle existe no seu índice
                footer: (
                    <View style={{ flexDirection: "row", justifyContent: "center", gap: spacing.sm }}>
                        <Card style={{ padding: spacing.xs, borderRadius: 999 }}>
                            <Text>🐱</Text>
                        </Card>
                        <Card style={{ padding: spacing.xs, borderRadius: 999 }}>
                            <Text>🦖</Text>
                        </Card>
                        <Card style={{ padding: spacing.xs, borderRadius: 999 }}>
                            <Text>🐨</Text>
                        </Card>
                        <Card style={{ padding: spacing.xs, borderRadius: 999 }}>
                            <Text>🐧</Text>
                        </Card>
                    </View>
                ),
            },
            {
                key: "2",
                title: "DESAFIOS DIÁRIOS",
                description:
                    "Adotamos a metodologia Kaizen e acreditamos que fazendo um pouquinho a cada dia, conseguimos grandes conquistas.",
                image: obImgs.checklist, // << do seu onboarding index
                footer: (
                    <Card
                        style={{
                            padding: spacing.md,
                            borderRadius: 16,
                            backgroundColor: "#F6CCE0",
                            gap: spacing.xs,
                        }}
                    >
                        <Row text="Se manter ativo por 5" checked={false} />
                        <Row text="Percorrer 7 km em uma" checked />
                        <Row text="Se alongar por 3 min" checked />
                        <Row text="Correr por 3 min" checked={false} />
                        <Badge>Falta só 2 metas!</Badge>
                    </Card>
                ),
            },
            {
                key: "3",
                title: "GAMIFICAÇÃO LEVE",
                description:
                    "Cada pequena conquista vira celebração. Você acumula XP, evolui seu mascote e desbloqueia conquistas — sem pressão, só progresso real com diversão.",
                image: obImgs.xp, // ou bitmapIcons.star/xpStar se preferir
            },
            {
                key: "4",
                title: "COMUNIDADE ACOLHEDORA",
                description:
                    "Um espaço seguro e motivador, onde cada conquista é celebrada e cada passo é incentivado.",
                image: mascots.group, // << você tem group no índice
            },
        ],
        []
    );

    const goNext = async () => {
        if (index < slides.length - 1) {
            listRef.current?.scrollToIndex({ index: index + 1, animated: true });
        } else {
            await setOnboardingSeen();
            router.replace("/mascote" as Href); // garanta que app/mascote/index.tsx existe
        }
    };

    const renderItem: ListRenderItem<Slide> = ({ item }) => (
        <View style={{ width }}>
            <OnboardingSlide {...item} />
        </View>
    );

    return (
        <Screen backgroundColor={colors.ui.background}>
            <View style={{ flex: 1 }}>
                <FlatList
                    ref={listRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    data={slides}
                    renderItem={renderItem}
                    keyExtractor={(s) => s.key}
                    onScroll={(e) => {
                        const i = Math.round(e.nativeEvent.contentOffset.x / width);
                        if (i !== index) setIndex(i);
                    }}
                    scrollEventThrottle={16}
                />

                <View style={{ paddingBottom: spacing.lg }}>
                    <PagerDots total={slides.length} index={index} />
                </View>

                <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>
                    <Button onPress={goNext} style={{ borderRadius: 14, paddingVertical: spacing.md }}>
                        <Text weight="bold" align="center" style={{ color: "#fff" }}>
                            {index === slides.length - 1 ? "escolher meu Kaizoo!" : "continuar"}
                        </Text>
                    </Button>

                    {index < slides.length - 1 && (
                        <View style={{ marginTop: spacing.sm }}>
                            <Button
                                variant="ghost"
                                onPress={() => {
                                    listRef.current?.scrollToEnd({ animated: true });
                                }}
                            >
                                <Text align="center" style={{ color: colors.ui.inverse }}>
                                    pular
                                </Text>
                            </Button>
                        </View>
                    )}
                </View>
            </View>
        </Screen>
    );
}

/** Helpers visuais */
function Row({ text, checked }: { text: string; checked?: boolean }) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <View
                style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: colors.ui.text,
                    backgroundColor: checked ? colors.ui.text : "transparent",
                }}
            />
            <Text style={{ flex: 1 }}>{text}</Text>
        </View>
    );
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <View
            style={{
                alignSelf: "flex-start",
                marginTop: spacing.sm,
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 999,
                backgroundColor: "#F09FB7",
            }}
        >
            <Text weight="bold" style={{ color: "#1f1f1f" }}>
                {children}
            </Text>
        </View>
    );
}
