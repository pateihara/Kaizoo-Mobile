import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import FriendAvatar from "@/components/molecules/FriendAvatar";
import { spacing } from "@/theme";
import { View } from "react-native";

const MOCK_FRIENDS = [
    { id: "a", emoji: "🦊" },
    { id: "b", emoji: "🐯" },
    { id: "c", emoji: "🦖" },
    { id: "d", emoji: "🧝‍♀️" },
];

export default function FriendsSection() {
    return (
        <Card style={{ padding: spacing.md }}>
            <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
                Amigos Ativos Hoje
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
                {MOCK_FRIENDS.map((f) => (
                    <FriendAvatar key={f.id} emoji={f.emoji} />
                ))}
            </View>
        </Card>
    );
}
