import { StyleSheet, View } from "react-native";
import { AppText } from "../../../components/common/AppText";
import { LessonCard, type LessonCardTone } from "../../../components/lesson/LessonCard";
import { lessonColors } from "../../../components/lesson/lessonTheme";
import type { GrammarExercise } from "../types";

type GrammarExerciseCardProps = {
  exercise: GrammarExercise;
  eyebrow: string;
  tone: LessonCardTone;
  hintVisible: boolean;
  submittedAnswer: string | null;
  feedbackMessage: string | null;
  onSkip: () => void;
  onPress: () => void;
};

export function GrammarExerciseCard({
  exercise,
  eyebrow,
  tone,
  hintVisible,
  submittedAnswer,
  feedbackMessage,
  onSkip,
  onPress,
}: GrammarExerciseCardProps) {
  return (
    <LessonCard
      itemKey={exercise.id}
      icon={exercise.icon}
      prompt={exercise.prompt}
      eyebrow={eyebrow}
      tone={tone}
      hintText={hintVisible ? exercise.hint : null}
      onPress={onPress}
      onSkip={onSkip}
      skipTitle="Yuxarı sürüşdür"
      skipSubtitle="Sona at"
      feedbackMessage={feedbackMessage}
      displayedAnswer={submittedAnswer}
      answerLabel={submittedAnswer ? "Your answer" : null}
    >
      <View style={styles.metaBox}>
        <AppText style={styles.instruction}>{exercise.instruction}</AppText>
        <AppText style={styles.topic}>{exercise.topic}</AppText>
      </View>
    </LessonCard>
  );
}

const styles = StyleSheet.create({
  metaBox: {
    width: "100%",
    gap: 4,
    alignItems: "center",
  },
  instruction: {
    color: lessonColors.text,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
  },
  topic: {
    color: lessonColors.muted,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
