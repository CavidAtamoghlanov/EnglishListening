import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Lightbulb, SkipForward } from "lucide-react-native";
import { AppButton } from "../../../../components/common/AppButton";
import { EmptyState } from "../../../../components/common/EmptyState";
import { PageHeader } from "../../../../components/common/PageHeader";
import { Screen } from "../../../../components/layout/Screen";
import { LessonShell } from "../../../../components/lesson/LessonShell";
import { LessonTopBar } from "../../../../components/lesson/LessonTopBar";
import { useConfirmDialog } from "../../../../components/common/ConfirmDialog";
import { GrammarExerciseCard } from "../../../../features/grammar/components/GrammarExerciseCard";
import { GrammarFeedback } from "../../../../features/grammar/components/GrammarFeedback";
import { GrammarManualAnswer } from "../../../../features/grammar/components/GrammarManualAnswer";
import { GrammarPreviousPanel } from "../../../../features/grammar/components/GrammarPreviousPanel";
import { GrammarStatsPanel } from "../../../../features/grammar/components/GrammarStatsPanel";
import { getGrammarModeConfig, parseGrammarModeParam } from "../../../../features/grammar/config/modes";
import { isGrammarLevel } from "../../../../features/grammar/config/levels";
import { useGrammarPractice } from "../../../../features/grammar/hooks/useGrammarPractice";
import { useActiveProfile } from "../../../../features/profile/hooks/useActiveProfile";

export default function GrammarPracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; level?: string }>();
  const mode = parseGrammarModeParam(params.mode);
  const level = isGrammarLevel(params.level) ? params.level : null;
  const modeConfig = mode ? getGrammarModeConfig(mode) : null;
  const { activeProfile } = useActiveProfile();
  const practice = useGrammarPractice(activeProfile?.id, mode ?? "translate-write", level ?? "A1");
  const { confirm, dialog } = useConfirmDialog();
  const [manualAnswer, setManualAnswer] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const inputsDisabled = practice.isAnswerLocked;

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
      return;
    }
    if (!mode || !level) {
      router.replace("/grammar");
    }
  }, [activeProfile, level, mode, router]);

  useEffect(() => {
    setManualAnswer("");
    setHintVisible(false);
  }, [practice.currentExercise?.id, practice.currentIndex]);

  const handleSkip = useCallback(() => {
    if (inputsDisabled) {
      return;
    }
    setManualAnswer("");
    setHintVisible(false);
    void practice.skipCurrentExercise();
  }, [inputsDisabled, practice]);

  const handlePrevious = useCallback(() => {
    if (inputsDisabled || !practice.canGoPrevious) {
      return;
    }
    setManualAnswer("");
    setHintVisible(false);
    void practice.goToPreviousExercise();
  }, [inputsDisabled, practice]);

  if (!activeProfile || !mode || !level || !modeConfig || practice.isLoading) {
    return null;
  }

  const currentExercise = practice.currentExercise;
  const total = practice.totalExercises;
  const completed = total > 0 && practice.currentIndex >= total;
  const currentNumber = completed ? total : Math.min(practice.currentIndex + 1, total);
  const percent = total > 0 ? (practice.currentIndex / total) * 100 : 0;
  const remaining = Math.max(total - currentNumber, 0);
  const tone =
    practice.feedback.type === "correct"
      ? "correct"
      : practice.feedback.type === "wrong"
        ? "wrong"
        : "neutral";
  const feedbackMessage =
    tone === "correct"
      ? "Düzdür!"
      : tone === "wrong"
        ? "Yenidən cəhd et"
        : null;
  const placeholder =
    mode === "translate-write"
      ? "Write the English translation"
      : "Write the corrected full sentence";

  async function submitManualAnswer() {
    if (!manualAnswer.trim() || inputsDisabled) {
      return;
    }
    await practice.submitAnswer(manualAnswer);
  }

  function restartPractice() {
    confirm({
      title: `Restart ${level}?`,
      message: "This resets only this grammar mode and level for the current profile.",
      confirmLabel: "Restart",
      variant: "danger",
      onConfirm: () => {
        void practice.restartLevel();
      },
    });
  }

  if (total === 0) {
    return (
      <Screen maxWidth={760}>
        <PageHeader title={modeConfig.title} icon={modeConfig.icon} onBack={() => router.back()} />
        <EmptyState icon="-" title="No exercises" message="No grammar exercises are available for this level yet." />
      </Screen>
    );
  }

  if (!currentExercise || completed) {
    return (
      <Screen maxWidth={760}>
        <PageHeader title={modeConfig.title} icon={modeConfig.icon} onBack={() => router.back()} />
        <EmptyState
          icon="OK"
          title="Grammar complete"
          message="Nice work. You finished this grammar set."
        />
        <AppButton onPress={() => router.replace("/home")}>Go Home</AppButton>
      </Screen>
    );
  }

  const explanation =
    tone !== "neutral" ? currentExercise.explanationAz : hintVisible ? currentExercise.hint : undefined;

  return (
    <LessonShell
      sectionTitle="Növbəti tapşırıq"
      topBar={
        <LessonTopBar
          progressPercent={percent}
          onClose={() => router.back()}
          onRestart={restartPractice}
          scoreLabel={`🔥 ${practice.stats?.currentStreak ?? 0}`}
        />
      }
      previousPanel={<GrammarPreviousPanel exercise={practice.previousExercise} />}
      statsPanel={<GrammarStatsPanel stats={practice.stats} remaining={remaining} />}
    >
      {dialog}
      <GrammarExerciseCard
        exercise={currentExercise}
        eyebrow={`${activeProfile.name} - ${level} - ${currentNumber}/${total}`}
        tone={tone}
        hintVisible={hintVisible}
        submittedAnswer={practice.submittedAnswer}
        feedbackMessage={feedbackMessage}
        onSkip={handleSkip}
        onPress={() => setHintVisible((value) => !value)}
      />

      <GrammarManualAnswer
        value={manualAnswer}
        onChangeText={setManualAnswer}
        placeholder={placeholder}
        disabled={inputsDisabled}
        onSubmit={() => void submitManualAnswer()}
      />

      <View style={styles.actions}>
        <AppButton
          variant="secondary"
          size="sm"
          icon={ChevronLeft}
          disabled={!practice.canGoPrevious}
          onPress={handlePrevious}
        >
          Previous
        </AppButton>
        <AppButton
          variant={hintVisible ? "primary" : "secondary"}
          size="sm"
          icon={Lightbulb}
          disabled={inputsDisabled}
          onPress={() => setHintVisible((value) => !value)}
        >
          Hint
        </AppButton>
        <AppButton variant="secondary" size="sm" icon={SkipForward} disabled={inputsDisabled} onPress={handleSkip}>
          Skip
        </AppButton>
      </View>

      <GrammarFeedback
        tone={tone}
        message={practice.feedback.message}
        explanation={explanation}
        correctAnswer={tone === "wrong" ? currentExercise.correctAnswer : undefined}
      />
    </LessonShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    width: "100%",
    maxWidth: 560,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
});
