// //src/components/organisms/MascotCard.tsx
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import LevelBadge from "@/components/molecules/LevelBadge";
import { MascotScene } from "@/components/organisms/MascotScene";
import { spacing } from "@/theme";
import { useRouter } from "expo-router";
import { Share, StyleSheet, View } from "react-native";

import { BG, transp } from "@/assets/";

export type MascotKey = "dino" | "kaia" | "koa" | "penny" | "tato";

const BG_BY_MASCOT: Record<MascotKey, any> = {
    kaia: BG.BGKaia,
    dino: BG.walk,
    koa: BG.person,
    penny: BG.addReaction,
    tato: BG.more,
};

const CHAR_BY_MASCOT: Record<MascotKey, any> = {
    kaia: transp.BGKaia,
    dino: transp.walk,
    koa: transp.person,
    penny: transp.addReaction,
    tato: transp.more,
};

type Props = {
    name?: string;
    mascot?: MascotKey;
    email?: string;
    level?: number;
    xpToNext?: number;
    totalXPForLevel?: number;
};

export default function MascotCard({
    name = "Patricia",
    mascot = "dino",
    email = "pateihara@gmail.com",
    level = 5,
    xpToNext = 325,
    totalXPForLevel = 500,
}: Props) {
    const router = useRouter();

    const shareMessage = async () => {
        try {
            await Share.share({
                message: `Estou no nível ${level} no Kaizoo! Falta ${xpToNext} XP para o próximo nível.`,
            });
        } catch { }
    };

    return (
        <>
            <Text variant="title" weight="bold">Olá, {name}!</Text>

            <Card style={[styles.card, { overflow: "hidden" }]}>
                {/* TOPO: fundo com personagem */}
                <MascotScene
                    bgSource={BG_BY_MASCOT[mascot]}
                    charSource={CHAR_BY_MASCOT[mascot]}
                />

                {/* RODAPÉ: área clara */}
                <View style={styles.footer}>
                    <View style={{ alignItems: "center", gap: spacing.xs }}>
                        <Text variant="subtitle" weight="bold">Nível {level}</Text>
                        <LevelBadge level={level} xpToNext={xpToNext} totalXPForLevel={totalXPForLevel} />
                    </View>

                    <View style={{ flexDirection: "column", gap: spacing.sm, width: "100%" }}>
                        <Button
                            label="Registrar Atividade"
                            onPress={() => router.push("/atividade")}
                            fullWidth
                        />
                        <Button
                            label="Compartilhar"
                            variant="secondary"
                            onPress={shareMessage}
                            fullWidth
                        />
                    </View>
                </View>
            </Card>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 0,                 // fundo precisa “colar” nas bordas
        borderRadius: 16,           // os cantos do Card recortam o fundo
    },
    bg: {
        width: "100%",
        height: 300,                // ajuste conforme seu layout
        justifyContent: "flex-end", // personagem “assenta” no chão do fundo
        alignItems: "center",
    },
    bgImage: {
        // importante para o ImageBackground respeitar o arredondado do Card:
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    character: {
        width: 220,
        height: 220,
        marginBottom: spacing.md,   // dá um “chão” pro personagem
    },
    footer: {
        gap: spacing.md,
        padding: spacing.md,
        backgroundColor: "white",
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
});
