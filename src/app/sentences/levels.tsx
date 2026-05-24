import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BarChart3, ChevronRight, MessageSquareText, Play, RotateCcw } from "lucide-react-native";
import { AppText } from "../../components/common/AppText";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { useConfirmDialog } from "../../components/common/ConfirmDialog";
import { PageHeader } from "../../components/common/PageHeader";
import { SegmentedControl } from "../../components/common/SegmentedControl";
import { ProgressBar } from "../../components/stats/ProgressBar";
import { AppScaffold } from "../../components/layout/AppScaffold";
import { SENTENCE_LEVELS } from "../../features/sentences/config/levels";
import { getSentenceModeConfig, parseSentenceModeParam } from "../../features/sentences/config/modes";
import { useActiveProfile } from "../../features/profile/hooks/useActiveProfile";
import { useSentenceProgress } from "../../features/sentences/hooks/useSentenceProgress";
import { sentenceDataService } from "../../features/sentences/services/sentenceDataService";
import { sentenceProgressStorageService } from "../../features/sentences/services/sentenceProgressStorageService";
import type { SentenceLevel } from "../../features/sentences/types";
import { calculateSentenceProgressPercent } from "../../features/sentences/utils/sentenceProgressUtils";
import { colors } from "../../theme/colors";
import { gradients } from "../../theme/gradients";
import { radii } from "../../theme/radii";
import { shadows } from "../../theme/shadows";
import { spacing } from "../../theme/spacing";
import { useResponsive } from "../../utils/useResponsive";

export default function SentenceLevelSelectionScreen() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const mode = parseSentenceModeParam(modeParam);
  const modeConfig = mode ? getSentenceModeConfig(mode) : null;
  const { activeProfile } = useActiveProfile();
  const { progress, reload } = useSentenceProgress(activeProfile?.id);
  const { confirm, dialog } = useConfirmDialog();
  const [selectedLevel, setSelectedLevel] = useState<SentenceLevel>("A1");

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
      return;
    }
    if (!mode) {
      router.replace("/sentences");
    }
  }, [activeProfile, mode, router]);

  useEffect(() => {
    if (progress?.lastSelectedLevel) {
      setSelectedLevel(progress.lastSelectedLevel);
    }
  }, [progress?.lastSelectedLevel]);

  if (!activeProfile || !progress || !mode || !modeConfig) {
    return null;
  }

  const profile = activeProfile;
  const activeMode = mode;
  const activeModeConfig = modeConfig;
  const levelOptions = SENTENCE_LEVELS.map((level) => ({ label: level.id, value: level.id }));
  const selectedConfig = SENTENCE_LEVELS.find((level) => level.id === selectedLevel) ?? SENTENCE_LEVELS[0]!;
  const levelProgress = progress.levels[activeMode][selectedLevel];
  const sentenceCount = sentenceDataService.getSentenceCount(activeMode, selectedLevel);
  const current = Math.min(levelProgress.currentIndex, sentenceCount);
  const percent = calculateSentenceProgressPercent(current, sentenceCount);
  const hasProgress = levelProgress.sessionOrderSentenceIds.length > 0 || levelProgress.currentIndex > 0;
  const remaining = Math.max(0, sentenceCount - current);

  function restartLevel(level: SentenceLevel) {
    confirm({
      title: `Restart ${level}?`,
      message: `This resets ${activeModeConfig.title} for ${level} on this profile only.`,
      confirmLabel: "Restart Level",
      variant: "danger",
      onConfirm: () => {
        void (async () => {
          await sentenceProgressStorageService.resetLevel(profile.id, activeMode, level);
          await reload();
        })();
      },
    });
  }

  return (
    <AppScaffold>
      {dialog}
      <PageHeader
        title={`${activeModeConfig.title} (${selectedLevel})`}
        subtitle={`${profile.name} - choose a level`}
        icon={activeModeConfig.icon}
        onBack={() => router.back()}
      />

      <SegmentedControl<SentenceLevel> options={levelOptions} value={selectedLevel} onChange={setSelectedLevel} />

      <View style={[styles.dashboard, isMobile && styles.dashboardMobile]}>
        <LinearGradient
          colors={activeMode === "repeat" ? gradients.repeat : gradients.translate}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.progressHero}
        >
          <View style={styles.progressRing}>
            <AppText variant="h1" color={colors.white}>
              {Math.round(percent)}%
            </AppText>
            <AppText variant="small" color="rgba(255,255,255,0.8)">
              progress
            </AppText>
          </View>
          <View style={styles.heroCopy}>
            <AppText variant="h2" color={colors.white}>
              {selectedConfig.title}
            </AppText>
            <AppText color="rgba(255,255,255,0.78)">{selectedConfig.description}</AppText>
            <ProgressBar percent={percent} height={8} color={colors.progress} trackColor="rgba(255,255,255,0.18)" />
            <AppButton icon={Play} onPress={() => router.push(`/sentences/practice/${activeMode}/${selectedLevel}`)} size="lg">
              {hasProgress ? "Continue lesson" : "Start lesson"}
            </AppButton>
          </View>
        </LinearGradient>

        <View style={styles.statsCard}>
          <StatLine color={colors.success} label="Correct" value={levelProgress.correctCount} />
          <StatLine color={colors.danger} label="Wrong" value={levelProgress.wrongCount} />
          <StatLine color={colors.teal} label="Remaining" value={remaining} />
          <StatLine color={colors.primary} label="Sentences" value={sentenceCount} />
          {hasProgress ? (
            <AppButton variant="secondary" icon={RotateCcw} onPress={() => restartLevel(selectedLevel)}>
              Restart
            </AppButton>
          ) : null}
        </View>
      </View>

      <View style={styles.quickGrid}>
        <QuickPanel
          icon={<MessageSquareText color={colors.primary} size={24} />}
          title="Previous session"
          detail={`Sentence ${current} / ${sentenceCount}`}
          onPress={() => router.push(`/sentences/practice/${activeMode}/${selectedLevel}`)}
        />
        <QuickPanel
          icon={<BarChart3 color={colors.progress} size={24} />}
          title="Statistics"
          detail={`${levelProgress.totalAttempts} attempts`}
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
    flexBasis: 250,
    minWidth: 190,
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
