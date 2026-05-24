import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AlertTriangle, BarChart3, BookOpen, ChevronRight, Heart, Play, RotateCcw } from "lucide-react-native";
import { useRouter } from "expo-router";
import { AppText } from "../../components/common/AppText";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { useConfirmDialog } from "../../components/common/ConfirmDialog";
import { PageHeader } from "../../components/common/PageHeader";
import { SegmentedControl } from "../../components/common/SegmentedControl";
import { ProgressBar } from "../../components/stats/ProgressBar";
import { AppScaffold } from "../../components/layout/AppScaffold";
import { WORD_LEVELS } from "../../features/words/config/levels";
import { useActiveProfile } from "../../features/profile/hooks/useActiveProfile";
import { useProgress } from "../../features/progress/hooks/useProgress";
import type { CEFRLevel } from "../../features/progress/types";
import { progressStorageService } from "../../features/progress/services/progressStorageService";
import { calculateProgressPercent } from "../../features/progress/utils/progressUtils";
import { wordsDataService } from "../../features/words/services/wordsDataService";
import { colors } from "../../theme/colors";
import { gradients } from "../../theme/gradients";
import { radii } from "../../theme/radii";
import { shadows } from "../../theme/shadows";
import { spacing } from "../../theme/spacing";
import { useResponsive } from "../../utils/useResponsive";

export default function LevelSelectionScreen() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { activeProfile } = useActiveProfile();
  const { progress, reload } = useProgress(activeProfile?.id);
  const { confirm, dialog } = useConfirmDialog();
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>("A1");

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
    }
  }, [activeProfile, router]);

  useEffect(() => {
    if (progress?.lastSelectedLevel) {
      setSelectedLevel(progress.lastSelectedLevel);
    }
  }, [progress?.lastSelectedLevel]);

  if (!activeProfile || !progress) {
    return null;
  }

  const profile = activeProfile;
  const levelOptions = WORD_LEVELS.map((level) => ({ label: level.id, value: level.id }));
  const selectedConfig = WORD_LEVELS.find((level) => level.id === selectedLevel) ?? WORD_LEVELS[0]!;
  const levelProgress = progress.levels[selectedLevel];
  const wordCount = wordsDataService.getWordCount(selectedLevel);
  const current = Math.min(levelProgress.currentIndex, wordCount);
  const percent = calculateProgressPercent(current, wordCount);
  const hasProgress = levelProgress.sessionOrderWordIds.length > 0 || levelProgress.currentIndex > 0;
  const favorites = levelProgress.favoriteWordIds.length;
  const difficult = levelProgress.difficultWordIds.length;
  const remaining = Math.max(0, wordCount - current);

  function restartLevel(level: CEFRLevel) {
    confirm({
      title: `Restart ${level}?`,
      message: "This resets only this level for the current profile.",
      confirmLabel: "Restart Level",
      variant: "danger",
      onConfirm: () => {
        void (async () => {
          await progressStorageService.resetLevel(profile.id, level);
          await reload();
        })();
      },
    });
  }

  return (
    <AppScaffold>
      {dialog}
      <PageHeader
        title={`Sözlər (${selectedLevel})`}
        subtitle={`Progress shown here belongs only to ${profile.name}.`}
        icon={BookOpen}
        onBack={() => router.back()}
      />

      <SegmentedControl<CEFRLevel> options={levelOptions} value={selectedLevel} onChange={setSelectedLevel} />

      <View style={[styles.dashboard, isMobile && styles.dashboardMobile]}>
        <LinearGradient colors={gradients.words} start={[0, 0]} end={[1, 1]} style={styles.progressHero}>
          <View style={styles.progressRing}>
            <AppText variant="h1" color={colors.white}>
              {Math.round(percent)}%
            </AppText>
            <AppText variant="small" color="rgba(255,255,255,0.8)">
              irəliləyiş
            </AppText>
          </View>
          <View style={styles.heroCopy}>
            <AppText variant="h2" color={colors.white}>
              {selectedConfig.title}
            </AppText>
            <AppText color="rgba(255,255,255,0.78)">{selectedConfig.description}</AppText>
            <ProgressBar percent={percent} height={8} color={colors.progress} trackColor="rgba(255,255,255,0.18)" />
            <AppButton icon={Play} onPress={() => router.push(`/words/practice/${selectedLevel}`)} size="lg">
              {hasProgress ? "Dərsə davam et" : "Dərsə başla"}
            </AppButton>
          </View>
        </LinearGradient>

        <View style={styles.statsCard}>
          <StatLine color={colors.success} label="Düz" value={levelProgress.correctCount} />
          <StatLine color={colors.danger} label="Yanlış" value={levelProgress.wrongCount} />
          <StatLine color={colors.teal} label="Qalan" value={remaining} />
          <StatLine color={colors.primary} label="Söz sayı" value={wordCount} />
          {hasProgress ? (
            <AppButton variant="secondary" icon={RotateCcw} onPress={() => restartLevel(selectedLevel)}>
              Restart
            </AppButton>
          ) : null}
        </View>
      </View>

      <View style={styles.quickGrid}>
        <QuickPanel
          icon={<Heart color={colors.primary} size={24} />}
          title="Favoritlər"
          detail={`${favorites} söz`}
          onPress={() => router.push("/words/favorites")}
        />
        <QuickPanel
          icon={<AlertTriangle color={colors.danger} size={24} />}
          title="Çətin sözlər"
          detail={`${difficult} söz`}
          onPress={() => router.push("/words/review-difficult")}
        />
        <QuickPanel
          icon={<BookOpen color={colors.teal} size={24} />}
          title="Əvvəlki sessiya"
          detail={`Söz ${current} / ${wordCount}`}
          onPress={() => router.push(`/words/practice/${selectedLevel}`)}
        />
        <QuickPanel
          icon={<BarChart3 color={colors.progress} size={24} />}
          title="Statistika"
          detail={`${levelProgress.totalAttempts} cəhd`}
          onPress={() => router.push("/statistics")}
        />
      </View>
    </AppScaffold>
  );
}

function StatLine({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <View style={styles.statLine}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <AppText color={colors.textSoft} style={styles.statLabel}>
        {label}
      </AppText>
      <AppText variant="h3">{value}</AppText>
    </View>
  );
}

function QuickPanel({
  icon,
  title,
  detail,
  onPress,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <AppCard onPress={onPress} style={styles.quickPanel}>
      <View style={styles.quickIcon}>{icon}</View>
      <View style={styles.quickCopy}>
        <AppText variant="h3">{title}</AppText>
        <AppText variant="small" color={colors.muted}>
          {detail}
        </AppText>
      </View>
      <ChevronRight color={colors.muted} size={20} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  dashboard: {
    flexDirection: "row",
    gap: spacing.md,
  },
  dashboardMobile: {
    flexDirection: "column",
  },
  progressHero: {
    flex: 1.5,
    minHeight: 250,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...shadows.glow,
  },
  progressRing: {
    width: 122,
    height: 122,
    borderRadius: 61,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 10,
    borderColor: colors.progress,
    backgroundColor: "rgba(6,17,31,0.34)",
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.md,
  },
  statsCard: {
    flex: 1,
    minHeight: 250,
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.xxl,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLine: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statLabel: {
    flex: 1,
    fontWeight: "800",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  quickPanel: {
    flexGrow: 1,
    flexBasis: 230,
    minWidth: 180,
    flexDirection: "row",
    alignItems: "center",
  },
  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
});
