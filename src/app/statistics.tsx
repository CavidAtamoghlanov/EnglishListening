import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { BarChart3, Flame, Target, Trophy } from "lucide-react-native";
import { AppScaffold } from "../components/layout/AppScaffold";
import { AppText } from "../components/common/AppText";
import { SegmentedControl } from "../components/common/SegmentedControl";
import { ProgressBar } from "../components/stats/ProgressBar";
import { CEFR_LEVELS } from "../config/levels";
import { useActiveProfile } from "../features/profile/hooks/useActiveProfile";
import { useProgress } from "../features/progress/hooks/useProgress";
import { useSentenceProgress } from "../features/sentences/hooks/useSentenceProgress";
import { SENTENCE_LEVEL_IDS } from "../features/sentences/config/levels";
import type { SentencePracticeMode } from "../features/sentences/types";
import { colors } from "../theme/colors";
import { gradients } from "../theme/gradients";
import { radii } from "../theme/radii";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { useResponsive } from "../utils/useResponsive";

type StatsTab = "overall" | "words" | "sentences";

const tabs: { label: string; value: StatsTab }[] = [
  { label: "Ümumi", value: "overall" },
  { label: "Sözlər", value: "words" },
  { label: "Cümlələr", value: "sentences" },
];

const sentenceModes: SentencePracticeMode[] = ["repeat", "translate"];

export default function StatisticsScreen() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { activeProfile } = useActiveProfile();
  const { progress, reload: reloadWords } = useProgress(activeProfile?.id);
  const { progress: sentenceProgress, reload: reloadSentences } = useSentenceProgress(activeProfile?.id);
  const [tab, setTab] = useState<StatsTab>("overall");

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
    }
  }, [activeProfile, router]);

  useFocusEffect(
    useCallback(() => {
      if (activeProfile?.id) {
        void reloadWords();
        void reloadSentences();
      }
    }, [activeProfile?.id, reloadSentences, reloadWords]),
  );

  const stats = useMemo(() => {
    const wordLevels = progress ? CEFR_LEVELS.map((level) => progress.levels[level]) : [];
    const sentenceLevels = sentenceProgress
      ? sentenceModes.flatMap((mode) => SENTENCE_LEVEL_IDS.map((level) => sentenceProgress.levels[mode][level]))
      : [];

    const wordCorrect = wordLevels.reduce((sum, level) => sum + level.correctCount, 0);
    const wordWrong = wordLevels.reduce((sum, level) => sum + level.wrongCount, 0);
    const wordCompleted = wordLevels.reduce((sum, level) => sum + level.completedWordIds.length, 0);
    const sentenceCorrect = sentenceLevels.reduce((sum, level) => sum + level.correctCount, 0);
    const sentenceWrong = sentenceLevels.reduce((sum, level) => sum + level.wrongCount, 0);
    const sentenceCompleted = sentenceLevels.reduce(
      (sum, level) => sum + level.completedSentenceIds.length,
      0,
    );
    const correct = tab === "sentences" ? sentenceCorrect : tab === "words" ? wordCorrect : wordCorrect + sentenceCorrect;
    const wrong = tab === "sentences" ? sentenceWrong : tab === "words" ? wordWrong : wordWrong + sentenceWrong;
    const completed =
      tab === "sentences" ? sentenceCompleted : tab === "words" ? wordCompleted : wordCompleted + sentenceCompleted;
    const attempts = correct + wrong;
    const ratio = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

    return {
      attempts,
      completed,
      correct,
      ratio,
      sentenceCompleted,
      sentenceCorrect,
      sentenceWrong,
      wordCompleted,
      wordCorrect,
      wordWrong,
      wrong,
    };
  }, [progress, sentenceProgress, tab]);

  if (!activeProfile || !progress) {
    return null;
  }

  const dailyPercent = Math.min(
    100,
    Math.round((progress.dailyGoal.completedWords / progress.dailyGoal.targetWords) * 100),
  );
  const weeklyValues = createChartValues(stats.correct, stats.wrong);

  return (
    <AppScaffold>
      <View style={styles.header}>
        <View>
          <AppText variant="h1">Statistika</AppText>
          <AppText color={colors.muted}>Progress for {activeProfile.name}</AppText>
        </View>
        <View style={styles.gem}>
          <AppText style={styles.gemText}>💎</AppText>
          <AppText variant="label" color={colors.white}>
            {stats.correct + progress.bestDayStreak}
          </AppText>
        </View>
      </View>

      <SegmentedControl options={tabs} value={tab} onChange={setTab} />

      <View style={[styles.topGrid, isMobile && styles.singleColumn]}>
        <LinearGradient colors={gradients.stats} start={[0, 0]} end={[1, 1]} style={styles.heroCard}>
          <View style={styles.iconBubble}>
            <Target color={colors.white} size={24} />
          </View>
          <View style={styles.heroCopy}>
            <AppText variant="small" color="rgba(255,255,255,0.78)">
              Gündəlik hədəf
            </AppText>
            <AppText variant="h1" color={colors.white}>
              {progress.dailyGoal.completedWords} / {progress.dailyGoal.targetWords}
            </AppText>
            <ProgressBar percent={dailyPercent} height={8} color={colors.progress} trackColor="rgba(255,255,255,0.18)" />
          </View>
        </LinearGradient>

        <StatPanel
          icon={<Flame color={colors.primary} size={24} />}
          title="Streak"
          value={`${progress.currentDayStreak} gün`}
          detail={`Best streak: ${progress.bestDayStreak} gün`}
        />
        <StatPanel
          icon={<Trophy color={colors.secondary} size={24} />}
          title="Düz cavab nisbəti"
          value={`${stats.ratio}%`}
          detail={`${stats.correct} düz · ${stats.wrong} yanlış`}
        />
      </View>

      <View style={[styles.contentGrid, isMobile && styles.singleColumn]}>
        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBubbleSmall}>
              <BarChart3 color={colors.progress} size={20} />
            </View>
            <View>
              <AppText variant="h2">İrəliləyiş qrafiki</AppText>
              <AppText variant="small" color={colors.muted}>
                Last 7 practice markers
              </AppText>
            </View>
          </View>
          <View style={styles.chart}>
            {weeklyValues.map((value, index) => (
              <View key={`${value}-${index}`} style={styles.chartColumn}>
                <View style={[styles.chartBar, { height: 24 + value * 2 }]} />
                <AppText variant="small" color={colors.muted}>
                  {index + 1}
                </AppText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <AppText variant="h2">Summary</AppText>
          <SummaryRow label="Completed" value={String(stats.completed)} color={colors.progress} />
          <SummaryRow label="Correct" value={String(stats.correct)} color={colors.success} />
          <SummaryRow label="Wrong" value={String(stats.wrong)} color={colors.danger} />
          <SummaryRow label="Attempts" value={String(stats.attempts)} color={colors.teal} />
        </View>
      </View>
    </AppScaffold>
  );
}

function createChartValues(correct: number, wrong: number) {
  const base = Math.max(3, Math.round((correct + wrong) / 7));
  return Array.from({ length: 7 }, (_, index) => Math.max(1, base + ((index * 3 + correct) % 9)));
}

function StatPanel({
  icon,
  title,
  value,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <View style={styles.statPanel}>
      <View style={styles.iconBubbleSmall}>{icon}</View>
      <View style={styles.panelCopy}>
        <AppText variant="small" color={colors.muted}>
          {title}
        </AppText>
        <AppText variant="h2">{value}</AppText>
        <AppText variant="small" color={colors.muted}>
          {detail}
        </AppText>
      </View>
    </View>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.summaryRow}>
      <View style={[styles.summaryDot, { backgroundColor: color }]} />
      <AppText color={colors.textSoft} style={styles.summaryLabel}>
        {label}
      </AppText>
      <AppText variant="h3">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  gem: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    backgroundColor: colors.secondarySoft,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.38)",
  },
  gemText: {
    fontSize: 18,
  },
  topGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  contentGrid: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md,
  },
  singleColumn: {
    flexDirection: "column",
  },
  heroCard: {
    flex: 1.4,
    minHeight: 150,
    justifyContent: "space-between",
    padding: spacing.lg,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.glow,
  },
  heroCopy: {
    gap: spacing.sm,
  },
  statPanel: {
    flex: 1,
    minHeight: 150,
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xxl,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  panelCopy: {
    gap: spacing.xs,
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  iconBubbleSmall: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartCard: {
    flex: 1.5,
    minHeight: 280,
    gap: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.xxl,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  chart: {
    flex: 1,
    minHeight: 150,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
  },
  chartBar: {
    width: "72%",
    maxWidth: 42,
    borderTopLeftRadius: radii.round,
    borderTopRightRadius: radii.round,
    backgroundColor: colors.progress,
    shadowColor: colors.progress,
    shadowOpacity: 0.32,
    shadowRadius: 14,
  },
  summaryCard: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xxl,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  summaryLabel: {
    flex: 1,
    fontWeight: "800",
  },
});
