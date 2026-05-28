import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ClipboardCheck } from "lucide-react-native";
import { Grid } from "../../../components/layout/Grid";
import { AppScaffold } from "../../../components/layout/AppScaffold";
import { PageHeader } from "../../../components/common/PageHeader";
import { useConfirmDialog } from "../../../components/common/ConfirmDialog";
import { GrammarLevelCard } from "../../../features/grammar/components/GrammarLevelCard";
import { GRAMMAR_LEVELS, type GrammarLevelConfig } from "../../../features/grammar/config/levels";
import { getGrammarModeConfig, parseGrammarModeParam } from "../../../features/grammar/config/modes";
import { useGrammarProgress } from "../../../features/grammar/hooks/useGrammarProgress";
import { grammarDataService } from "../../../features/grammar/services/grammarDataService";
import { grammarProgressStorageService } from "../../../features/grammar/services/grammarProgressStorageService";
import type { GrammarLevel } from "../../../features/grammar/types";
import { calculateGrammarProgressPercent } from "../../../features/grammar/utils/grammarProgress";
import { useActiveProfile } from "../../../features/profile/hooks/useActiveProfile";
import { spacing } from "../../../theme/spacing";

export default function GrammarLevelSelectionScreen() {
  const router = useRouter();
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const mode = parseGrammarModeParam(modeParam);
  const modeConfig = mode ? getGrammarModeConfig(mode) : null;
  const { activeProfile } = useActiveProfile();
  const { progress, reload } = useGrammarProgress(activeProfile?.id);
  const { confirm, dialog } = useConfirmDialog();

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
      return;
    }
    if (!mode) {
      router.replace("/grammar");
    }
  }, [activeProfile, mode, router]);

  if (!activeProfile || !progress || !mode || !modeConfig) {
    return null;
  }

  const profile = activeProfile;
  const grammarProgress = progress;
  const activeMode = mode;
  const activeModeConfig = modeConfig;

  function getLevelState(config: GrammarLevelConfig) {
    const levelProgress = grammarProgress.levels[activeMode][config.id];
    const total = grammarDataService.getExerciseCount(activeMode, config.id);
    const current = Math.min(levelProgress.currentIndex, total);
    const percent = calculateGrammarProgressPercent(current, total);
    const hasProgress =
      levelProgress.sessionOrderExerciseIds.length > 0 || levelProgress.currentIndex > 0;
    return { levelProgress, total, current, percent, hasProgress };
  }

  function restartLevel(level: GrammarLevel) {
    confirm({
      title: `Restart ${level}?`,
      message: `This resets ${activeModeConfig.title} for ${level} on this profile only.`,
      confirmLabel: "Restart Level",
      variant: "danger",
      onConfirm: () => {
        void (async () => {
          await grammarProgressStorageService.resetLevel(profile.id, activeMode, level);
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
        subtitle={`${profile.name} - choose a grammar level`}
        icon={activeModeConfig.icon ?? ClipboardCheck}
        onBack={() => router.back()}
      />

      <Grid minItemWidth={280} gap={spacing.lg}>
        {GRAMMAR_LEVELS.map((config) => {
          const state = getLevelState(config);
          return (
            <GrammarLevelCard
              key={config.id}
              config={config}
              current={state.current}
              total={state.total}
              percent={state.percent}
              attempts={state.levelProgress.totalAttempts}
              hasProgress={state.hasProgress}
              selected={progress.lastSelectedLevel === config.id}
              onStart={() => router.push(`/grammar/practice/${activeMode}/${config.id}`)}
              onRestart={() => restartLevel(config.id)}
            />
          );
        })}
      </Grid>
    </AppScaffold>
  );
}
