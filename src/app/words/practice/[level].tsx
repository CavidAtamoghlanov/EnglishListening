import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Info, Lightbulb, RotateCcw, Send, Star, Volume2, X } from "lucide-react-native";
import { AppText } from "../../../components/common/AppText";
import { AppButton } from "../../../components/common/AppButton";
import { AppCard } from "../../../components/common/AppCard";
import { useConfirmDialog } from "../../../components/common/ConfirmDialog";
import { EmptyState } from "../../../components/common/EmptyState";
import { IconBubble } from "../../../components/common/IconBubble";
import { PageHeader } from "../../../components/common/PageHeader";
import { TextInputField } from "../../../components/common/TextInputField";
import { Screen } from "../../../components/layout/Screen";
import { FeedbackPanel } from "../../../components/common/FeedbackPanel";
import { PracticeActionRow } from "../../../components/common/PracticeActionRow";
import { PracticeStatsRow } from "../../../components/common/PracticeStatsRow";
import { ProgressHeaderCard } from "../../../components/common/ProgressHeaderCard";
import { getPracticeModeConfig, parsePracticeMode } from "../../../config/reviewModes";
import { useActiveProfile } from "../../../features/profile/hooks/useActiveProfile";
import { useSpeechRecognition } from "../../../features/speech/hooks/useSpeechRecognition";
import { useTextToSpeech } from "../../../features/speech/hooks/useTextToSpeech";
import { useTapOrDoubleTap } from "../../../features/words/hooks/useTapOrDoubleTap";
import { PreviousWordCard } from "../../../features/words/components/PreviousWordCard";
import { useWordsPractice } from "../../../features/words/hooks/useWordsPractice";
import { colors } from "../../../theme/colors";
import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";

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
  const { width: windowWidth } = useWindowDimensions();
  const isWideLayout = windowWidth >= 900;
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

  const handleWordTap = useTapOrDoubleTap({
    onSingleTap: () => setShowHint(true),
    onDoubleTap: () => setShowDetails(true),
  });

  if (!activeProfile || practice.isLoading) {
    return null;
  }

  const currentWord = practice.currentWord;
  const totalWords = practice.totalWords;
  const completed = totalWords > 0 && practice.currentIndex >= totalWords;
  const currentNumber = completed ? totalWords : Math.min(practice.currentIndex + 1, totalWords);
  const percent = totalWords > 0 ? (practice.currentIndex / totalWords) * 100 : 0;

  async function submitManualAnswer() {
    if (!manualAnswer.trim() || inputsDisabled) {
      return;
    }

    await practice.submitAnswer(manualAnswer, "manual");
  }

  const displayedAnswer =
    practice.submittedAnswer ??
    (practice.submittedAnswerSource === null ? recognizedText : null);
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

  const practiceBody = (
    <>
      <ProgressHeaderCard percent={percent} />

      <AppCard style={styles.promptCard} padding="lg">
        <View style={styles.promptTop}>
          <IconBubble emoji={currentWord.icon} size={72} backgroundColor={colors.mint} style={styles.wordIcon} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={practice.isFavorite ? "Remove favorite" : "Add favorite"}
            onPress={practice.toggleFavorite}
            style={styles.starButton}
          >
            <Star
              size={30}
              color={practice.isFavorite ? colors.warning : colors.muted}
              fill={practice.isFavorite ? colors.warning : "transparent"}
            />
          </Pressable>
        </View>

        <Pressable onPress={handleWordTap} onLongPress={() => setShowDetails(true)}>
          <AppText variant="label" color={colors.muted} style={styles.tapHint}>
            Tap word for hint · double tap for details
          </AppText>
          <AppText variant="title" style={styles.promptWord}>
            {currentWord.azeri}
          </AppText>
        </Pressable>

        {showHint ? (
          <View style={styles.hint}>
            <Info color={colors.primary} size={18} />
            <AppText color={colors.primaryDark}>
              Hint: {currentWord.hint ?? currentWord.english}
            </AppText>
          </View>
        ) : null}

        <PracticeActionRow
          pills={[
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
          ]}
          onMicPress={() => void speech.start()}
          isListening={speech.isListening}
          disabled={inputsDisabled}
        />
      </AppCard>

      <FeedbackPanel
        displayedAnswer={displayedAnswer}
        answerLabel={answerLabel}
        message={practice.feedback.message}
        tone={feedbackTone}
        hint={
          speech.isListening
            ? "Listening…"
            : "Use the microphone in the card or type your answer below."
        }
        error={
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
          placeholder="Type English answer"
          autoCapitalize="none"
          returnKeyType="done"
          editable={!inputsDisabled}
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
        title="Words Practice"
        subtitle={`${activeProfile.name} · ${practice.practiceScope === "all" ? "All levels" : currentWord.level} · Word ${currentNumber} / ${totalWords}`}
        onBack={() => router.back()}
        actions={
          mode === "full" ? (
            <AppButton variant="secondary" size="sm" icon={RotateCcw} onPress={restartLevel}>
              Restart
            </AppButton>
          ) : null
        }
      />

      <View style={[styles.practiceLayout, isWideLayout && styles.practiceLayoutWide]}>
        <View style={styles.practiceMain}>{practiceBody}</View>
        <View style={[styles.previousWordSlot, isWideLayout && styles.previousWordSlotWide]}>
          <PreviousWordCard word={practice.previousWord} onReplay={(english) => void speak(english)} />
        </View>
      </View>

      <DetailModal
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        english={currentWord.english}
        azeri={currentWord.azeri}
        synonyms={currentWord.synonyms}
        exampleEn={currentWord.exampleEn}
        exampleAz={currentWord.exampleAz}
      />
    </Screen>
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
        <AppCard style={styles.detailModal} padding="lg">
          <View style={styles.modalHeader}>
            <AppText variant="h2">{english}</AppText>
            <Pressable accessibilityRole="button" onPress={onClose}>
              <X color={colors.muted} size={26} />
            </Pressable>
          </View>
          <AppText color={colors.muted}>{azeri}</AppText>
          <View>
            <AppText variant="small" color={colors.muted}>
              Synonyms
            </AppText>
            <AppText>{synonyms.length ? synonyms.join(", ") : "No synonyms listed"}</AppText>
          </View>
          <View style={styles.example}>
            <Check color={colors.success} size={20} />
            <View style={styles.exampleCopy}>
              <AppText>{exampleEn}</AppText>
              <AppText color={colors.muted}>{exampleAz}</AppText>
            </View>
          </View>
          <AppButton onPress={onClose}>Close</AppButton>
        </AppCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  practiceLayout: {
    width: "100%",
    gap: spacing.lg,
  },
  practiceLayoutWide: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
  },
  practiceMain: {
    flex: 1,
    minWidth: 0,
    gap: spacing.lg,
  },
  previousWordSlot: {
    width: "100%",
    minWidth: 0,
  },
  previousWordSlotWide: {
    width: 280,
    flexShrink: 0,
  },
  promptCard: {
    alignItems: "center",
    gap: spacing.md,
  },
  promptTop: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  wordIcon: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  starButton: {
    width: 50,
    height: 50,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tapHint: {
    textAlign: "center",
    textTransform: "uppercase",
  },
  promptWord: {
    textAlign: "center",
    fontSize: 32,
    lineHeight: 38,
    color: colors.ink,
  },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manualCard: {
    width: "100%",
    gap: spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  detailModal: {
    width: "100%",
    maxWidth: 520,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  example: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.successSoft,
  },
  exampleCopy: {
    flex: 1,
    gap: spacing.xs,
  },
});
