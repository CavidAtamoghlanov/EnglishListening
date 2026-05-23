import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { AppText } from "./AppText";

type AvatarChipGridProps = {
  avatars: readonly string[];
  selected: string;
  onSelect: (emoji: string) => void;
};

export function AvatarChipGrid({ avatars, selected, onSelect }: AvatarChipGridProps) {
  return (
    <View style={styles.grid}>
      {avatars.map((emoji) => {
        const isSelected = emoji === selected;
        return (
          <Pressable
            key={emoji}
            accessibilityRole="button"
            accessibilityLabel={`Choose ${emoji} avatar`}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(emoji)}
            style={({ pressed }) => [
              styles.chip,
              isSelected && styles.chipSelected,
              pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] },
            ]}
          >
            <AppText style={styles.emoji}>{emoji}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
  },
  chip: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  emoji: {
    fontSize: 24,
    lineHeight: 28,
  },
});
