import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { AppText } from "./AppText";

type Option<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="button"
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.option, selected ? styles.selected : null]}
          >
            <AppText
              variant="small"
              color={selected ? colors.white : colors.text}
              style={styles.optionText}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    minHeight: 40,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontWeight: "800",
  },
});
