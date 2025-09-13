// app/(tabs)/index.tsx
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import ActivityForm from "@/components/organisms/ActivityForm";
import Screen from "@/components/templates/Screen";

import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Divider from "@/components/atoms/Divider";
import Icon from "@/components/atoms/Icon";
import Text from "@/components/atoms/Text";

import ProgressBar from "@/components/molecules/ProgressBar";
import StatRow from "@/components/molecules/StatRow";

import { colors, spacing } from "@/theme";

export default function HomeShowcase() {
  const [progress, setProgress] = useState(0.35);

  const dec = () => setProgress((p) => Math.max(0, p - 0.1));
  const inc = () => setProgress((p) => Math.min(1, p + 0.1));

  return (
    <Screen>
      {/* Título de página (átomo) */}
      <View style={styles.headerBlock}>
        <Text variant="title" weight="bold">Kaizoo — Showcase</Text>
        <Text color={colors.gray[600]}>
          Exemplo de uso de átomos, moléculas e organismos.
        </Text>
      </View>

      {/* Organismo com lógica (form) */}
      <ActivityForm />

      {/* Painel do dia (moléculas + átomos) */}
      <Card style={styles.card}>
        <Text variant="subtitle" weight="semibold">Seu dia</Text>

        <View style={styles.stackSm}>
          <StatRow label="Passos" value="6.842" />
          <StatRow label="Energia gasta" value="312 kcal" />
          <StatRow label="Min. de atividade" value="21 min" />
        </View>

        <Divider />

        <View style={styles.stackXs}>
          <Text color={colors.gray[600]}>Progresso da meta diária</Text>
          <ProgressBar progress={progress} />
        </View>

        <View style={styles.row}>
          <Button title="-10%" variant="ghost" onPress={dec} />
          <Button title="+10%" onPress={inc} />
        </View>
      </Card>

      {/* Info Card (átomos + molécula simples) */}
      <Card style={styles.infoCard}>
        <Icon name="leaf-outline" size={22} color={colors.brand.accent} />
        <View style={styles.infoBody}>
          <Text variant="subtitle" weight="semibold">Dica rápida</Text>
          <Text color={colors.gray[600]}>
            Caminhadas curtas ao longo do dia somam — 3× de 10 minutos valem tanto quanto 1× de 30.
          </Text>
        </View>
        <Button title="OK" variant="secondary" />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  card: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  infoBody: {
    flex: 1,
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  stackSm: { gap: spacing.sm },
  stackXs: { gap: spacing.xs },
});
