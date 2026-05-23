import { useEffect } from "react";
import { BookOpen } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useConfirmDialog } from "../../components/common/ConfirmDialog";
import { PageHeader } from "../../components/common/PageHeader";
import { Grid } from "../../components/layout/Grid";
import { Screen } from "../../components/layout/Screen";
import { LevelCard } from "../../components/words/LevelCard";
import { WORD_LEVELS } from "../../features/words/config/levels";
import { useActiveProfile } from "../../features/profile/hooks/useActiveProfile";
import { useProgress } from "../../features/progress/hooks/useProgress";
import type { CEFRLevel } from "../../features/progress/types";
import { progressStorageService } from "../../features/progress/services/progressStorageService";
import { wordsDataService } from "../../features/words/services/wordsDataService";
import { spacing } from "../../theme/spacing";

export default function LevelSelectionScreen() {
  const router = useRouter();
  const { activeProfile } = useActiveProfile();
  const { progress, reload } = useProgress(activeProfile?.id);
  const { confirm, dialog } = useConfirmDialog();

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
    }
  }, [activeProfile, router]);

  if (!activeProfile || !progress) {
    return null;
  }

  const profile = activeProfile;

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
    <Screen>
      {dialog}
      <PageHeader
        title="Choose a level"
        subtitle={`Progress shown here belongs only to ${profile.name}.`}
        icon={BookOpen}
        onBack={() => router.back()}
      />

      <Grid minItemWidth={300} gap={spacing.lg}>
        {WORD_LEVELS.map((levelConfig) => (
          <LevelCard
            key={levelConfig.id}
            level={levelConfig.id}
            title={levelConfig.title}
            description={levelConfig.description}
            wordCount={wordsDataService.getWordCount(levelConfig.id)}
            progress={progress.levels[levelConfig.id]}
            onStart={() => router.push(`/words/practice/${levelConfig.id}`)}
            onRestart={() => restartLevel(levelConfig.id)}
          />
        ))}
      </Grid>
    </Screen>
  );
}
