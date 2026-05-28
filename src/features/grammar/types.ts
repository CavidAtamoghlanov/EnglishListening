export type GrammarLevel = "A1" | "A2" | "B1" | "B2";

export type GrammarPracticeMode = "translate-write" | "fix-complete";

export type GrammarExerciseType =
  | "translate"
  | "fill_blank"
  | "fix_sentence"
  | "verb_form"
  | "word_order"
  | "preposition"
  | "article"
  | "tense";

export type GrammarExercise = {
  id: string;
  level: GrammarLevel;
  mode: GrammarPracticeMode;
  type: GrammarExerciseType;
  topic: string;
  category: string;
  icon: string;
  instruction: string;
  prompt: string;
  azeriPrompt?: string;
  englishPrompt?: string;
  correctAnswer: string;
  acceptedAnswers: string[];
  hint: string;
  explanationAz: string;
  exampleCorrect?: string;
};

export type GrammarExerciseProgress = {
  level: GrammarLevel;
  mode: GrammarPracticeMode;
  currentIndex: number;
  currentExerciseId: string | null;
  completedExerciseIds: string[];
  totalAttempts: number;
  correctCount: number;
  wrongCount: number;
  currentStreak: number;
  bestStreak: number;
  sessionOrderExerciseIds: string[];
  updatedAt: string;
};

export type UserGrammarProgress = {
  profileId: string;
  lastSelectedMode: GrammarPracticeMode | null;
  lastSelectedLevel: GrammarLevel | null;
  levels: Record<GrammarPracticeMode, Record<GrammarLevel, GrammarExerciseProgress>>;
};

