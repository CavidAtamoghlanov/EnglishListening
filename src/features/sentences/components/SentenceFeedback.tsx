import { Animated } from "react-native";
import { FeedbackPanel } from "../../../components/common/FeedbackPanel";
import type { SentencePracticeFeedback } from "../services/sentencePracticeService";

type SentenceFeedbackProps = {
  displayedAnswer: string | null;
  answerLabel: string | null;
  feedback: SentencePracticeFeedback;
  listeningHint: string;
  speechError?: string | null;
  scale: Animated.Value;
};

export function SentenceFeedback({
  displayedAnswer,
  answerLabel,
  feedback,
  listeningHint,
  speechError,
  scale,
}: SentenceFeedbackProps) {
  const tone =
    feedback.type === "correct" ? "correct" : feedback.type === "wrong" ? "wrong" : "neutral";

  return (
    <FeedbackPanel
      displayedAnswer={displayedAnswer}
      answerLabel={answerLabel}
      message={feedback.message}
      tone={tone}
      hint={listeningHint}
      error={speechError}
      scale={scale}
    />
  );
}
