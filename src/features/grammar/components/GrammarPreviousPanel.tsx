import { LessonPreviousPanel } from "../../../components/lesson/LessonPreviousPanel";
import type { GrammarExercise } from "../types";

type GrammarPreviousPanelProps = {
  exercise: GrammarExercise | null;
};

export function GrammarPreviousPanel({ exercise }: GrammarPreviousPanelProps) {
  return (
    <LessonPreviousPanel
      title="Əvvəlki tapşırıq"
      emptyText="Hələ əvvəlki tapşırıq yoxdur"
      icon={exercise?.icon}
      primary={exercise?.prompt}
      secondary={exercise?.correctAnswer}
    />
  );
}
