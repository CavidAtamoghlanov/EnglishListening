import type { ComponentType } from "react";
import { Pressable, StyleSheet } from "react-native";
import type { LucideProps } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { AppText } from "./AppText";

type ActionPillButtonProps = {
  label: string;
  icon?: ComponentType<LucideProps>;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
};

export function ActionPillButton({
  label,
  icon: Icon,
  onPress,
  disabled = false,
  active = false,
}: ActionPillButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        disabled && styles.disabled,
        pressed && !disabled && { opacity: 0.88, transform: [{ scale: 0.98 }] },
      ]}
    >
      {Icon ? <Icon size={16} color={active ? colors.primaryDark : colors.textSoft} strokeWidth={2.3} /> : null}
      <AppText variant="small" color={active ? colors.primaryDark : colors.textSoft} style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 108,
  },
  pillActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  label: {
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
});
