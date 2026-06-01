import { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, ChevronLeft, Info, Lightbulb, SkipForward, Star, Volume2, X } from "lucide-react-native";
import { AppText } from "../../../components/common/AppText";
import { AppButton } from "../../../components/common/AppButton";
import { useConfirmDialog } from "../../../components/common/ConfirmDialog";
import { EmptyState } from "../../../components/common/EmptyState";
import { PageHeader } from "../../../components/common/PageHeader";
import { Screen } from "../../../components/layout/Screen";
import { LessonActionDock } from "../../../components/lesson/LessonActionDock";
import { LessonCard, type LessonCardTone } from "../../../components/lesson/LessonCard";
import { LessonFeedbackOverlay } from "../../../components/lesson/LessonFeedbackOverlay";
import { LessonManualAnswerSheet } from "../../../components/lesson/LessonManualAnswerSheet";
import { LessonPreviousPanel } from "../../../components/lesson/LessonPreviousPanel";
import { LessonShell } from "../../../components/lesson/LessonShell";
import { LessonStatsPanel } from "../../../components/lesson/LessonStatsPanel";
import { LessonTopBar } from "../../../components/lesson/LessonTopBar";
import { lessonColors } from "../../../components/lesson/lessonTheme";
import { getPracticeModeConfig, parsePracticeMode } from "../../../config/reviewModes";
import { useActiveProfile } from "../../../features/profile/hooks/useActiveProfile";
import { useSpeechPracticeController } from "../../../features/speech/hooks/useSpeechPracticeController";
import { useTextToSpeech } from "../../../features/speech/hooks/useTextToSpeech";
import { useTapOrDoubleTap } from "../../../features/words/hooks/useTapOrDoubleTap";
import { useWordsPractice } from "../../../features/words/hooks/useWordsPractice";

export default function PracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ level?: string; mode?: string; scope?: string }>();
  const mode = parsePracticeMode(params.mode);
  const modeConfig = getPracticeModeConfig(mode);
  const { activeProfile } = useActiveProfile();
  const practice = useWordsPractice(activeProfile?.id, params.level, mode, params.scope);
  const { speak } = useTextToSpeech(activeProfile?.id);
  const { confirm, dialog } = useConfirmDialog();
  const [manualAnswer, setManualAnswer] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const feedbackScale = useMemo(() => new Animated.Value(1), []);
  const inputsDisabled = practice.isAnswerLocked;

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
    }
  }, [activeProfile, router]);

  useEffect(() => {
    setManualAnswer("");
    setRecognizedText("");
    setShowHint(false);
    setShowDetails(false);
  }, [practice.currentWord?.id, practice.currentIndex]);

  const contextualStrings = useMemo(
    () =>
      practice.currentWord
        ? [practice.currentWord.english, ...practice.currentWord.acceptedAnswers]
        : [],
    [practice.currentWord],
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
    itemKey: `${practice.currentWord?.id ?? "none"}:${practice.currentIndex}`,
    canListen: !inputsDisabled,
    hasActiveItem: Boolean(practice.currentWord),
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

  const handleWordTap = useTapOrDoubleTap({
    onSingleTap: () => setShowHint(true),
    onDoubleTap: () => setShowDetails(true),
  });

  const handleSkip = useCallback(() => {
    if (inputsDisabled) {
      return;
    }

    speechController.resetTranscript();
    setManualAnswer("");
    setRecognizedText("");
    setShowHint(false);
    void practice.skipCurrentItem();
  }, [inputsDisabled, practice, speechController]);

  const handlePrevious = useCallback(() => {
    if (inputsDisabled || !practice.canGoPrevious) {
      return;
    }

    speechController.resetTranscript();
    setManualAnswer("");
    setRecognizedText("");
    setShowHint(false);
    void practice.goToPreviousItem();
  }, [inputsDisabled, practice, speechController]);

  if (!activeProfile || practice.isLoading) {
    return null;
  }

  const currentWord = practice.currentWord;
  const totalWords = practice.totalWords;
  const completed = totalWords > 0 && practice.currentIndex >= totalWords;
  const currentNumber = completed ? totalWords : Math.min(practice.currentIndex + 1, totalWords);
  const percent = totalWords > 0 ? (practice.currentIndex / totalWords) * 100 : 0;
  const remainingWords = Math.max(totalWords - currentNumber, 0);

  async function submitManualAnswer() {
    if (!manualAnswer.trim() || inputsDisabled) {
      return;
    }

    await practice.submitAnswer(manualAnswer, "manual");
  }

  const displayedAnswer =
    practice.submittedAnswer ??
    (practice.submittedAnswerSource === null ? recognizedText || null : null);
  const answerLabel =
    practice.submittedAnswerSource === "manual"
      ? "Your answer"
      : practice.submittedAnswerSource === "speech" || recognizedText
        ? "You said"
        : null;

  function restartLevel() {
    confirm({
      title: `Restart ${practice.selectedLevel}?`,
      message: "This resets only this level for the current profile.",
      confirmLabel: "Restart Level",
      variant: "danger",
      onConfirm: () => {
        void practice.restartSelectedLevel();
      },
    });
  }

  if (totalWords === 0) {
    return (
      <Screen maxWidth={760}>
        <PageHeader title={modeConfig.title} icon={modeConfig.icon} onBack={() => router.back()} />
        <EmptyState
          icon={modeConfig.emptyIcon}
          title={modeConfig.emptyTitle}
          message={modeConfig.emptyMessage}
        />
      </Screen>
    );
  }

  if (!currentWord || completed) {
    return (
      <Screen maxWidth={760}>
        <PageHeader title={modeConfig.title} icon={modeConfig.icon} onBack={() => router.back()} />
        <EmptyState
          icon="OK"
          title="Practice complete"
          message="Nice work. You reached the end of this set."
        />
        <AppButton onPress={() => router.replace("/home")}>Go Home</AppButton>
      </Screen>
    );
  }

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
  const hintText = showHint
    ? `English: ${currentWord.english}${currentWord.hint ? ` - ${currentWord.hint}` : ""}`
    : null;
  const previousWord = practice.previousWord;

  return (
    <>
      <LessonShell
        sectionTitle="Növbəti söz"
        topBar={
          <LessonTopBar
            progressPercent={percent}
            onClose={() => router.back()}
            onRestart={mode === "full" ? restartLevel : undefined}
            scoreLabel={`🔥 ${practice.stats?.currentStreak ?? 0}`}
          />
        }
        previousPanel={
          <LessonPreviousPanel
            title="Əvvəlki söz"
            emptyText="Hələ əvvəlki söz yoxdur"
            icon={previousWord?.icon}
            primary={previousWord?.azeri}
            secondary={previousWord?.english}
            onReplay={previousWord ? () => void speak(previousWord.english) : undefined}
          />
        }
        statsPanel={
          <LessonStatsPanel
            attempts={practice.stats?.totalAttempts ?? 0}
            correct={practice.stats?.correctCount ?? 0}
            wrong={practice.stats?.wrongCount ?? 0}
            streak={practice.stats?.currentStreak ?? 0}
            best={practice.stats?.bestStreak ?? 0}
            remaining={remainingWords}
          />
        }
      >
        {dialog}
        <LessonCard
          itemKey={currentWord.id}
          icon={currentWord.icon}
          prompt={currentWord.azeri}
          eyebrow={`${activeProfile.name} - ${currentWord.level} - ${currentNumber}/${totalWords}`}
          tone={cardTone}
          hintText={hintText}
          onPress={handleWordTap}
          onLongPress={() => setShowDetails(true)}
          onSkip={handleSkip}
          skipTitle="Yuxarı sürüşdür"
          skipSubtitle="Sona at"
          feedbackMessage={cardFeedbackMessage}
          displayedAnswer={displayedAnswer}
          answerLabel={answerLabel}
          topRight={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={practice.isFavorite ? "Remove favorite" : "Add favorite"}
              onPress={practice.toggleFavorite}
              style={({ pressed }) => [styles.starButton, pressed && styles.pressed]}
            >
              <Star
                size={25}
                color={practice.isFavorite ? lessonColors.yellowButton : lessonColors.muted}
                fill={practice.isFavorite ? lessonColors.yellowButton : "transparent"}
              />
            </Pressable>
          }
        />

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
                : "Mic işlət, ipucu aç, ya da yazaraq cavabla."
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
          placeholder="Type English answer"
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
              label: "Hint",
              icon: Lightbulb,
              onPress: () => setShowHint((value) => !value),
              active: showHint,
            },
            {
              label: "Replay",
              icon: Volume2,
              onPress: () => void speak(currentWord.english),
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

      <DetailModal
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        english={currentWord.english}
        azeri={currentWord.azeri}
        synonyms={currentWord.synonyms}
        exampleEn={currentWord.exampleEn}
        exampleAz={currentWord.exampleAz}
      />
    </>
  );
}

function DetailModal({
  visible,
  onClose,
  english,
  azeri,
  synonyms,
  exampleEn,
  exampleAz,
}: {
  visible: boolean;
  onClose: () => void;
  english: string;
  azeri: string;
  synonyms: string[];
  exampleEn: string;
  exampleAz: string;
}) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.detailModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitle}>
              <Info color={lessonColors.yellowButton} size={20} />
              <AppText variant="h2" style={styles.modalHeading}>
                {english}
              </AppText>
            </View>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.modalClose}>
              <X color={lessonColors.muted} size={26} />
            </Pressable>
          </View>
          <AppText style={styles.modalMuted}>{azeri}</AppText>
          <View>
            <AppText variant="small" style={styles.modalLabel}>
              Synonyms
            </AppText>
            <AppText style={styles.modalText}>
              {synonyms.length ? synonyms.join(", ") : "No synonyms listed"}
            </AppText>
          </View>
          <View style={styles.example}>
            <Check color={lessonColors.success} size={20} />
            <View style={styles.exampleCopy}>
              <AppText style={styles.modalText}>{exampleEn}</AppText>
              <AppText style={styles.modalMuted}>{exampleAz}</AppText>
            </View>
          </View>
          <AppButton onPress={onClose}>Close</AppButton>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  starButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: lessonColors.border,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: lessonColors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  detailModal: {
    width: "100%",
    maxWidth: 520,
    gap: 16,
    padding: 22,
    borderRadius: 28,
    backgroundColor: lessonColors.panel,
    borderWidth: 1,
    borderColor: lessonColors.borderStrong,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalHeading: {
    color: lessonColors.text,
  },
  modalClose: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  modalLabel: {
    color: lessonColors.muted,
    fontWeight: "800",
  },
  modalText: {
    color: lessonColors.text,
    lineHeight: 22,
    fontWeight: "700",
  },
  modalMuted: {
    color: lessonColors.muted,
    lineHeight: 22,
  },
  example: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(103,213,59,0.10)",
    borderWidth: 1,
    borderColor: "rgba(103,213,59,0.20)",
  },
  exampleCopy: {
    flex: 1,
    gap: 4,
  },
});
