// src/components/molecules/ActivityChip.tsx
import { bitmapIcons } from "@/assets";
import Text from "@/components/atoms/Text";
import { colors, radii, spacing } from "@/theme";
import { Image, View } from "react-native";

type IconSource = keyof typeof bitmapIcons | number | { uri: string };

type Props = {
    icon: IconSource;        // aceita chave do bitmapIcons, require(number) ou {uri}
    label: string;
    size?: number;           // px
    variant?: "ghost" | "solid";
    bgColor?: string;        // se quiser forçar uma cor no "solid"
};

// mapeia seus nomes para os do sprite real (ajuste aqui se necessário)
const ICON_ALIASES: Record<string, keyof typeof bitmapIcons> = {
    personIcon: "person",
    walkIcon: "walk",
    bikeIcon: "bike",
    // adicione outros aliases conforme suas chaves reais
};

function resolveIcon(icon: IconSource) {
    if (typeof icon === "number") return icon;           // require(...)
    if (typeof icon === "object" && icon && "uri" in icon) return icon; // { uri }
    if (typeof icon === "string") {
        const key = (ICON_ALIASES[icon] ?? icon) as keyof typeof bitmapIcons;
        const src = bitmapIcons[key];
        if (__DEV__ && !src) {
            console.warn(
                `[ActivityChip] icon "${icon}" não encontrado. Chaves: ${Object.keys(bitmapIcons).join(", ")}`
            );
        }
        return src;
    }
    return undefined;
}

export default function ActivityChip({
    icon,
    label,
    size = 36,
    variant = "ghost",
    bgColor,
}: Props) {
    const src = resolveIcon(icon);

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.xs,
                paddingHorizontal: spacing.sm,
                paddingVertical: Math.round(spacing.xs * 0.75),
                borderRadius: radii.pill,
                backgroundColor:
                    variant === "solid" ? (bgColor ?? colors.gray[100]) : "transparent",
                // evita cortes
                overflow: "visible",
                minHeight: size + Math.round(spacing.xs * 0.5),
            }}
        >
            {src ? (
                <Image
                    source={src}
                    style={{ width: size, height: size }}
                    resizeMode="contain"  // não corta o PNG
                />
            ) : (
                // sem fallback cinza — se não achar, só reserva o espaço
                <View style={{ width: size, height: size }} />
            )}

            <Text variant="body">{label}</Text>
        </View>
    );
}
