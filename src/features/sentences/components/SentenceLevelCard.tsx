import { StyleSheet, View } from "react-native";
import { RotateCcw } from "lucide-react-native";
import { AppText } from "../../../components/common/AppText";
import { AppButton } from "../../../components/common/AppButton";
import { AppCard } from "../../../components/common/AppCard";
import { ProgressBar } from "../../../components/stats/ProgressBar";
import type { SentenceLevel } from "../types";
import type { SentenceLevelProgress } from "../types";
import { calculateSentenceProgressPercent } from "../utils/sentenceProgressUtils";
import { colors } from "../../../theme/colors";
import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";

type SentenceLevelCardProps = {
  level: SentenceLevel;
  title: string;
  description: string;
  sentenceCount: number;
  progress: SentenceLevelProgress;
  onStart: () => void;
  onRestart: () => void;
};

export function SentenceLevelCard({
  level,
  title,
  description,
  sentenceCount,
  progress,
  onStart,
  onRestart,
}: SentenceLevelCardProps) {
  const hasProgress =
    progress.sessionOrderSentenceIds.length > 0 || progress.currentIndex > 0;
  const percent = calculateSentenceProgressPercent(progress.currentIndex, sentenceCount);
  const current = Math.min(progress.currentIndex, sentenceCount);

  return (
    <AppCard style={styles.card} padding="lg">
      <View style={styles.header}>
        <View style={styles.badge}>
          <AppText variant="h2" color={colors.background}>
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
        Sentence {current} / {sentenceCount}
      </AppText>
      <View style={styles.actions}>
        <AppButton onPress={onStart} variant={hasProgress ? "primary" : "success"}>
          {hasProgress ? "Continue" : "Start"}
        </AppButton>
        {hasProgress ? (
          <AppButton onPress={onRestart} variant="secondary" icon={RotateCcw}>
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
    gap: spacing.md,
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
