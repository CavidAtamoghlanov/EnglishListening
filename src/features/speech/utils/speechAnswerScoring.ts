export type SpeechScoreReason =
  | "exact"
  | "accepted-answer"
  | "similarity"
  | "word-coverage"
  | "too-different";

export type SpeechScoreResult = {
  isAccepted: boolean;
  score: number;
  matchedWords: string[];
  missingWords: string[];
  extraWords: string[];
  normalizedExpected: string;
  normalizedActual: string;
  reason: SpeechScoreReason;
};

const CONTRACTIONS: Array<[RegExp, string]> = [
  [/\bi'm\b/gi, "i am"],
  [/\byou're\b/gi, "you are"],
  [/\bhe's\b/gi, "he is"],
  [/\bshe's\b/gi, "she is"],
  [/\bit's\b/gi, "it is"],
  [/\bwe're\b/gi, "we are"],
  [/\bthey're\b/gi, "they are"],
  [/\bi've\b/gi, "i have"],
  [/\byou've\b/gi, "you have"],
  [/\bwe've\b/gi, "we have"],
  [/\bthey've\b/gi, "they have"],
  [/\bi'll\b/gi, "i will"],
  [/\byou'll\b/gi, "you will"],
  [/\bwe'll\b/gi, "we will"],
  [/\bthey'll\b/gi, "they will"],
  [/\bdon't\b/gi, "do not"],
  [/\bdoesn't\b/gi, "does not"],
  [/\bdidn't\b/gi, "did not"],
  [/\bcan't\b/gi, "can not"],
  [/\bcannot\b/gi, "can not"],
  [/\bwon't\b/gi, "will not"],
  [/\bisn't\b/gi, "is not"],
  [/\baren't\b/gi, "are not"],
];

function normalizeTechnicalTerms(text: string): string {
  return text
    .replace(/\.net/gi, " dotnet ")
    .replace(/\bdot\s+net\b/gi, " dotnet ")
    .replace(/\bc\s*#/gi, " csharp ")
    .replace(/\bc\s+sharp\b/gi, " csharp ")
    .replace(/\ba\s*p\s*i\b/gi, " api ")
    .replace(/\bs\s*q\s*l\b/gi, " sql ");
}

export function normalizeSpeechText(text: string): string {
  let normalized = normalizeTechnicalTerms(text.toLowerCase().trim());
  for (const [pattern, replacement] of CONTRACTIONS) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshteinDistance(left: string, right: string): number {
  if (left === right) {
    return 0;
  }
  if (left.length === 0) {
    return right.length;
  }
  if (right.length === 0) {
    return left.length;
  }

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = Array.from({ length: right.length + 1 }, () => 0);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      const insertion = (current[rightIndex - 1] ?? 0) + 1;
      const deletion = (previous[rightIndex] ?? 0) + 1;
      const substitution = (previous[rightIndex - 1] ?? 0) + substitutionCost;
      current[rightIndex] = Math.min(
        insertion,
        deletion,
        substitution,
      );
    }

    for (let index = 0; index < previous.length; index += 1) {
      previous[index] = current[index] ?? 0;
    }
  }

  return previous[right.length] ?? 0;
}

function similarity(left: string, right: string): number {
  const longest = Math.max(left.length, right.length);
  if (longest === 0) {
    return 1;
  }

  return 1 - levenshteinDistance(left, right) / longest;
}

function tokenize(text: string): string[] {
  return text.split(" ").filter(Boolean);
}

function getWordCoverage(expected: string, actual: string) {
  const expectedWords = tokenize(expected);
  const actualWords = tokenize(actual);
  const remainingActual = [...actualWords];
  const matchedWords: string[] = [];
  const missingWords: string[] = [];

  for (const expectedWord of expectedWords) {
    const exactIndex = remainingActual.indexOf(expectedWord);
    if (exactIndex >= 0) {
      matchedWords.push(expectedWord);
      remainingActual.splice(exactIndex, 1);
      continue;
    }

    const fuzzyIndex = remainingActual.findIndex((actualWord) => {
      const threshold = expectedWord.length <= 3 ? 0.85 : 0.72;
      return similarity(expectedWord, actualWord) >= threshold;
    });

    if (fuzzyIndex >= 0) {
      matchedWords.push(expectedWord);
      remainingActual.splice(fuzzyIndex, 1);
      continue;
    }

    missingWords.push(expectedWord);
  }

  const coverage = expectedWords.length > 0 ? matchedWords.length / expectedWords.length : 0;
  return {
    coverage,
    matchedWords,
    missingWords,
    extraWords: remainingActual,
  };
}

function scoreAgainstCandidate(
  normalizedActual: string,
  normalizedCandidate: string,
): Omit<SpeechScoreResult, "reason" | "isAccepted" | "normalizedExpected" | "normalizedActual"> {
  const candidateWords = tokenize(normalizedCandidate);
  const actualWords = tokenize(normalizedActual);
  const editSimilarity = similarity(normalizedCandidate, normalizedActual);

  if (candidateWords.length <= 1 && actualWords.length <= 1) {
    return {
      score: editSimilarity,
      matchedWords: editSimilarity >= 0.65 ? candidateWords : [],
      missingWords: editSimilarity >= 0.65 ? [] : candidateWords,
      extraWords: editSimilarity >= 0.65 ? [] : actualWords,
    };
  }

  const coverage = getWordCoverage(normalizedCandidate, normalizedActual);
  const extraPenalty =
    actualWords.length > candidateWords.length
      ? Math.min((actualWords.length - candidateWords.length) / Math.max(candidateWords.length, 1), 1)
      : 0;
  const combinedScore = Math.max(
    0,
    Math.min(1, editSimilarity * 0.45 + coverage.coverage * 0.55 - extraPenalty * 0.12),
  );

  return {
    score: combinedScore,
    matchedWords: coverage.matchedWords,
    missingWords: coverage.missingWords,
    extraWords: coverage.extraWords,
  };
}

export function scoreSpeechAnswer(
  actual: string,
  expected: string,
  acceptedAnswers: string[],
): SpeechScoreResult {
  const normalizedActual = normalizeSpeechText(actual);
  const normalizedExpected = normalizeSpeechText(expected);
  const candidates = Array.from(
    new Set([expected, ...acceptedAnswers].map(normalizeSpeechText).filter(Boolean)),
  );

  if (!normalizedActual || !normalizedExpected) {
    return {
      isAccepted: false,
      score: 0,
      matchedWords: [],
      missingWords: tokenize(normalizedExpected),
      extraWords: tokenize(normalizedActual),
      normalizedExpected,
      normalizedActual,
      reason: "too-different",
    };
  }

  if (normalizedActual === normalizedExpected) {
    return {
      isAccepted: true,
      score: 1,
      matchedWords: tokenize(normalizedExpected),
      missingWords: [],
      extraWords: [],
      normalizedExpected,
      normalizedActual,
      reason: "exact",
    };
  }

  if (candidates.some((candidate) => candidate !== normalizedExpected && candidate === normalizedActual)) {
    return {
      isAccepted: true,
      score: 1,
      matchedWords: tokenize(normalizedActual),
      missingWords: [],
      extraWords: [],
      normalizedExpected,
      normalizedActual,
      reason: "accepted-answer",
    };
  }

  let best = scoreAgainstCandidate(normalizedActual, normalizedExpected);
  for (const candidate of candidates) {
    const candidateScore = scoreAgainstCandidate(normalizedActual, candidate);
    if (candidateScore.score > best.score) {
      best = candidateScore;
    }
  }

  const expectedWords = tokenize(normalizedExpected);
  const actualWords = tokenize(normalizedActual);
  const isSingleWord = expectedWords.length <= 1 && actualWords.length <= 1;
  const minimumScore = isSingleWord && normalizedExpected.length <= 3 ? 0.8 : 0.65;
  const coverage = getWordCoverage(normalizedExpected, normalizedActual);
  const enoughCoverage = isSingleWord ? true : coverage.coverage >= 0.55;
  const isAccepted = best.score >= minimumScore && enoughCoverage;

  return {
    isAccepted,
    score: best.score,
    matchedWords: best.matchedWords,
    missingWords: best.missingWords,
    extraWords: best.extraWords,
    normalizedExpected,
    normalizedActual,
    reason: isAccepted
      ? isSingleWord
        ? "similarity"
        : "word-coverage"
      : "too-different",
  };
}
