//src/components/organisms/MascotCard.tsx
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import { MascotScene } from "@/components/organisms/MascotScene";
import { spacing } from "@/theme";
import { useRouter } from "expo-router";
import { Share, StyleSheet, View } from "react-native";

import { BG, transp } from "@/assets"; // <- sem barra no final
import type { MascotKey } from "@/services/profile";

type Props = {
    name?: string;
    mascot?: MascotKey; // "tato" | "dino" | "koa" | "kaia" | "penny"
    email?: string;
};

const BG_BY_MASCOT: Record<NonNullable<MascotKey>, any> = {
    kaia: BG.BGKaia,
    dino: BG.walk,
    koa: BG.person,
    penny: BG.addReaction,
    tato: BG.more,
};

const CHAR_BY_MASCOT: Record<NonNullable<MascotKey>, any> = {
    kaia: transp.BGKaia,
    dino: transp.walk,
    koa: transp.person,
    penny: transp.addReaction,
    tato: transp.more,
};

export default function MascotCard({
    name = "Atleta",
    mascot, // virá do perfil (Home passa pra cá)
    email,
}: Props) {
    const router = useRouter();

    // fallbacks visuais caso o mascote ainda não esteja definido
    const bgSource = mascot ? BG_BY_MASCOT[mascot] : BG.walk;
    const charSource = mascot ? CHAR_BY_MASCOT[mascot] : transp.walk;

    const shareMessage = async () => {
        try {
            await Share.share({
                message: `Treinando com meu Kaizoo${mascot ? ` (${mascot})` : ""}! 🐾 Bora junto?`,
            });
        } catch {
            // noop
        }
    };

    return (
        <>
            <Text variant="title" weight="bold">
                Olá, {name}!
            </Text>

            <Card style={[styles.card, { overflow: "hidden" }]}>
                {/* TOPO: fundo + personagem do Kaizoo */}
                <MascotScene bgSource={bgSource} charSource={charSource} />

                {/* RODAPÉ: ações */}
                <View style={styles.footer}>
                    <Text variant="subtitle" weight="bold" style={{ textAlign: "center" }}>
                        {mascot ? "Seu Kaizoo está pronto! 💪" : "Escolha seu Kaizoo no onboarding"}
                    </Text>

                    <View style={{ flexDirection: "column", gap: spacing.sm, width: "100%" }}>
                        <Button
                            label="Registrar Atividade"
                            onPress={() => router.push("/atividade")}
                            fullWidth
                        />
                        <Button label="Compartilhar" variant="secondary" onPress={shareMessage} fullWidth />
                    </View>
                </View>
            </Card>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 0, // o fundo “cola” nas bordas
        borderRadius: 16,
    },
    footer: {
        gap: spacing.md,
        padding: spacing.md,
        backgroundColor: "white",
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
});
