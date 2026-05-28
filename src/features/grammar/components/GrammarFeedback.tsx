import { StyleSheet, View } from "react-native";
import { CheckCircle2, XCircle } from "lucide-react-native";
import { AppText } from "../../../components/common/AppText";
import { lessonColors } from "../../../components/lesson/lessonTheme";

type GrammarFeedbackProps = {
  tone: "neutral" | "correct" | "wrong";
  message: string | null;
  explanation?: string;
  correctAnswer?: string;
};

export function GrammarFeedback({ tone, message, explanation, correctAnswer }: GrammarFeedbackProps) {
  const isCorrect = tone === "correct";
  const isWrong = tone === "wrong";
  const Icon = isCorrect ? CheckCircle2 : isWrong ? XCircle : null;

  return (
    <View style={[styles.panel, isCorrect && styles.correct, isWrong && styles.wrong]}>
      {Icon ? (
        <Icon
          color={isCorrect ? lessonColors.success : lessonColors.red}
          size={22}
          strokeWidth={2.7}
        />
      ) : null}
      <View style={styles.copy}>
        <AppText style={styles.message}>
          {message ?? "Write the full English sentence, then check it."}
        </AppText>
        {correctAnswer && isWrong ? (
          <AppText style={styles.answer}>Correct form: {correctAnswer}</AppText>
        ) : null}
        {explanation && tone !== "neutral" ? (
          <AppText style={styles.explanation}>{explanation}</AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: "100%",
    maxWidth: 560,
    minHeight: 66,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    gap: 4,
  },
  message: {
    color: lessonColors.text,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  answer: {
    color: lessonColors.yellowButton,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },
  explanation: {
    color: lessonColors.muted,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
});
