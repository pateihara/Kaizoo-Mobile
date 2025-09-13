import Header from "@/components/organisms/Header";
import Screen from "@/components/templates/Screen";

import AchievementsSection from "@/components/organisms/AchievementsSection";
import ActivitiesSection from "@/components/organisms/ActivitiesSection";
import ChallengeCard from "@/components/organisms/ChallengeCard";
import DailyHighlightCard from "@/components/organisms/DailyHighlightCard";
import FriendsSection from "@/components/organisms/FriendsSection";
import MascotCard from "@/components/organisms/MascotCard";

import { spacing } from "@/theme";
import { View } from "react-native";


export default function HomePage() {
  return (
    <Screen>
      <Header />

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

      <FriendsSection />
      <View style={{ height: spacing.lg }} />
    </Screen>
  );
}
