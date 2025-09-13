// src/components/molecules/FriendAvatar.tsx
import { iconFriend } from "@/assets";
import { colors, radii } from "@/theme";
import { Image, View } from "react-native";

type FriendKey = keyof typeof iconFriend; // "kaia" | "dino" | "koa" | "penny" | "tato"

type Props = {
    mascot: FriendKey | "peny"; // aceita 'peny' por compatibilidade
    size?: number;
    ring?: boolean;
    ringColor?: string;
};

const ALIASES: Record<string, FriendKey> = {
    penny: "penny", // corrige typo
};

export default function FriendAvatar({
    mascot,
    size = 36,
    ring = true,
    ringColor = colors.gray[200],
}: Props) {
    const key = (ALIASES[mascot] ?? mascot) as FriendKey;
    const src = iconFriend[key];

    if (__DEV__ && !src) {
        console.warn(`[FriendAvatar] mascote "${mascot}" não encontrado. Use: ${Object.keys(iconFriend).join(", ")}`);
    }

    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: radii.pill,
                backgroundColor: colors.white,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: ring ? 1 : 0,
                borderColor: ringColor,
                elevation: 2,
                shadowColor: colors.gray[900],
                shadowOpacity: 0.08,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                overflow: "hidden", // máscara circular
            }}
        >
            {src ? (
                <Image
                    source={src}
                    style={{ width: size * 0.8, height: size * 0.8 }}
                    resizeMode="contain" // não corta o PNG
                />
            ) : null}
        </View>
    );
}
