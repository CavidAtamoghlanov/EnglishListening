import { StyleSheet, View } from "react-native";
import { AppText } from "../../../components/common/AppText";
import { LessonCard, type LessonCardTone } from "../../../components/lesson/LessonCard";
import { lessonColors } from "../../../components/lesson/lessonTheme";
import type { WritingItem, WritingPracticeMode } from "../types";
import { WritingHintChips } from "./WritingHintChips";

type WritingPracticeCardProps = {
  item: WritingItem;
  mode: WritingPracticeMode;
  eyebrow: string;
  tone: LessonCardTone;
  hintText?: string | null;
  submittedAnswer: string | null;
  feedbackMessage: string | null;
  onSkip: () => void;
  onPress: () => void;
};

export function WritingPracticeCard({
  item,
  mode,
  eyebrow,
  tone,
  hintText,
  submittedAnswer,
  feedbackMessage,
  onSkip,
  onPress,
}: WritingPracticeCardProps) {
  const displayText =
    mode === "listen-write"
      ? "Listen and write"
      : mode === "fix-english"
        ? item.wrongEnglish ?? item.prompt
        : item.prompt;

  return (
    <LessonCard
      itemKey={item.id}
      icon={item.icon}
      prompt={displayText}
      eyebrow={eyebrow}
      tone={tone}
      hintText={hintText}
      onPress={onPress}
      onSkip={onSkip}
      skipTitle="Yuxarı sürüşdür"
      skipSubtitle="Sona at"
      feedbackMessage={feedbackMessage}
      displayedAnswer={submittedAnswer}
      answerLabel={submittedAnswer ? "Your answer" : null}
    >
      {mode !== "listen-write" ? (
        <WritingHintChips displayText={displayText} hints={item.hints} />
      ) : (
        <View style={styles.listenNote}>
          <AppText style={styles.listenText}>Use Replay, then type exactly what you hear.</AppText>
        </View>
      )}
    </LessonCard>
  );
}

const styles = StyleSheet.create({
  listenNote: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.22)",
  },
  listenText: {
    color: lessonColors.text,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "800",
  },
});
