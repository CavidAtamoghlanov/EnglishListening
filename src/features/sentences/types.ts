export type SentencePracticeMode = "repeat" | "translate";

export type SentenceLevel = "A1" | "A2" | "B1" | "B2";

export type SentenceWordHint = {
  text: string;
  translation: string;
  note?: string;
};

export type SentenceItem = {
  id: string;
  level: SentenceLevel;
  mode: SentencePracticeMode;
  english: string;
  azeri: string;
  acceptedAnswers: string[];
  category: string;
  icon: string;
  words: SentenceWordHint[];
  hint?: string;
};

export type SentenceLevelProgress = {
  level: SentenceLevel;
  mode: SentencePracticeMode;
  currentIndex: number;
  currentSentenceId: string | null;
  completedSentenceIds: string[];
  totalAttempts: number;
  correctCount: number;
  wrongCount: number;
  currentStreak: number;
  bestStreak: number;
  sessionOrderSentenceIds: string[];
  updatedAt: string;
};

export type UserSentenceProgress = {
  profileId: string;
  lastSelectedMode: SentencePracticeMode | null;
  lastSelectedLevel: SentenceLevel | null;
  levels: Record<SentencePracticeMode, Record<SentenceLevel, SentenceLevelProgress>>;
};
