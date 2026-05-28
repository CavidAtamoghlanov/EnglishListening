import type { GrammarExercise } from "../types";

export function normalizeGrammarAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

export function isGrammarAnswerCorrect(exercise: GrammarExercise, answer: string): boolean {
  const normalizedAnswer = normalizeGrammarAnswer(answer);
  const accepted = [exercise.correctAnswer, ...exercise.acceptedAnswers].map(normalizeGrammarAnswer);
  return accepted.includes(normalizedAnswer);
}

