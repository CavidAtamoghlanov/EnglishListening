import type { WordItem } from "../types";

export function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

export function isAnswerCorrect(word: WordItem, answer: string): boolean {
  const normalizedAnswer = normalizeAnswer(answer);
  const accepted = [word.english, ...word.acceptedAnswers].map(normalizeAnswer);
  return accepted.includes(normalizedAnswer);
}
