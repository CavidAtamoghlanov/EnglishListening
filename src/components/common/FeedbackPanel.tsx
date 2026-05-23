import { Animated, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";

type FeedbackTone = "correct" | "wrong" | "neutral";

type FeedbackPanelProps = {
  displayedAnswer: string | null;
  answerLabel: string | null;
  message: string | null;
  tone: FeedbackTone;
  hint?: string;
  error?: string | null;
  scale?: Animated.Value;
};

export function FeedbackPanel({
  displayedAnswer,
  answerLabel,
  message,
  tone,
  hint = "Use the microphone or type your answer below.",
  error,
  scale,
}: FeedbackPanelProps) {
  const toneStyle =
    tone === "correct" ? styles.correct : tone === "wrong" ? styles.wrong : styles.neutral;

  const content = (
    <View style={[styles.panel, toneStyle]}>
      {displayedAnswer && answerLabel ? (
        <View style={styles.answerBlock}>
          <AppText variant="small" color={colors.muted}>
            {answerLabel}:
          </AppText>
          <AppText style={styles.answerValue} numberOfLines={4}>
            {displayedAnswer}
          </AppText>
        </View>
      ) : (
        <AppText variant="small" color={colors.muted} style={styles.hintText}>
          {hint}
        </AppText>
      )}
      {error ? (
        <AppText variant="small" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
      {message ? (
        <AppText
          variant="body"
          style={styles.message}
          color={tone === "correct" ? colors.success : tone === "wrong" ? colors.danger : colors.ink}
        >
          {message}
        </AppText>
      ) : null}
    </View>
  );

  if (scale) {
    return <Animated.View style={{ transform: [{ scale }] }}>{content}</Animated.View>;
  }

  return content;
}

const styles = StyleSheet.create({
  panel: {
    width: "100%",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
  },
  neutral: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
  },
  correct: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  wrong: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
  },
  answerBlock: {
    alignItems: "center",
    gap: 2,
    maxWidth: "100%",
  },
  answerValue: {
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
  },
  hintText: {
    textAlign: "center",
    lineHeight: 20,
  },
  message: {
    fontWeight: "700",
    textAlign: "center",
  },
});
