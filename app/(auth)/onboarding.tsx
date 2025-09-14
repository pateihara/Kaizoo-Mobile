// app/(auth)/onboarding.tsx
import { bitmapIcons, mascots } from "@/assets";
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

const { width, height } = Dimensions.get("window");
const CARD_HEIGHT = Math.round(Math.min(560, Math.max(460, height * 0.62)));

type Slide = {
    id: string;
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
                id: "1",
                title: "SEU KAIZOO",
                description:
                    "Você irá criar e personalizar seu Kaizoo, que vai te acompanhar na sua jornada de exercícios físicos.",
                image: mascots.kaia,
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
                id: "2",
                title: "DESAFIOS DIÁRIOS",
                description:
                    "Adotamos a metodologia Kaizen e acreditamos que fazendo um pouquinho a cada dia, conseguimos grandes conquistas.",
                image: bitmapIcons.person,
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
                id: "3",
                title: "GAMIFICAÇÃO LEVE",
                description:
                    "Cada pequena conquista vira celebração. Você acumula XP, evolui seu mascote e desbloqueia conquistas — sem pressão, só progresso real com diversão.",
                image: bitmapIcons.bike,
            },
            {
                id: "4",
                title: "COMUNIDADE ACOLHEDORA",
                description:
                    "Um espaço seguro e motivador, onde cada conquista é celebrada e cada passo é incentivado.",
                image: mascots.koa,
            },
        ],
        []
    );

    const goNext = async () => {
        if (index < slides.length - 1) {
            listRef.current?.scrollToIndex({ index: index + 1, animated: true });
        } else {
            await setOnboardingSeen();
            router.replace("/mascote" as Href);
        }
    };

    const renderItem: ListRenderItem<Slide> = ({ item }) => (
        <View style={{ width }}>
            <OnboardingSlide
                image={item.image}
                title={item.title}
                description={item.description}
                footer={item.footer}
                cardHeight={CARD_HEIGHT}
            />
        </View>
    );

    return (
        <Screen backgroundColor="#000">
            <View style={{ flex: 1 }}>
                <FlatList
                    ref={listRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    data={slides}
                    renderItem={renderItem}
                    keyExtractor={(s) => s.id}
                    onScroll={(e) => {
                        const i = Math.round(e.nativeEvent.contentOffset.x / width);
                        if (i !== index) setIndex(i);
                    }}
                    scrollEventThrottle={16}
                />

                <View style={{ paddingBottom: spacing.lg }}>
                    <PagerDots total={slides.length} index={index} />
                </View>

                <View style={{ paddingBottom: spacing.xl }}>
                    <Button
                        onPress={goNext}
                        style={{
                            alignSelf: "center",
                            paddingVertical: spacing.md,
                            borderRadius: 14,
                            minWidth: 260,
                            width: "86%",
                        }}
                    >
                        <Text weight="bold" align="center" style={{ color: "#fff" }}>
                            {index === slides.length - 1 ? "escolher meu Kaizoo!" : "continuar"}
                        </Text>
                    </Button>
                </View>
            </View>
        </Screen>
    );
}

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
