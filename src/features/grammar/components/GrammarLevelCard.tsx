import { StyleSheet, View } from "react-native";
import { Play, RotateCcw } from "lucide-react-native";
import { AppButton } from "../../../components/common/AppButton";
import { AppCard } from "../../../components/common/AppCard";
import { AppText } from "../../../components/common/AppText";
import { ProgressBar } from "../../../components/stats/ProgressBar";
import type { GrammarLevelConfig } from "../config/levels";
import { colors } from "../../../theme/colors";
import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";

type GrammarLevelCardProps = {
  config: GrammarLevelConfig;
  current: number;
  total: number;
  percent: number;
  attempts: number;
  hasProgress: boolean;
  selected?: boolean;
  onStart: () => void;
  onRestart: () => void;
};

export function GrammarLevelCard({
  config,
  current,
  total,
  percent,
  attempts,
  hasProgress,
  selected,
  onStart,
  onRestart,
}: GrammarLevelCardProps) {
  return (
    <AppCard
      padding="lg"
      style={selected ? [styles.card, styles.cardSelected] : styles.card}
    >
      <View style={styles.header}>
        <View style={[styles.badge, selected && styles.badgeSelected]}>
          <AppText variant="label" color={selected ? colors.background : colors.primary}>
            {config.id}
          </AppText>
        </View>
        <AppText variant="small" color={colors.muted}>
          {current} / {total}
        </AppText>
      </View>

      <View style={styles.copy}>
        <AppText variant="h3">{config.title}</AppText>
        <AppText variant="small" color={colors.muted}>
          {config.description}
        </AppText>
      </View>

      <ProgressBar percent={percent} height={8} color={colors.progress} trackColor="rgba(255,255,255,0.10)" />

      <View style={styles.footer}>
        <AppText variant="small" color={colors.muted}>
          {attempts} attempts
        </AppText>
        <View style={styles.actions}>
          {hasProgress ? (
            <AppButton variant="secondary" size="sm" icon={RotateCcw} onPress={onRestart}>
              Restart
            </AppButton>
          ) : null}
          <AppButton size="sm" icon={Play} onPress={onStart}>
            {hasProgress ? "Continue" : "Start"}
          </AppButton>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexBasis: 280,
    minWidth: 260,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(250,204,21,0.09)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  badge: {
    minWidth: 44,
    minHeight: 34,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(250,204,21,0.10)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.25)",
  },
  badgeSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  copy: {
    gap: spacing.xs,
  },
  footer: {
    gap: spacing.md,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
