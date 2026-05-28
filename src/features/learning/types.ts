export type LearningLevel = "A1" | "A2" | "B1" | "B2";
export type CEFRLevel = LearningLevel;

export type LearningModule =
  | "words"
  | "sentences"
  | "grammar"
  | "writing"
  | "review"
  | "developer-english"
  | "dialogues"
  | "listening-stories"
  | "journal";

export type LearningActivityType =
  | "speak"
  | "write"
  | "listen"
  | "grammar"
  | "review"
  | "dialogue"
  | "journal";

export type LearningResult = "correct" | "wrong" | "skipped";

export type LearningEvent = {
  id: string;
  profileId: string;
  module: LearningModule;
  activityType: LearningActivityType;
  level?: LearningLevel;
  itemId: string;
  prompt: string;
  correctAnswer: string;
  userAnswer?: string;
  result: LearningResult;
  mistakeType?: string;
  explanationAz?: string;
  createdAt: string;
};

export type ReviewItem = {
  id: string;
  profileId: string;
  sourceModule: LearningModule;
  sourceItemId: string;
  level?: LearningLevel;
  prompt: string;
  correctAnswer: string;
  userAnswer?: string;
  explanationAz?: string;
  mistakeCount: number;
  correctReviewCount: number;
  easeFactor: number;
  intervalDays: number;
  dueAt: string;
  lastReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type DailyTask = {
  id: string;
  module: LearningModule;
  title: string;
  description: string;
  targetCount: number;
  completedCount: number;
  route: string;
  isCompleted: boolean;
};

export type DailyPath = {
  profileId: string;
  date: string;
  tasks: DailyTask[];
  completedTasks: number;
  totalTasks: number;
  updatedAt: string;
};

export type UserXP = {
  profileId: string;
  totalXp: number;
  todayXp: number;
  currentLeague?: string;
  levelTitle: string;
  updatedAt: string;
};

export type LearningModuleConfig = {
  id: LearningModule;
  title: string;
  shortTitle: string;
  description: string;
  route: string;
  activityType: LearningActivityType;
  isAvailable: boolean;
};

export type RecordLearningResultInput = {
  profileId: string;
  module: LearningModule;
  activityType: LearningActivityType;
  level?: LearningLevel;
  itemId: string;
  prompt: string;
  correctAnswer: string;
  userAnswer?: string;
  result: LearningResult;
  mistakeType?: string;
  explanationAz?: string;
  awardXp?: boolean;
  streakCount?: number;
};
