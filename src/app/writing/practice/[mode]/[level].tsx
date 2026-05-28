import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Lightbulb, RotateCcw, Send, SkipForward, Volume2, X } from "lucide-react-native";
import { AppButton } from "../../../../components/common/AppButton";
import { AppText } from "../../../../components/common/AppText";
import { EmptyState } from "../../../../components/common/EmptyState";
import { PageHeader } from "../../../../components/common/PageHeader";
import { Screen } from "../../../../components/layout/Screen";
import { LessonShell } from "../../../../components/lesson/LessonShell";
import { LessonTopBar } from "../../../../components/lesson/LessonTopBar";
import { lessonColors } from "../../../../components/lesson/lessonTheme";
import { useConfirmDialog } from "../../../../components/common/ConfirmDialog";
import { WritingFeedback } from "../../../../features/writing/components/WritingFeedback";
import { WritingPracticeCard } from "../../../../features/writing/components/WritingPracticeCard";
import { WritingPreviousPanel } from "../../../../features/writing/components/WritingPreviousPanel";
import { WritingStatsPanel } from "../../../../features/writing/components/WritingStatsPanel";
import { getWritingModeConfig, parseWritingModeParam } from "../../../../features/writing/config/modes";
import { isWritingLevel } from "../../../../features/writing/config/levels";
import { useWritingPractice } from "../../../../features/writing/hooks/useWritingPractice";
import { useActiveProfile } from "../../../../features/profile/hooks/useActiveProfile";
import { useTextToSpeech } from "../../../../features/speech/hooks/useTextToSpeech";
import type { WritingItem, WritingPracticeMode } from "../../../../features/writing/types";

function answerWords(value: string): string[] {
  return value
    .replace(/[^\p{L}\p{N}'\s]/gu, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function getPartialHint(item: WritingItem, hintStep: number): string | null {
  if (hintStep <= 0) {
    return null;
  }

  const words = answerWords(item.correctAnswer);
  if (hintStep === 1) {
    return `${words.length} ${words.length === 1 ? "word" : "words"}`;
  }
  if (hintStep === 2) {
    return `First letters: ${words.map((word) => word[0]?.toUpperCase() ?? "").join(" ")}`;
  }

  const revealedCount = Math.min(words.length, hintStep - 2);
  const revealed = words.slice(0, revealedCount);
  const hidden = words.slice(revealedCount).map(() => "___");
  return `Hint: ${[...revealed, ...hidden].join(" ")}`;
}

function getPlaceholder(mode: WritingPracticeMode): string {
  if (mode === "az-to-en") {
    return "Write the English answer";
  }
  if (mode === "fix-english") {
    return "Write the corrected English";
  }
  return "Type what you hear";
}

export default function WritingPracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; level?: string }>();
  const mode = parseWritingModeParam(params.mode);
  const level = isWritingLevel(params.level) ? params.level : null;
  const modeConfig = mode ? getWritingModeConfig(mode) : null;
  const { activeProfile } = useActiveProfile();
  const practice = useWritingPractice(activeProfile?.id, mode ?? "az-to-en", level ?? "A1");
  const { speak } = useTextToSpeech(activeProfile?.id);
  const { confirm, dialog } = useConfirmDialog();
  const [manualAnswer, setManualAnswer] = useState("");
  const [hintStep, setHintStep] = useState(0);
  const inputsDisabled = practice.isAnswerLocked;

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
      return;
    }
    if (!mode || !level) {
      router.replace("/writing");
    }
  }, [activeProfile, level, mode, router]);

  useEffect(() => {
    setManualAnswer("");
    setHintStep(0);
  }, [practice.currentItem?.id, practice.currentIndex]);

  useEffect(() => {
    if (mode === "listen-write" && practice.currentItem && !practice.isLoading) {
      void speak(practice.currentItem.english);
    }
  }, [mode, practice.currentItem, practice.isLoading, speak]);

  const revealNextHint = useCallback(() => {
    const maxStep = Math.max(2, answerWords(practice.currentItem?.correctAnswer ?? "").length + 2);
    setHintStep((current) => Math.min(maxStep, current + 1));
  }, [practice.currentItem?.correctAnswer]);

  const handleSkip = useCallback(() => {
    if (inputsDisabled) {
      return;
    }
    setManualAnswer("");
    setHintStep(0);
    void practice.skipCurrentItem();
  }, [inputsDisabled, practice]);

  const handlePrevious = useCallback(() => {
    if (inputsDisabled || !practice.canGoPrevious) {
      return;
    }
    setManualAnswer("");
    setHintStep(0);
    void practice.goToPreviousItem();
  }, [inputsDisabled, practice]);

  if (!activeProfile || !mode || !level || !modeConfig || practice.isLoading) {
    return null;
  }

  const currentItem = practice.currentItem;
  const total = practice.totalItems;
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

  async function submitManualAnswer() {
    if (!manualAnswer.trim() || inputsDisabled) {
      return;
    }
    await practice.submitAnswer(manualAnswer);
  }

  function restartPractice() {
    confirm({
      title: `Restart ${level}?`,
      message: "This resets only this writing mode and level for the current profile.",
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
        <EmptyState icon="-" title="No writing items" message="No writing items are available for this level yet." />
      </Screen>
    );
  }

  if (!currentItem || completed) {
    return (
      <Screen maxWidth={760}>
        <PageHeader title={modeConfig.title} icon={modeConfig.icon} onBack={() => router.back()} />
        <EmptyState
          icon="OK"
          title="Writing complete"
          message="Nice work. You finished this writing set."
        />
        <AppButton onPress={() => router.replace("/home")}>Go Home</AppButton>
      </Screen>
    );
  }

  const hintText = getPartialHint(currentItem, hintStep);
  const explanation =
    tone !== "neutral" ? currentItem.explanationAz : hintText ?? undefined;

  return (
    <LessonShell
      sectionTitle="Növbəti yazı"
      topBar={
        <LessonTopBar
          progressPercent={percent}
          onClose={() => router.back()}
          onRestart={restartPractice}
          scoreLabel={`🔥 ${practice.stats?.currentStreak ?? 0}`}
        />
      }
      previousPanel={
        <WritingPreviousPanel
          item={practice.previousItem}
          onReplay={
            practice.previousItem && mode === "listen-write"
              ? () => void speak(practice.previousItem!.english)
              : undefined
          }
        />
      }
      statsPanel={<WritingStatsPanel stats={practice.stats} remaining={remaining} />}
    >
      {dialog}
      <WritingPracticeCard
        item={currentItem}
        mode={mode}
        eyebrow={`${activeProfile.name} - ${level} - ${currentNumber}/${total}`}
        tone={tone}
        hintText={hintText}
        submittedAnswer={practice.submittedAnswer}
        feedbackMessage={feedbackMessage}
        onSkip={handleSkip}
        onPress={revealNextHint}
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
          variant={hintStep > 0 ? "primary" : "secondary"}
          size="sm"
          icon={Lightbulb}
          disabled={inputsDisabled}
          onPress={revealNextHint}
        >
          Hint
        </AppButton>
        {mode === "listen-write" ? (
          <AppButton
            variant="secondary"
            size="sm"
            icon={Volume2}
            disabled={inputsDisabled}
            onPress={() => void speak(currentItem.english)}
          >
            Replay
          </AppButton>
        ) : null}
        <AppButton variant="secondary" size="sm" icon={SkipForward} disabled={inputsDisabled} onPress={handleSkip}>
          Skip
        </AppButton>
      </View>

      <WritingFeedback
        tone={tone}
        message={practice.feedback.message}
        explanation={explanation}
        correctAnswer={tone !== "neutral" ? currentItem.correctAnswer : undefined}
      />

      <View style={styles.inputPanel}>
        <TextInput
          accessibilityLabel="Writing answer"
          value={manualAnswer}
          onChangeText={setManualAnswer}
          placeholder={getPlaceholder(mode)}
          placeholderTextColor={lessonColors.muted}
          autoCapitalize="sentences"
          editable={!inputsDisabled}
          returnKeyType="done"
          onSubmitEditing={() => void submitManualAnswer()}
          style={styles.input}
        />
        <View style={styles.inputActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear answer"
            disabled={!manualAnswer || inputsDisabled}
            onPress={() => setManualAnswer("")}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.pressed,
              (!manualAnswer || inputsDisabled) && styles.disabled,
            ]}
          >
            <X color={lessonColors.text} size={18} strokeWidth={2.5} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Check answer"
            disabled={inputsDisabled}
            onPress={() => void submitManualAnswer()}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && !inputsDisabled && styles.pressed,
              inputsDisabled && styles.disabled,
            ]}
          >
            <Send color={lessonColors.background} size={18} strokeWidth={2.5} />
            <AppText style={styles.submitText}>Check</AppText>
          </Pressable>
        </View>
      </View>
    </LessonShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    width: "100%",
    maxWidth: 620,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  inputPanel: {
    width: "100%",
    maxWidth: 620,
    gap: 10,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "rgba(12,23,38,0.94)",
    borderWidth: 1,
    borderColor: lessonColors.border,
  },
  input: {
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    color: lessonColors.text,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: lessonColors.borderStrong,
    fontSize: 16,
    fontWeight: "700",
  },
  inputActions: {
    flexDirection: "row",
    gap: 10,
  },
  clearButton: {
    width: 50,
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: lessonColors.border,
  },
  submitButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: lessonColors.yellowButton,
  },
  submitText: {
    color: lessonColors.background,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.48,
  },
});
