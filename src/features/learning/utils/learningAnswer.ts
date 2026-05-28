export function normalizeLearningAnswer(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}'\s]/gu, "")
    .replace(/\s+/g, " ");
}

export function isLearningAnswerCorrect(answer: string, acceptedAnswers: string[]): boolean {
  const normalizedAnswer = normalizeLearningAnswer(answer);
  return acceptedAnswers.some(
    (accepted) => normalizeLearningAnswer(accepted) === normalizedAnswer,
  );
}
