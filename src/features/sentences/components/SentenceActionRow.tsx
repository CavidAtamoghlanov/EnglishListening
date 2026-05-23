import { Languages, Volume2 } from "lucide-react-native";
import { PracticeActionRow } from "../../../components/common/PracticeActionRow";
import type { SentencePracticeMode } from "../types";

type SentenceActionRowProps = {
  mode: SentencePracticeMode;
  showFullTranslation: boolean;
  onToggleTranslation: () => void;
  onReplay: () => void;
  onMicPress: () => void;
  isListening: boolean;
  disabled?: boolean;
};

export function SentenceActionRow({
  mode,
  showFullTranslation,
  onToggleTranslation,
  onReplay,
  onMicPress,
  isListening,
  disabled = false,
}: SentenceActionRowProps) {
  const isRepeat = mode === "repeat";
  const hintLabel = isRepeat
    ? showFullTranslation
      ? "Hide translation"
      : "Translate"
    : showFullTranslation
      ? "Hide English"
      : "Show English";

  return (
    <PracticeActionRow
      pills={[
        {
          label: hintLabel,
          icon: Languages,
          onPress: onToggleTranslation,
          active: showFullTranslation,
        },
        {
          label: "Replay English",
          icon: Volume2,
          onPress: onReplay,
        },
      ]}
      onMicPress={onMicPress}
      isListening={isListening}
      disabled={disabled}
    />
  );
}
