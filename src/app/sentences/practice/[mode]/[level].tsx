import { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Languages, SkipForward, Volume2 } from "lucide-react-native";
import { AppButton } from "../../../../components/common/AppButton";
import { useConfirmDialog } from "../../../../components/common/ConfirmDialog";
import { EmptyState } from "../../../../components/common/EmptyState";
import { PageHeader } from "../../../../components/common/PageHeader";
import { Screen } from "../../../../components/layout/Screen";
import { LessonActionDock } from "../../../../components/lesson/LessonActionDock";
import { LessonCard, type LessonCardTone } from "../../../../components/lesson/LessonCard";
import { LessonFeedbackOverlay } from "../../../../components/lesson/LessonFeedbackOverlay";
import { LessonManualAnswerSheet } from "../../../../components/lesson/LessonManualAnswerSheet";
import { LessonPreviousPanel } from "../../../../components/lesson/LessonPreviousPanel";
import { LessonShell } from "../../../../components/lesson/LessonShell";
import { LessonStatsPanel } from "../../../../components/lesson/LessonStatsPanel";
import { LessonTopBar } from "../../../../components/lesson/LessonTopBar";
import { getSentenceModeConfig, parseSentenceModeParam } from "../../../../features/sentences/config/modes";
import { isSentenceLevel } from "../../../../features/sentences/config/levels";
import { SentenceWordChips } from "../../../../features/sentences/components/SentenceWordChips";
import { useActiveProfile } from "../../../../features/profile/hooks/useActiveProfile";
import { useSpeechPracticeController } from "../../../../features/speech/hooks/useSpeechPracticeController";
import { useTextToSpeech } from "../../../../features/speech/hooks/useTextToSpeech";
import { useSentencePractice } from "../../../../features/sentences/hooks/useSentencePractice";
import { getMatchedWordIndices } from "../../../../features/sentences/utils/sentenceAnswer";

export default function SentencePracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; level?: string }>();
  const mode = parseSentenceModeParam(params.mode);
  const level = isSentenceLevel(params.level) ? params.level : null;
  const modeConfig = mode ? getSentenceModeConfig(mode) : null;
  const { activeProfile } = useActiveProfile();
  const practice = useSentencePractice(activeProfile?.id, mode ?? "repeat", level ?? "A1");
  const { speak } = useTextToSpeech(activeProfile?.id);
  const { confirm, dialog } = useConfirmDialog();
  const [manualAnswer, setManualAnswer] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [showFullTranslation, setShowFullTranslation] = useState(false);
  const feedbackScale = useMemo(() => new Animated.Value(1), []);
  const inputsDisabled = practice.isAnswerLocked;

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
      return;
    }
    if (!mode || !level) {
      router.replace("/sentences");
    }
  }, [activeProfile, level, mode, router]);

  useEffect(() => {
    setManualAnswer("");
    setRecognizedText("");
    setShowFullTranslation(false);
  }, [practice.currentSentence?.id, practice.currentIndex]);

  const contextualStrings = useMemo(
    () =>
      practice.currentSentence
        ? [practice.currentSentence.english, ...practice.currentSentence.acceptedAnswers]
        : [],
    [practice.currentSentence],
  );

  const handleSpeechTranscript = useCallback((transcript: string) => {
    setRecognizedText(transcript);
  }, []);

  const handleFinalSpeechResult = useCallback(
    (transcript: string) => {
      if (inputsDisabled) {
        return;
      }
      setRecognizedText(transcript);
      if (transcript.trim()) {
        void practice.submitAnswer(transcript, "speech");
      }
    },
    [inputsDisabled, practice],
  );

  const speechController = useSpeechPracticeController({
    contextualStrings,
    itemKey: `${practice.currentSentence?.id ?? "none"}:${practice.currentIndex}`,
    canListen: !inputsDisabled,
    hasActiveItem: Boolean(practice.currentSentence),
    onTranscript: handleSpeechTranscript,
    onFinalResult: handleFinalSpeechResult,
  });

  useEffect(() => {
    if (!practice.feedback.message) {
      return;
    }
    feedbackScale.setValue(0.96);
    Animated.spring(feedbackScale, {
      toValue: 1,
      friction: 5,
      tension: 140,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [feedbackScale, practice.feedback.message]);

  const handleSkip = useCallback(() => {
    if (inputsDisabled) {
      return;
    }

    speechController.resetTranscript();
    setManualAnswer("");
    setRecognizedText("");
    setShowFullTranslation(false);
    void practice.skipCurrentSentence();
  }, [inputsDisabled, practice, speechController]);

  const handlePrevious = useCallback(() => {
    if (inputsDisabled || !practice.canGoPrevious) {
      return;
    }

    speechController.resetTranscript();
    setManualAnswer("");
    setRecognizedText("");
    setShowFullTranslation(false);
    void practice.goToPreviousSentence();
  }, [inputsDisabled, practice, speechController]);

  if (!activeProfile || !mode || !level || !modeConfig || practice.isLoading) {
    return null;
  }

  const currentSentence = practice.currentSentence;
  const total = practice.totalSentences;
  const completed = total > 0 && practice.currentIndex >= total;
  const currentNumber = completed ? total : Math.min(practice.currentIndex + 1, total);
  const percent = total > 0 ? (practice.currentIndex / total) * 100 : 0;
  const remainingSentences = Math.max(total - currentNumber, 0);

  const displayedAnswer =
    practice.submittedAnswer ??
    (practice.submittedAnswerSource === null ? recognizedText || null : null);
  const answerLabel =
    practice.submittedAnswerSource === "manual"
      ? "Your answer"
      : practice.submittedAnswerSource === "speech" || recognizedText
        ? "You said"
        : null;

  async function submitManualAnswer() {
    if (!manualAnswer.trim() || inputsDisabled) {
      return;
    }
    await practice.submitAnswer(manualAnswer, "manual");
  }

  function restartPractice() {
    confirm({
      title: `Restart ${level}?`,
      message: "This resets only this mode and level for the current profile.",
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
        <EmptyState icon="-" title="No sentences" message="No sentences are available for this level yet." />
      </Screen>
    );
  }

  if (!currentSentence || completed) {
    return (
      <Screen maxWidth={760}>
        <PageHeader title={modeConfig.title} icon={modeConfig.icon} onBack={() => router.back()} />
        <EmptyState
          icon="OK"
          title="Practice complete"
          message="Nice work. You finished this sentence set."
        />
        <AppButton onPress={() => router.replace("/home")}>Go Home</AppButton>
      </Screen>
    );
  }

  const isRepeat = mode === "repeat";
  const displayText = isRepeat ? currentSentence.english : currentSentence.azeri;
  const fullHelpText = showFullTranslation
    ? isRepeat
      ? `Translation: ${currentSentence.azeri}`
      : `English: ${currentSentence.english}`
    : null;
  const matchedIndices = isRepeat
    ? getMatchedWordIndices(currentSentence.english, displayedAnswer ?? recognizedText)
    : new Set<number>();
  const feedbackTone =
    practice.feedback.type === "correct"
      ? "correct"
      : practice.feedback.type === "wrong"
        ? "wrong"
        : "neutral";
  const cardTone: LessonCardTone = feedbackTone;
  const cardFeedbackMessage =
    feedbackTone === "correct"
      ? practice.feedback.message ?? "Düzdür!"
      : feedbackTone === "wrong"
        ? practice.feedback.message ?? "Yanlışdır - yenidən cəhd et"
        : null;
  const previousSentence = practice.previousSentence;
  const manualPlaceholder = isRepeat ? "Type the English sentence" : "Type the English translation";

  return (
    <LessonShell
      sectionTitle="Növbəti cümlə"
      topBar={
        <LessonTopBar
          progressPercent={percent}
          onClose={() => router.back()}
          onRestart={restartPractice}
          scoreLabel={`🔥 ${practice.stats?.currentStreak ?? 0}`}
        />
      }
      previousPanel={
        <LessonPreviousPanel
          title="Əvvəlki cümlə"
          emptyText="Hələ əvvəlki cümlə yoxdur"
          icon={previousSentence?.icon}
          primary={previousSentence?.english}
          secondary={previousSentence?.azeri}
          onReplay={previousSentence ? () => void speak(previousSentence.english) : undefined}
        />
      }
      statsPanel={
        <LessonStatsPanel
          attempts={practice.stats?.totalAttempts ?? 0}
          correct={practice.stats?.correctCount ?? 0}
          wrong={practice.stats?.wrongCount ?? 0}
          streak={practice.stats?.currentStreak ?? 0}
          best={practice.stats?.bestStreak ?? 0}
          remaining={remainingSentences}
        />
      }
    >
      {dialog}
      <LessonCard
        itemKey={currentSentence.id}
        icon={currentSentence.icon}
        prompt={displayText}
        eyebrow={`${activeProfile.name} - ${level} - ${currentNumber}/${total}`}
        tone={cardTone}
        hintText={fullHelpText}
        onSkip={handleSkip}
        skipTitle="Yuxarı sürüşdür"
        skipSubtitle="Sona at"
        feedbackMessage={cardFeedbackMessage}
        displayedAnswer={displayedAnswer}
        answerLabel={answerLabel}
      >
        <SentenceWordChips
          displayText={displayText}
          hints={currentSentence.words}
          matchedIndices={matchedIndices}
        />
      </LessonCard>

      {feedbackTone === "neutral" || practice.feedback.message || speechController.manualFallbackRecommended ? (
        <LessonFeedbackOverlay
          displayedAnswer={displayedAnswer}
          answerLabel={answerLabel}
          message={practice.feedback.message}
          tone={feedbackTone}
          hint={
            speechController.isListening
              ? "Danışın..."
              : speechController.isContinuousMode
                ? "Listening stays on for the next item."
              : "Mic işlət, kömək aç, ya da yazaraq cavabla."
          }
          error={
            speechController.lastError ??
            (speechController.manualFallbackRecommended
              ? "Speech recognition is unavailable. Type the answer instead."
              : null)
          }
          scorePercent={practice.feedback.scorePercent}
          expectedAnswer={practice.feedback.expectedAnswer}
          missingWords={practice.feedback.missingWords}
          scale={feedbackScale}
        />
      ) : null}

      <LessonManualAnswerSheet
        value={manualAnswer}
        onChangeText={setManualAnswer}
        placeholder={manualPlaceholder}
        disabled={inputsDisabled}
        onSubmit={() => void submitManualAnswer()}
      />

      <LessonActionDock
        actions={[
          {
            label: "Previous",
            icon: ChevronLeft,
            onPress: handlePrevious,
            disabled: !practice.canGoPrevious,
          },
          {
            label: isRepeat
              ? showFullTranslation
                ? "Hide"
                : "Translate"
              : showFullTranslation
                ? "Hide"
                : "English",
            icon: Languages,
            onPress: () => setShowFullTranslation((value) => !value),
            active: showFullTranslation,
          },
          {
            label: "Replay",
            icon: Volume2,
            onPress: () => void speak(currentSentence.english),
          },
          {
            label: "Skip",
            icon: SkipForward,
            onPress: handleSkip,
          },
        ]}
        onMicPress={speechController.toggleListening}
        isListening={speechController.isMicActive}
        actionsDisabled={inputsDisabled}
        micDisabled={speechController.manualFallbackRecommended}
      />
    </LessonShell>
  );
}
