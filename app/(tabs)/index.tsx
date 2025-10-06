// app/(tabs)/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import Card from "@/components/atoms/Card";
import Text from "@/components/atoms/Text";
import MascotCard from "@/components/organisms/MascotCard";
import Screen from "@/components/templates/Screen";

import { useActivityStore } from "@/contexts/ActivityContext";
import { getProfile, type MascotKey, type ProfileDTO } from "@/services/profile";
import { spacing } from "@/theme";

/** ---------- UI: ProgressBar genérica ---------- */
function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(1, Number(value) || 0));
  return (
    <View
      style={{
        height: 12,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.12)",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${v * 100}%`,
          height: "100%",
          backgroundColor: "#86E3D2",
        }}
      />
    </View>
  );
}

/** ---------- Lógica de LEVEL / XP ----------
 * Regra: custo pra subir do nível L→L+1 = 120 * (L+1)^1.15
 * Usuário nasce no nível 0.
 */
function xpCostFor(nextLevel: number) {
  return Math.floor(120 * Math.pow(nextLevel, 1.15));
}

function splitLevelFromXP(totalXP: number) {
  let level = 0;
  let pool = Math.max(0, Math.floor(totalXP || 0));

  for (let next = 1; next <= 100; next++) {
    const cost = xpCostFor(next);
    if (pool >= cost) {
      pool -= cost;
      level = next;
    } else {
      const progressToNext = cost > 0 ? pool / cost : 0;
      return {
        level,
        totalXP,
        progressToNext: Math.max(0, Math.min(1, progressToNext)),
        nextLevelCost: cost,
        currentIntoLevel: pool,
      };
    }
  }
  return {
    level: 100,
    totalXP,
    progressToNext: 1,
    nextLevelCost: 0,
    currentIntoLevel: 0,
  };
}

/** ---------- Progresso do desafio ativo ---------- */
function computeChallengeProgress(ch: any, activities: any[]) {
  if (!ch) return { value: 0, label: "0%", numeric: 0, target: 1 };

  const list = Array.isArray(activities) ? activities : [];
  const startedAt = ch?.startedAt ? new Date(ch.startedAt).getTime() : 0;

  const inScope = list.filter((a) => {
    const t = a?.dateISO ? new Date(a.dateISO).getTime() : 0;
    return startedAt ? t >= startedAt : true;
  });

  let target = 0;
  let current = 0;

  if (ch?.metricDurationMin) {
    target = Number(ch.metricDurationMin) || 0;
    current = inScope.reduce((s, a) => s + (Number(a?.durationMin) || 0), 0);
  } else if (ch?.metricDistanceKm) {
    target = Number(ch.metricDistanceKm) || 0;
    current = inScope.reduce((s, a) => s + (Number(a?.distanceKm) || 0), 0);
  } else if (ch?.metricCalories) {
    target = Number(ch.metricCalories) || 0;
    current = inScope.reduce((s, a) => s + (Number(a?.calories) || 0), 0);
  } else if (ch?.metricType) {
    target = 1; // pelo menos 1 atividade do tipo
    current = inScope.filter((a) => a?.type === ch.metricType).length;
  } else {
    target = 1;
    current = 0;
  }

  const v = target <= 0 ? 0 : Math.max(0, Math.min(1, current / target));
  const pct = Math.round(v * 100);
  return { value: v, label: `${pct}%`, numeric: current, target };
}

export default function HomePage() {
  const {
    activeChallenges,
    completedChallenges,
    activities,
  } = useActivityStore();

  /** Perfil para saber mascote e um nome amigável */
  const [mascot, setMascot] = useState<MascotKey | undefined>(undefined);
  const [userName, setUserName] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const p: ProfileDTO = await getProfile();
        if (mounted) {
          setMascot(p?.mascot);
          setUserName(p?.email?.split("@")?.[0]);
        }
      } catch {
        if (mounted) {
          setMascot(undefined);
          setUserName(undefined);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  /** ---------- LEVEL a partir dos desafios concluídos ---------- */
  const totalXP = useMemo(
    () => (Array.isArray(completedChallenges)
      ? completedChallenges.reduce((s, c) => s + (Number(c?.rewardXP) || 0), 0)
      : 0),
    [completedChallenges]
  );
  const lvl = useMemo(() => splitLevelFromXP(totalXP), [totalXP]);

  /** ---------- Próximo desafio (pega o 1º ativo) ---------- */
  const nextChallenge = useMemo(() => {
    if (!Array.isArray(activeChallenges) || activeChallenges.length === 0) return null;
    // caso queira priorizar por expiração/startedAt, ordene aqui
    return activeChallenges[0];
  }, [activeChallenges]);

  const prog = useMemo(
    () => computeChallengeProgress(nextChallenge, activities || []),
    [nextChallenge, activities]
  );

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* (1) Kaizoo do usuário */}
        <MascotCard mascot={mascot} name={userName ?? "Atleta"} />
        <View style={{ height: spacing.md }} />

        {/* (2) Card de Nível (voltou!) */}
        <Card style={{ padding: spacing.md }}>
          <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.xs }}>
            Seu nível
          </Text>

          <Text style={{ marginBottom: spacing.sm }}>
            Nível <Text weight="bold">{lvl.level}</Text>
          </Text>

          <ProgressBar value={lvl.progressToNext} />
          <View style={{ height: spacing.xs }} />

          <Text style={{ opacity: 0.8, fontSize: 12 }}>
            XP no nível: {lvl.currentIntoLevel}/{lvl.nextLevelCost} • XP total: {totalXP}
          </Text>
        </Card>

        <View style={{ height: spacing.md }} />

        {/* (3) Próximo desafio */}
        <Card style={{ padding: spacing.md }}>
          <Text variant="subtitle" weight="bold" style={{ marginBottom: spacing.xs }}>
            Próximo desafio
          </Text>

          {nextChallenge ? (
            <>
              <Text weight="bold" style={{ marginBottom: spacing.xs }}>
                {nextChallenge.title}
              </Text>

              {!!nextChallenge.description && (
                <Text style={{ marginBottom: spacing.sm, opacity: 0.9 }}>
                  {nextChallenge.description}
                </Text>
              )}

              <ProgressBar value={prog.value} />
              <View style={{ height: spacing.xs }} />
              <Text style={{ fontSize: 12, opacity: 0.8 }}>
                Progresso: {prog.label} {prog.target > 1 ? `• (${prog.numeric}/${prog.target})` : ""}
              </Text>

              <View style={{ height: spacing.sm }} />
              <Text style={{ fontSize: 12, opacity: 0.8 }}>
                Recompensa: {nextChallenge.rewardXP ?? 0} XP
                {typeof nextChallenge.expiresInDays === "number"
                  ? ` • expira em ${nextChallenge.expiresInDays}d`
                  : ""}
                {nextChallenge.fromEvent && nextChallenge.eventDate
                  ? ` • evento: ${nextChallenge.eventDate}`
                  : ""}
              </Text>
            </>
          ) : (
            <>
              <Text style={{ marginBottom: spacing.sm }}>
                Você ainda não tem um desafio ativo.
              </Text>
              <Text style={{ fontSize: 12, opacity: 0.8 }}>
                Vá em <Text weight="bold">Desafios</Text> para ativar um e começar a ganhar XP!
              </Text>
            </>
          )}
        </Card>

        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </Screen>
  );
}
