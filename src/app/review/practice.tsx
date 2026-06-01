import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Lightbulb, Send, SkipForward, Volume2 } from "lucide-react-native";
import { AppButton } from "../../components/common/AppButton";
import { AppText } from "../../components/common/AppText";
import { EmptyState } from "../../components/common/EmptyState";
import { PageHeader } from "../../components/common/PageHeader";
import { AppScaffold } from "../../components/layout/AppScaffold";
import { useLearningSummary } from "../../features/learning/hooks/useLearningSummary";
import { useReviewQueue, type ReviewQueueFilter } from "../../features/learning/hooks/useReviewQueue";
import { learningRecorderService } from "../../features/learning/services/learningRecorderService";
import type { LearningModule, ReviewItem } from "../../features/learning/types";
import { useActiveProfile } from "../../features/profile/hooks/useActiveProfile";
import { useTextToSpeech } from "../../features/speech/hooks/useTextToSpeech";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { useResponsive } from "../../utils/useResponsive";

function parseFilter(value: string | string[] | undefined): ReviewQueueFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  if (
    raw === "words" ||
    raw === "sentences" ||
    raw === "grammar" ||
    raw === "writing"
  ) {
    return raw as LearningModule;
  }
  return "all";
}

function itemAt(items: ReviewItem[], index: number): ReviewItem | null {
  if (index < 0 || index >= items.length) {
    return null;
  }
  return items[index] ?? null;
}

export default function ReviewPracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  const filter = parseFilter(params.filter);
  const { activeProfile } = useActiveProfile();
  const { isMobile } = useResponsive();
  const { items, reload } = useReviewQueue(activeProfile?.id, filter);
  const { reload: reloadLearningSummary } = useLearningSummary(activeProfile?.id);
  const { speak } = useTextToSpeech(activeProfile?.id);
  const [sessionItems, setSessionItems] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
    }
  }, [activeProfile, router]);

  useFocusEffect(
    useCallback(() => {
      if (activeProfile?.id) {
        void reload();
      }
    }, [activeProfile?.id, reload]),
  );

  useEffect(() => {
    setSessionItems(items);
    setCurrentIndex(0);
    setAnswer("");
    setFeedback(null);
    setShowHint(false);
    setIsLocked(false);
  }, [items]);

  const currentItem = sessionItems[currentIndex] ?? null;
  const previousItem = itemAt(sessionItems, currentIndex - 1);
  const progressPercent = sessionItems.length > 0 ? (currentIndex / sessionItems.length) * 100 : 0;

  const statusCopy = useMemo(() => {
    if (feedback === "correct") {
      return {
        title: "Good!",
        message: "This item was moved forward in your review schedule.",
        color: colors.success,
      };
    }
    if (feedback === "wrong") {
      return {
        title: "Try again",
        message: "It stays due today. Use the hint and write the full answer.",
        color: colors.danger,
      };
    }
    return null;
  }, [feedback]);

  async function submitAnswer() {
    if (!activeProfile || !currentItem || !answer.trim() || isLocked) {
      return;
    }

    setIsLocked(true);
    const correct = await learningRecorderService.recordReviewAnswer({
      profileId: activeProfile.id,
      item: currentItem,
      userAnswer: answer.trim(),
    });
    setFeedback(correct ? "correct" : "wrong");
    await reloadLearningSummary();

    if (!correct) {
      setIsLocked(false);
      return;
    }

    setTimeout(() => {
      setSessionItems((current) => current.filter((item) => item.id !== currentItem.id));
      setCurrentIndex((index) => Math.min(index, Math.max(sessionItems.length - 2, 0)));
      setAnswer("");
      setFeedback(null);
      setShowHint(false);
      setIsLocked(false);
    }, 1200);
  }

  function goPrevious() {
    if (currentIndex <= 0 || isLocked) {
      return;
    }
    setCurrentIndex((index) => index - 1);
    setAnswer("");
    setFeedback(null);
    setShowHint(false);
  }

  function skip() {
    if (!currentItem || isLocked || sessionItems.length <= 1) {
      return;
    }
    setSessionItems((current) => [
      ...current.filter((item) => item.id !== currentItem.id),
      currentItem,
    ]);
    setAnswer("");
    setFeedback(null);
    setShowHint(false);
  }

  if (!activeProfile) {
    return null;
  }

  if (!currentItem || sessionItems.length === 0) {
    return (
      <AppScaffold maxWidth={820}>
        <PageHeader title="Review Practice" icon={Lightbulb} onBack={() => router.back()} />
        <EmptyState
          icon="OK"
          title="Review complete"
          message="No due review items are left for this filter."
        />
        <AppButton onPress={() => router.replace("/home")}>Go Home</AppButton>
      </AppScaffold>
    );
  }

  return (
    <AppScaffold maxWidth={920}>
      <PageHeader
        title="Review Practice"
        subtitle={`${activeProfile.name} · ${currentIndex + 1} / ${sessionItems.length}`}
        icon={Lightbulb}
        onBack={() => router.back()}
      />

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      <View style={[styles.layout, isMobile && styles.layoutMobile]}>
        <View style={[styles.mainColumn, isMobile && styles.mainColumnMobile]}>
          <View
            style={[
              styles.practiceCard,
              isMobile && styles.practiceCardMobile,
              feedback === "correct" && styles.practiceCardCorrect,
              feedback === "wrong" && styles.practiceCardWrong,
            ]}
          >
            <AppText variant="small" color={colors.primary}>
              {currentItem.sourceModule} · {currentItem.level}
            </AppText>
            <AppText
              variant={isMobile ? "h2" : "h1"}
              style={[styles.prompt, isMobile && styles.promptMobile]}
              numberOfLines={isMobile ? 4 : 6}
              adjustsFontSizeToFit
              minimumFontScale={0.74}
            >
              {currentItem.prompt}
            </AppText>
            {showHint ? (
              <View style={styles.hintBox}>
                <AppText variant="small" color={colors.muted}>
                  Correct answer
                </AppText>
                <AppText color={colors.text}>{currentItem.correctAnswer}</AppText>
                {currentItem.explanationAz ? (
                  <AppText variant="small" color={colors.muted}>
                    {currentItem.explanationAz}
                  </AppText>
                ) : null}
              </View>
            ) : null}
            {statusCopy ? (
              <View style={[styles.feedback, { borderColor: statusCopy.color }]}>
                <AppText variant="h3" color={statusCopy.color}>
                  {statusCopy.title}
                </AppText>
                <AppText color={colors.textSoft}>{statusCopy.message}</AppText>
              </View>
            ) : null}
          </View>

          <View style={styles.answerPanel}>
            <TextInput
              accessibilityLabel="Review answer"
              value={answer}
              onChangeText={setAnswer}
              placeholder="Type the English answer"
              placeholderTextColor={colors.muted}
              editable={!isLocked}
              autoCapitalize="sentences"
              returnKeyType="done"
              blurOnSubmit={false}
              onSubmitEditing={() => void submitAnswer()}
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Check review answer"
              disabled={isLocked || !answer.trim()}
              onPress={() => void submitAnswer()}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.pressed,
                (isLocked || !answer.trim()) && styles.disabled,
              ]}
            >
              <Send color={colors.background} size={18} />
              <AppText style={styles.submitText}>Check</AppText>
            </Pressable>
          </View>

          <View style={styles.actions}>
            <AppButton
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
              disabled={currentIndex === 0 || isLocked}
              onPress={goPrevious}
            >
              Previous
            </AppButton>
            <AppButton
              variant={showHint ? "primary" : "secondary"}
              size="sm"
              icon={Lightbulb}
              onPress={() => setShowHint((visible) => !visible)}
            >
              Hint
            </AppButton>
            <AppButton
              variant="secondary"
              size="sm"
              icon={Volume2}
              onPress={() => void speak(currentItem.correctAnswer)}
            >
              Replay
            </AppButton>
            <AppButton variant="secondary" size="sm" icon={SkipForward} disabled={isLocked} onPress={skip}>
              Skip
            </AppButton>
          </View>
        </View>

        <View style={[styles.sideColumn, isMobile && styles.sideColumnMobile]}>
          <View style={styles.sideCard}>
            <AppText variant="h3">Previous</AppText>
            {previousItem ? (
              <>
                <AppText color={colors.textSoft}>{previousItem.prompt}</AppText>
                <AppText color={colors.success}>{previousItem.correctAnswer}</AppText>
              </>
            ) : (
              <AppText color={colors.muted}>No previous review item yet.</AppText>
            )}
          </View>
          <View style={styles.sideCard}>
            <AppText variant="h3">Stats</AppText>
            <AppText color={colors.muted}>Remaining: {sessionItems.length}</AppText>
            <AppText color={colors.muted}>Mistakes: {currentItem.mistakeCount}</AppText>
            <AppText color={colors.muted}>Correct reviews: {currentItem.correctReviewCount}</AppText>
          </View>
        </View>
      </View>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 10,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.round,
    backgroundColor: colors.progress,
  },
  layout: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
    flexWrap: "wrap",
  },
  layoutMobile: {
    flexDirection: "column",
    gap: spacing.md,
  },
  mainColumn: {
    flex: 2,
    minWidth: 300,
    gap: spacing.md,
  },
  mainColumnMobile: {
    width: "100%",
    minWidth: 0,
  },
  sideColumn: {
    flex: 1,
    minWidth: 240,
    gap: spacing.md,
  },
  sideColumnMobile: {
    width: "100%",
    minWidth: 0,
  },
  practiceCard: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.xxl,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  practiceCardMobile: {
    minHeight: 176,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  practiceCardCorrect: {
    borderColor: colors.success,
    backgroundColor: "rgba(34,197,94,0.10)",
  },
  practiceCardWrong: {
    borderColor: colors.danger,
    backgroundColor: "rgba(239,68,68,0.10)",
  },
  prompt: {
    textAlign: "center",
  },
  promptMobile: {
    lineHeight: 34,
  },
  hintBox: {
    width: "100%",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedback: {
    width: "100%",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  answerPanel: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    minHeight: 56,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    fontSize: 16,
    fontWeight: "700",
  },
  submitButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
  },
  submitText: {
    color: colors.background,
    fontWeight: "900",
  },
  sideCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.84,
  },
  disabled: {
    opacity: 0.5,
  },
});
