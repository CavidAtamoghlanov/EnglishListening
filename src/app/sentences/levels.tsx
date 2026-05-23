import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useConfirmDialog } from "../../components/common/ConfirmDialog";
import { PageHeader } from "../../components/common/PageHeader";
import { Grid } from "../../components/layout/Grid";
import { Screen } from "../../components/layout/Screen";
import { SENTENCE_LEVELS } from "../../features/sentences/config/levels";
import { getSentenceModeConfig, parseSentenceModeParam } from "../../features/sentences/config/modes";
import { SentenceLevelCard } from "../../features/sentences/components/SentenceLevelCard";
import { useActiveProfile } from "../../features/profile/hooks/useActiveProfile";
import { useSentenceProgress } from "../../features/sentences/hooks/useSentenceProgress";
import { sentenceDataService } from "../../features/sentences/services/sentenceDataService";
import { sentenceProgressStorageService } from "../../features/sentences/services/sentenceProgressStorageService";
import type { SentenceLevel } from "../../features/sentences/types";
import { spacing } from "../../theme/spacing";

export default function SentenceLevelSelectionScreen() {
  const router = useRouter();
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const mode = parseSentenceModeParam(modeParam);
  const modeConfig = mode ? getSentenceModeConfig(mode) : null;
  const { activeProfile } = useActiveProfile();
  const { progress, reload } = useSentenceProgress(activeProfile?.id);
  const { confirm, dialog } = useConfirmDialog();

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
      return;
    }
    if (!mode) {
      router.replace("/sentences");
    }
  }, [activeProfile, mode, router]);

  if (!activeProfile || !progress || !mode || !modeConfig) {
    return null;
  }

  const profile = activeProfile;
  const activeMode = mode;
  const activeModeConfig = modeConfig;

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
    <Screen>
      {dialog}
      <PageHeader
        title={activeModeConfig.title}
        subtitle={`${profile.name} — choose a level`}
        icon={activeModeConfig.icon}
        onBack={() => router.back()}
      />

      <Grid minItemWidth={300} gap={spacing.lg}>
        {SENTENCE_LEVELS.map((levelConfig) => (
          <SentenceLevelCard
            key={levelConfig.id}
            level={levelConfig.id}
            title={levelConfig.title}
            description={levelConfig.description}
            sentenceCount={sentenceDataService.getSentenceCount(activeMode, levelConfig.id)}
            progress={progress.levels[activeMode][levelConfig.id]}
            onStart={() => router.push(`/sentences/practice/${activeMode}/${levelConfig.id}`)}
            onRestart={() => restartLevel(levelConfig.id)}
          />
        ))}
      </Grid>
    </Screen>
  );
}
