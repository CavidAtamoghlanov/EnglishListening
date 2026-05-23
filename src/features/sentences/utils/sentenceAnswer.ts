import { normalizeAnswer } from "../../words/utils/answerUtils";
import type { SentenceItem } from "../types";

export { normalizeAnswer };

export function isSentenceAnswerCorrect(sentence: SentenceItem, answer: string): boolean {
  const normalizedAnswer = normalizeAnswer(answer);
  const accepted = [sentence.english, ...sentence.acceptedAnswers].map(normalizeAnswer);
  return accepted.includes(normalizedAnswer);
}

export function getMatchedWordIndices(sentenceText: string, answer: string): Set<number> {
  const tokens = sentenceText.trim().split(/\s+/);
  const answerWords = new Set(normalizeAnswer(answer).split(" ").filter(Boolean));
  const matched = new Set<number>();

  tokens.forEach((token, index) => {
    const normalizedToken = normalizeAnswer(token);
    if (normalizedToken && answerWords.has(normalizedToken)) {
      matched.add(index);
    }
  });

  return matched;
}
