import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { BarChart3, Flame, RefreshCw, Target, Trophy, Zap } from "lucide-react-native";
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
import { useGrammarProgress } from "../features/grammar/hooks/useGrammarProgress";
import { useLearningSummary } from "../features/learning/hooks/useLearningSummary";
import { learningEventService } from "../features/learning/services/learningEventService";
import type { LearningEvent } from "../features/learning/types";
import { useWritingProgress } from "../features/writing/hooks/useWritingProgress";
import { colors } from "../theme/colors";
import { gradients } from "../theme/gradients";
import { radii } from "../theme/radii";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { useResponsive } from "../utils/useResponsive";

type StatsTab = "overall" | "words" | "sentences" | "grammar" | "writing" | "review";

const tabs: { label: string; value: StatsTab }[] = [
  { label: "Overall", value: "overall" },
  { label: "Words", value: "words" },
  { label: "Sentences", value: "sentences" },
  { label: "Grammar", value: "grammar" },
  { label: "Writing", value: "writing" },
  { label: "Review", value: "review" },
];

const sentenceModes: SentencePracticeMode[] = ["repeat", "translate"];

export default function StatisticsScreen() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { activeProfile } = useActiveProfile();
  const { progress, reload: reloadWords } = useProgress(activeProfile?.id);
  const { progress: sentenceProgress, reload: reloadSentences } = useSentenceProgress(activeProfile?.id);
  const { progress: grammarProgress, reload: reloadGrammar } = useGrammarProgress(activeProfile?.id);
  const { progress: writingProgress, reload: reloadWriting } = useWritingProgress(activeProfile?.id);
  const { summary: learningSummary, reload: reloadLearningSummary } = useLearningSummary(activeProfile?.id);
  const [learningEvents, setLearningEvents] = useState<LearningEvent[]>([]);
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
        void reloadGrammar();
        void reloadWriting();
        void reloadLearningSummary();
        void learningEventService.getLearningEvents(activeProfile.id).then(setLearningEvents);
      }
    }, [
      activeProfile?.id,
      reloadGrammar,
      reloadLearningSummary,
      reloadSentences,
      reloadWords,
      reloadWriting,
    ]),
  );

  const stats = useMemo(() => {
    const wordLevels = progress ? CEFR_LEVELS.map((level) => progress.levels[level]) : [];
    const sentenceLevels = sentenceProgress
      ? sentenceModes.flatMap((mode) => SENTENCE_LEVEL_IDS.map((level) => sentenceProgress.levels[mode][level]))
      : [];
    const grammarLevels = grammarProgress
      ? Object.values(grammarProgress.levels).flatMap((levelsByLevel) => Object.values(levelsByLevel))
      : [];
    const writingLevels = writingProgress
      ? Object.values(writingProgress.levels).flatMap((levelsByLevel) => Object.values(levelsByLevel))
      : [];
    const reviewEvents = learningEvents.filter((event) => event.activityType === "review");

    const wordCorrect = wordLevels.reduce((sum, level) => sum + level.correctCount, 0);
    const wordWrong = wordLevels.reduce((sum, level) => sum + level.wrongCount, 0);
    const wordCompleted = wordLevels.reduce((sum, level) => sum + level.completedWordIds.length, 0);
    const sentenceCorrect = sentenceLevels.reduce((sum, level) => sum + level.correctCount, 0);
    const sentenceWrong = sentenceLevels.reduce((sum, level) => sum + level.wrongCount, 0);
    const sentenceCompleted = sentenceLevels.reduce(
      (sum, level) => sum + level.completedSentenceIds.length,
      0,
    );
    const grammarCorrect = grammarLevels.reduce((sum, level) => sum + level.correctCount, 0);
    const grammarWrong = grammarLevels.reduce((sum, level) => sum + level.wrongCount, 0);
    const grammarCompleted = grammarLevels.reduce(
      (sum, level) => sum + level.completedExerciseIds.length,
      0,
    );
    const writingCorrect = writingLevels.reduce((sum, level) => sum + level.correctCount, 0);
    const writingWrong = writingLevels.reduce((sum, level) => sum + level.wrongCount, 0);
    const writingCompleted = writingLevels.reduce((sum, level) => sum + level.completedItemIds.length, 0);
    const reviewCorrect = reviewEvents.filter((event) => event.result === "correct").length;
    const reviewWrong = reviewEvents.filter((event) => event.result === "wrong").length;

    const moduleRows = [
      { key: "words" as const, label: "Words", correct: wordCorrect, wrong: wordWrong, completed: wordCompleted },
      {
        key: "sentences" as const,
        label: "Sentences",
        correct: sentenceCorrect,
        wrong: sentenceWrong,
        completed: sentenceCompleted,
      },
      {
        key: "grammar" as const,
        label: "Grammar",
        correct: grammarCorrect,
        wrong: grammarWrong,
        completed: grammarCompleted,
      },
      {
        key: "writing" as const,
        label: "Writing",
        correct: writingCorrect,
        wrong: writingWrong,
        completed: writingCompleted,
      },
      {
        key: "review" as const,
        label: "Review",
        correct: reviewCorrect,
        wrong: reviewWrong,
        completed: reviewCorrect,
      },
    ];

    const selected =
      tab === "overall"
        ? {
            correct: moduleRows.reduce((sum, row) => sum + row.correct, 0),
            wrong: moduleRows.reduce((sum, row) => sum + row.wrong, 0),
            completed: moduleRows.reduce((sum, row) => sum + row.completed, 0),
          }
        : moduleRows.find((row) => row.key === tab) ?? {
            correct: 0,
            wrong: 0,
            completed: 0,
          };
    const correct = selected.correct;
    const wrong = selected.wrong;
    const completed = selected.completed;
    const attempts = correct + wrong;
    const ratio = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
    const rowsWithAttempts = moduleRows
      .map((row) => ({
        ...row,
        attempts: row.correct + row.wrong,
        ratio: row.correct + row.wrong > 0 ? Math.round((row.correct / (row.correct + row.wrong)) * 100) : 0,
      }))
      .filter((row) => row.attempts > 0);
    const strongest = [...rowsWithAttempts].sort((a, b) => b.ratio - a.ratio)[0]?.label ?? "Not enough data";
    const weakest = [...rowsWithAttempts].sort((a, b) => a.ratio - b.ratio)[0]?.label ?? "Not enough data";

    return {
      attempts,
      completed,
      correct,
      grammarCompleted,
      grammarCorrect,
      grammarWrong,
      moduleRows,
      ratio,
      reviewCorrect,
      reviewWrong,
      sentenceCompleted,
      sentenceCorrect,
      sentenceWrong,
      strongest,
      weakest,
      writingCompleted,
      writingCorrect,
      writingWrong,
      wordCompleted,
      wordCorrect,
      wordWrong,
      wrong,
    };
  }, [grammarProgress, learningEvents, progress, sentenceProgress, tab, writingProgress]);

  if (!activeProfile || !progress) {
    return null;
  }

  const dailyPercent = Math.min(
    100,
    Math.round((progress.dailyGoal.completedWords / progress.dailyGoal.targetWords) * 100),
  );
  const xp = learningSummary?.xp;
  const dueReviewCount = learningSummary?.dueReviewItems.length ?? 0;
  const dailyPath = learningSummary?.dailyPath;
  const dailyPathPercent =
    dailyPath && dailyPath.totalTasks > 0
      ? Math.round((dailyPath.completedTasks / dailyPath.totalTasks) * 100)
      : 0;
  const weeklyValues = createChartValues(stats.correct, stats.wrong);

  return (
    <AppScaffold>
      <View style={styles.header}>
        <View>
          <AppText variant="h1">Statistics</AppText>
          <AppText color={colors.muted}>Learning dashboard for {activeProfile.name}</AppText>
        </View>
        <View style={styles.gem}>
          <Zap color={colors.secondary} size={18} />
          <AppText variant="label" color={colors.white}>
            {xp?.todayXp ?? 0} XP today
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
              Daily goal
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
          value={`${progress.currentDayStreak} days`}
          detail={`Best streak: ${progress.bestDayStreak} days`}
        />
        <StatPanel
          icon={<Trophy color={colors.secondary} size={24} />}
          title="Correct ratio"
          value={`${stats.ratio}%`}
          detail={`${stats.correct} correct - ${stats.wrong} wrong`}
        />
        <StatPanel
          icon={<Zap color={colors.secondary} size={24} />}
          title="XP level"
          value={`${xp?.totalXp ?? 0} XP`}
          detail={xp?.levelTitle ?? "Beginner Explorer"}
        />
        <StatPanel
          icon={<RefreshCw color={colors.progress} size={24} />}
          title="Review due"
          value={`${dueReviewCount} items`}
          detail="Spaced repetition queue"
        />
        <StatPanel
          icon={<Target color={colors.primary} size={24} />}
          title="Daily path"
          value={`${dailyPath?.completedTasks ?? 0} / ${dailyPath?.totalTasks ?? 0}`}
          detail={`${dailyPathPercent}% complete`}
        />
      </View>

      <View style={[styles.contentGrid, isMobile && styles.singleColumn]}>
        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBubbleSmall}>
              <BarChart3 color={colors.progress} size={20} />
            </View>
            <View>
              <AppText variant="h2">Progress markers</AppText>
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
          <SummaryRow label="Strongest" value={stats.strongest} color={colors.success} />
          <SummaryRow label="Needs work" value={stats.weakest} color={colors.warning} />
        </View>

        <View style={styles.summaryCard}>
          <AppText variant="h2">Module Breakdown</AppText>
          {stats.moduleRows.map((row) => (
            <ModuleRow
              key={row.key}
              label={row.label}
              correct={row.correct}
              wrong={row.wrong}
              completed={row.completed}
            />
          ))}
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

function ModuleRow({
  label,
  correct,
  wrong,
  completed,
}: {
  label: string;
  correct: number;
  wrong: number;
  completed: number;
}) {
  const attempts = correct + wrong;
  const percent = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

  return (
    <View style={styles.moduleRow}>
      <View style={styles.moduleRowHeader}>
        <AppText variant="small" color={colors.textSoft} style={styles.summaryLabel}>
          {label}
        </AppText>
        <AppText variant="small" color={colors.muted}>
          {completed} done
        </AppText>
      </View>
      <ProgressBar percent={percent} height={7} color={colors.progress} trackColor="rgba(255,255,255,0.10)" />
      <AppText variant="small" color={colors.muted}>
        {correct} correct - {wrong} wrong
      </AppText>
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
    flexWrap: "wrap",
  },
  contentGrid: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md,
    flexWrap: "wrap",
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
    minWidth: 180,
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
  moduleRow: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  moduleRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
});
