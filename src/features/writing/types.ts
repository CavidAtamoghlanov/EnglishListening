export type WritingLevel = "A1" | "A2" | "B1" | "B2";

export type WritingPracticeMode = "az-to-en" | "fix-english" | "listen-write";

export type WritingItemType = "word" | "phrase" | "sentence";

export type WritingHint = {
  text: string;
  translation?: string;
  correction?: string;
  note?: string;
};

export type WritingItem = {
  id: string;
  level: WritingLevel;
  mode: WritingPracticeMode;
  type: WritingItemType;
  category: string;
  icon: string;
  prompt: string;
  english: string;
  azeri?: string;
  wrongEnglish?: string;
  correctAnswer: string;
  acceptedAnswers: string[];
  hints: WritingHint[];
  explanationAz: string;
};

export type WritingLevelProgress = {
  level: WritingLevel;
  mode: WritingPracticeMode;
  currentIndex: number;
  currentItemId: string | null;
  completedItemIds: string[];
  totalAttempts: number;
  correctCount: number;
  wrongCount: number;
  currentStreak: number;
  bestStreak: number;
  sessionOrderItemIds: string[];
  updatedAt: string;
};

export type UserWritingProgress = {
  profileId: string;
  lastSelectedMode: WritingPracticeMode | null;
  lastSelectedLevel: WritingLevel | null;
  levels: Record<WritingPracticeMode, Record<WritingLevel, WritingLevelProgress>>;
};
