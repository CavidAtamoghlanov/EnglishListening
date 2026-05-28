import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FilePenLine } from "lucide-react-native";
import { useConfirmDialog } from "../../../components/common/ConfirmDialog";
import { PageHeader } from "../../../components/common/PageHeader";
import { Grid } from "../../../components/layout/Grid";
import { AppScaffold } from "../../../components/layout/AppScaffold";
import { WritingLevelCard } from "../../../features/writing/components/WritingLevelCard";
import { WRITING_LEVELS, type WritingLevelConfig } from "../../../features/writing/config/levels";
import { getWritingModeConfig, parseWritingModeParam } from "../../../features/writing/config/modes";
import { useWritingProgress } from "../../../features/writing/hooks/useWritingProgress";
import { writingDataService } from "../../../features/writing/services/writingDataService";
import { writingProgressStorageService } from "../../../features/writing/services/writingProgressStorageService";
import type { WritingLevel } from "../../../features/writing/types";
import { calculateWritingProgressPercent } from "../../../features/writing/utils/writingProgress";
import { useActiveProfile } from "../../../features/profile/hooks/useActiveProfile";
import { spacing } from "../../../theme/spacing";

export default function WritingLevelSelectionScreen() {
  const router = useRouter();
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const mode = parseWritingModeParam(modeParam);
  const modeConfig = mode ? getWritingModeConfig(mode) : null;
  const { activeProfile } = useActiveProfile();
  const { progress, reload } = useWritingProgress(activeProfile?.id);
  const { confirm, dialog } = useConfirmDialog();

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
      return;
    }
    if (!mode) {
      router.replace("/writing");
    }
  }, [activeProfile, mode, router]);

  if (!activeProfile || !progress || !mode || !modeConfig) {
    return null;
  }

  const profile = activeProfile;
  const writingProgress = progress;
  const activeMode = mode;
  const activeModeConfig = modeConfig;

  function getLevelState(config: WritingLevelConfig) {
    const levelProgress = writingProgress.levels[activeMode][config.id];
    const total = writingDataService.getItemCount(activeMode, config.id);
    const current = Math.min(levelProgress.currentIndex, total);
    const percent = calculateWritingProgressPercent(current, total);
    const hasProgress =
      levelProgress.sessionOrderItemIds.length > 0 || levelProgress.currentIndex > 0;
    return { levelProgress, total, current, percent, hasProgress };
  }

  function restartLevel(level: WritingLevel) {
    confirm({
      title: `Restart ${level}?`,
      message: `This resets ${activeModeConfig.title} for ${level} on this profile only.`,
      confirmLabel: "Restart Level",
      variant: "danger",
      onConfirm: () => {
        void (async () => {
          await writingProgressStorageService.resetLevel(profile.id, activeMode, level);
          await reload();
        })();
      },
    });
  }

  return (
    <AppScaffold maxWidth={1120}>
      {dialog}
      <PageHeader
        title={activeModeConfig.title}
        subtitle={`${profile.name} - choose a writing level`}
        icon={activeModeConfig.icon ?? FilePenLine}
        onBack={() => router.back()}
      />

      <Grid minItemWidth={280} gap={spacing.lg}>
        {WRITING_LEVELS.map((config) => {
          const state = getLevelState(config);
          return (
            <WritingLevelCard
              key={config.id}
              config={config}
              current={state.current}
              total={state.total}
              percent={state.percent}
              attempts={state.levelProgress.totalAttempts}
              hasProgress={state.hasProgress}
              selected={progress.lastSelectedLevel === config.id}
              onStart={() => router.push(`/writing/practice/${activeMode}/${config.id}`)}
              onRestart={() => restartLevel(config.id)}
            />
          );
        })}
      </Grid>
    </AppScaffold>
  );
}
