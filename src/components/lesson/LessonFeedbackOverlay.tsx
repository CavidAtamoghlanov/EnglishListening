import { Animated, StyleSheet, View } from "react-native";
import { CheckCircle2, XCircle } from "lucide-react-native";
import { AppText } from "../common/AppText";
import { lessonColors } from "./lessonTheme";

type LessonFeedbackTone = "neutral" | "correct" | "wrong";

type LessonFeedbackOverlayProps = {
  tone: LessonFeedbackTone;
  displayedAnswer: string | null;
  answerLabel: string | null;
  message: string | null;
  hint: string;
  error?: string | null;
  scale?: Animated.Value;
};

export function LessonFeedbackOverlay({
  tone,
  displayedAnswer,
  answerLabel,
  message,
  hint,
  error,
  scale,
}: LessonFeedbackOverlayProps) {
  const isCorrect = tone === "correct";
  const isWrong = tone === "wrong";
  const Icon = isCorrect ? CheckCircle2 : isWrong ? XCircle : null;
  const content = (
    <View style={[styles.wrap, isCorrect && styles.correct, isWrong && styles.wrong]}>
      {Icon ? (
        <Icon
          size={22}
          color={isCorrect ? lessonColors.success : lessonColors.red}
          strokeWidth={2.7}
        />
      ) : null}
      <View style={styles.copy}>
        {displayedAnswer && answerLabel ? (
          <>
            <AppText variant="small" style={styles.label}>
              {answerLabel}
            </AppText>
            <AppText style={styles.answer} numberOfLines={3}>
              {displayedAnswer}
            </AppText>
          </>
        ) : (
          <AppText variant="small" style={styles.hint}>
            {hint}
          </AppText>
        )}
        {message ? (
          <AppText
            style={[
              styles.message,
              isCorrect && styles.messageCorrect,
              isWrong && styles.messageWrong,
            ]}
          >
            {message}
          </AppText>
        ) : null}
        {error ? (
          <AppText variant="small" style={styles.error}>
            {error}
          </AppText>
        ) : null}
      </View>
    </View>
  );

  if (scale) {
    return <Animated.View style={{ width: "100%", transform: [{ scale }] }}>{content}</Animated.View>;
  }

  return content;
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: "rgba(12,23,38,0.88)",
    borderWidth: 1,
    borderColor: lessonColors.border,
  },
  correct: {
    borderColor: "rgba(103,213,59,0.48)",
    backgroundColor: "rgba(103,213,59,0.12)",
  },
  wrong: {
    borderColor: "rgba(239,68,68,0.46)",
    backgroundColor: "rgba(239,68,68,0.12)",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 2,
  },
  label: {
    color: lessonColors.muted,
    fontWeight: "700",
  },
  answer: {
    color: lessonColors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  hint: {
    color: lessonColors.muted,
    textAlign: "center",
    lineHeight: 18,
  },
  message: {
    color: lessonColors.text,
    textAlign: "center",
    fontWeight: "900",
  },
  messageCorrect: {
    color: lessonColors.success,
  },
  messageWrong: {
    color: lessonColors.red,
  },
  error: {
    color: lessonColors.red,
    textAlign: "center",
  },
});
