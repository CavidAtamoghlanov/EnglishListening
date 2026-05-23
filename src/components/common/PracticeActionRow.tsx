import type { ComponentType } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import type { LucideProps } from "lucide-react-native";
import { spacing } from "../../theme/spacing";
import { ActionPillButton } from "./ActionPillButton";
import { MicButton } from "./MicButton";

export type PracticePillAction = {
  label: string;
  icon?: ComponentType<LucideProps>;
  onPress: () => void;
  active?: boolean;
};

type PracticeActionRowProps = {
  pills: PracticePillAction[];
  onMicPress: () => void;
  isListening?: boolean;
  disabled?: boolean;
};

export function PracticeActionRow({
  pills,
  onMicPress,
  isListening = false,
  disabled = false,
}: PracticeActionRowProps) {
  const { width } = useWindowDimensions();
  const stackOnNarrow = width < 400;

  return (
    <View style={[styles.row, stackOnNarrow && styles.rowStacked]}>
      <View style={[styles.pills, stackOnNarrow && styles.pillsStacked]}>
        {pills.map((pill) => (
          <ActionPillButton
            key={pill.label}
            label={pill.label}
            icon={pill.icon}
            onPress={pill.onPress}
            active={pill.active}
            disabled={disabled}
          />
        ))}
      </View>
      <MicButton onPress={onMicPress} isListening={isListening} disabled={disabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  rowStacked: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  pills: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
    minWidth: 0,
  },
  pillsStacked: {
    width: "100%",
  },
});
