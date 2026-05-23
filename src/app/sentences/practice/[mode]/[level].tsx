import { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RotateCcw, Send } from "lucide-react-native";
import { AppButton } from "../../../../components/common/AppButton";
import { AppCard } from "../../../../components/common/AppCard";
import { AppText } from "../../../../components/common/AppText";
import { useConfirmDialog } from "../../../../components/common/ConfirmDialog";
import { EmptyState } from "../../../../components/common/EmptyState";
import { PageHeader } from "../../../../components/common/PageHeader";
import { TextInputField } from "../../../../components/common/TextInputField";
import { Screen } from "../../../../components/layout/Screen";
import { ProgressHeaderCard } from "../../../../components/common/ProgressHeaderCard";
import { PracticeStatsRow } from "../../../../components/common/PracticeStatsRow";
import { getSentenceModeConfig, parseSentenceModeParam } from "../../../../features/sentences/config/modes";
import { isSentenceLevel } from "../../../../features/sentences/config/levels";
import { PreviousSentenceCard } from "../../../../features/sentences/components/PreviousSentenceCard";
import { SentenceFeedback } from "../../../../features/sentences/components/SentenceFeedback";
import { SentencePracticeCard } from "../../../../features/sentences/components/SentencePracticeCard";
import { useActiveProfile } from "../../../../features/profile/hooks/useActiveProfile";
import { useSpeechRecognition } from "../../../../features/speech/hooks/useSpeechRecognition";
import { useTextToSpeech } from "../../../../features/speech/hooks/useTextToSpeech";
import { useSentencePractice } from "../../../../features/sentences/hooks/useSentencePractice";
import { colors } from "../../../../theme/colors";
import { spacing } from "../../../../theme/spacing";

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
  const { width: windowWidth } = useWindowDimensions();
  const isWideLayout = windowWidth >= 900;

  const [manualAnswer, setManualAnswer] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
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
  }, [practice.currentSentence?.id, practice.currentIndex]);

  const contextualStrings = useMemo(
    () =>
      practice.currentSentence
        ? [practice.currentSentence.english, ...practice.currentSentence.acceptedAnswers]
        : [],
    [practice.currentSentence],
  );

  const handleSpeechResult = useCallback(
    (transcript: string, isFinal: boolean) => {
      if (inputsDisabled) {
        return;
      }
      setRecognizedText(transcript);
      if (isFinal && transcript.trim()) {
        void practice.submitAnswer(transcript, "speech");
      }
    },
    [inputsDisabled, practice],
  );

  const speech = useSpeechRecognition({
    contextualStrings,
    onResult: handleSpeechResult,
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

  if (!activeProfile || !mode || !level || !modeConfig || practice.isLoading) {
    return null;
  }

  const currentSentence = practice.currentSentence;
  const total = practice.totalSentences;
  const completed = total > 0 && practice.currentIndex >= total;
  const currentNumber = completed ? total : Math.min(practice.currentIndex + 1, total);
  const percent = total > 0 ? (practice.currentIndex / total) * 100 : 0;

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
        <EmptyState icon="—" title="No sentences" message="No sentences are available for this level yet." />
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

  const manualPlaceholder =
    mode === "repeat" ? "Type the English sentence" : "Type the English translation";

  const practiceBody = (
    <>
      <ProgressHeaderCard percent={percent} />

      <SentencePracticeCard
        mode={mode}
        sentence={currentSentence}
        recognizedOrSubmittedAnswer={displayedAnswer ?? recognizedText}
        onReplay={() => void speak(currentSentence.english)}
        onMicPress={() => void speech.start()}
        isListening={speech.isListening}
        inputsDisabled={inputsDisabled}
      />

      <SentenceFeedback
        displayedAnswer={displayedAnswer}
        answerLabel={answerLabel}
        feedback={practice.feedback}
        listeningHint={
          speech.isListening
            ? "Listening…"
            : "Use the microphone in the card or type your answer below."
        }
        speechError={
          speech.manualFallbackRecommended
            ? speech.error ?? "Speech recognition is unavailable. Type the answer instead."
            : null
        }
        scale={feedbackScale}
      />

      <AppCard padding="md" style={styles.manualCard}>
        <TextInputField
          label="Manual answer"
          value={manualAnswer}
          onChangeText={setManualAnswer}
          placeholder={manualPlaceholder}
          autoCapitalize="none"
          editable={!inputsDisabled}
          returnKeyType="done"
          onSubmitEditing={() => void submitManualAnswer()}
        />
        <AppButton icon={Send} disabled={inputsDisabled} onPress={() => void submitManualAnswer()}>
          Check
        </AppButton>
      </AppCard>

      <PracticeStatsRow
        attempts={practice.stats?.totalAttempts ?? 0}
        correct={practice.stats?.correctCount ?? 0}
        wrong={practice.stats?.wrongCount ?? 0}
        streak={practice.stats?.currentStreak ?? 0}
        best={practice.stats?.bestStreak ?? 0}
      />
    </>
  );

  return (
    <Screen maxWidth={isWideLayout ? 1100 : 720}>
      {dialog}
      <PageHeader
        title={modeConfig.title}
        subtitle={`${activeProfile.name} · ${level} · Sentence ${currentNumber} / ${total}`}
        onBack={() => router.back()}
        actions={
          <AppButton variant="secondary" size="sm" icon={RotateCcw} onPress={restartPractice}>
            Restart
          </AppButton>
        }
      />

      <View style={[styles.layout, isWideLayout && styles.layoutWide]}>
        <View style={styles.main}>{practiceBody}</View>
        <View style={[styles.side, isWideLayout && styles.sideWide]}>
          <PreviousSentenceCard
            sentence={practice.previousSentence}
            onReplay={(english) => void speak(english)}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: {
    width: "100%",
    gap: spacing.lg,
  },
  layoutWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  main: {
    flex: 1,
    minWidth: 0,
    gap: spacing.lg,
  },
  side: {
    width: "100%",
    minWidth: 0,
  },
  sideWide: {
    width: 300,
    flexShrink: 0,
  },
  manualCard: {
    width: "100%",
    gap: spacing.sm,
  },
});
