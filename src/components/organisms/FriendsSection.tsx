// src/components/organisms/FriendsSection.tsx
import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import FriendAvatar from "@/components/molecules/FriendAvatar";
import { spacing } from "@/theme";
import { View } from "react-native";

const FRIENDS = ["dino", "kaia", "penny", "tato", "koa"] as const;

export default function FriendsSection() {
    return (
        <Card style={{ padding: spacing.md }}>
            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
                Amigos Ativos Hoje
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
                {FRIENDS.map((m) => (
                    <FriendAvatar key={m} mascot={m} size={40} />
                ))}
            </View>
        </Card>
    );
}
