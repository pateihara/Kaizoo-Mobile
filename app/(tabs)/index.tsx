import Screen from "@/components/templates/Screen";

import AchievementsSection from "@/components/organisms/AchievementsSection";
import ActivitiesSection from "@/components/organisms/ActivitiesSection";
import ChallengeCard from "@/components/organisms/ChallengeCard";
import DailyHighlightCard from "@/components/organisms/DailyHighlightCard";
// import FriendsSection from "@/components/organisms/FriendsSection"; // substituído pelo bloco abaixo
import MascotCard from "@/components/organisms/MascotCard";

import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import FriendAvatar from "@/components/molecules/FriendAvatar";

import { spacing } from "@/theme";
import { ScrollView, View } from "react-native";

const FRIENDS = ["dino", "kaia", "penny", "tato", "koa"] as const;

export default function HomePage() {
  return (
    <Screen>
      <MascotCard />
      <View style={{ height: spacing.md }} />

      <DailyHighlightCard />
      <View style={{ height: spacing.md }} />

      <ChallengeCard />
      <View style={{ height: spacing.md }} />

      <ActivitiesSection />
      <View style={{ height: spacing.md }} />

      <AchievementsSection />
      <View style={{ height: spacing.md }} />

      {/* Amigos (fileira horizontal de avatares dos mascotes) */}
      <Card style={{ padding: spacing.md }}>
        <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.sm }}>
          Amigos
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm }}
        >
          {FRIENDS.map((m) => (
            <FriendAvatar key={m} mascot={m} size={40} />
          ))}
        </ScrollView>
      </Card>

      {/* Se preferir manter a seção antiga, remova o bloco acima e reative: */}
      {/* <FriendsSection /> */}
      <View style={{ height: spacing.lg }} />
    </Screen>
  );
}
