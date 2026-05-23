import { StyleSheet, View } from "react-native";
import { RotateCcw } from "lucide-react-native";
import type { CEFRLevel, LevelProgress } from "../../features/progress/types";
import { calculateProgressPercent } from "../../features/progress/utils/progressUtils";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { AppText } from "../common/AppText";
import { AppButton } from "../common/AppButton";
import { AppCard } from "../common/AppCard";
import { ProgressBar } from "../stats/ProgressBar";

type LevelCardProps = {
  level: CEFRLevel;
  title: string;
  description: string;
  wordCount: number;
  progress: LevelProgress;
  onStart: () => void;
  onRestart: () => void;
};

export function LevelCard({
  level,
  title,
  description,
  wordCount,
  progress,
  onStart,
  onRestart,
}: LevelCardProps) {
  const hasProgress = progress.sessionOrderWordIds.length > 0 || progress.currentIndex > 0;
  const percent = calculateProgressPercent(progress.currentIndex, wordCount);

  return (
    <AppCard style={styles.card} padding="lg">
      <View style={styles.header}>
        <View style={styles.badge}>
          <AppText variant="h2" color={colors.white}>
            {level}
          </AppText>
        </View>
        <View style={styles.copy}>
          <AppText variant="h3">{title}</AppText>
          <AppText color={colors.muted}>{description}</AppText>
        </View>
      </View>
      <ProgressBar percent={percent} height={9} />
      <AppText variant="small" color={colors.muted}>
        {wordCount} words · {Math.min(progress.currentIndex, wordCount)} / {wordCount}
      </AppText>
      <View style={styles.actions}>
        <AppButton
          onPress={onStart}
          variant={hasProgress ? "primary" : "success"}
          accessibilityLabel={`${hasProgress ? "Continue" : "Start"} ${level}`}
        >
          {hasProgress ? "Continue" : "Start"}
        </AppButton>
        {hasProgress ? (
          <AppButton
            onPress={onRestart}
            variant="secondary"
            icon={RotateCcw}
            accessibilityLabel={`Restart ${level}`}
          >
            Restart
          </AppButton>
        ) : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexBasis: 280,
    minWidth: 280,
    minHeight: 200,
  },
  header: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  badge: {
    width: 62,
    height: 62,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
