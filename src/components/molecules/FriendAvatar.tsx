import Text from "@/components/atoms/Text";
import { colors, radius } from "@/theme";
import { View } from "react-native";

export default function FriendAvatar({ emoji }: { emoji: string }) {
    return (
        <View
            style={{
                width: 36,
                height: 36,
                borderRadius: radius.full,
                backgroundColor: colors.white,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colors.gray[200],
                // sombra leve cross-platform (Android usa elevation, iOS usa shadow*)
                elevation: 2,
                shadowColor: colors.gray[900],
                shadowOpacity: 0.08,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
            }}
        >
            <Text variant="body">{emoji}</Text>
        </View>
    );
}
