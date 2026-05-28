import type { WritingItem } from "../types";

export function normalizeWritingAnswer(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s']/gu, "")
    .replace(/\s+/g, " ");
}

export function isWritingAnswerCorrect(item: WritingItem, answer: string): boolean {
  const normalizedAnswer = normalizeWritingAnswer(answer);
  if (!normalizedAnswer) {
    return false;
  }

  const accepted = [item.correctAnswer, ...item.acceptedAnswers];
  return accepted.some((candidate) => normalizeWritingAnswer(candidate) === normalizedAnswer);
}
