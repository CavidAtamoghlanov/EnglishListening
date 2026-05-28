import { LessonPreviousPanel } from "../../../components/lesson/LessonPreviousPanel";
import type { WritingItem } from "../types";

type WritingPreviousPanelProps = {
  item: WritingItem | null;
  onReplay?: () => void;
};

export function WritingPreviousPanel({ item, onReplay }: WritingPreviousPanelProps) {
  return (
    <LessonPreviousPanel
      title="Əvvəlki yazı"
      emptyText="Hələ əvvəlki yazı tapşırığı yoxdur"
      icon={item?.icon}
      primary={item?.prompt}
      secondary={item?.correctAnswer}
      onReplay={item ? onReplay : undefined}
    />
  );
}
