import type { ComponentType } from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import type { LucideProps } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { shadows } from "../../theme/shadows";

type IconButtonProps = {
  icon: ComponentType<LucideProps>;
  onPress?: () => void;
  accessibilityLabel: string;
  color?: string;
  backgroundColor?: string;
  size?: number;
  iconSize?: number;
  elevated?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
};

export function IconButton({
  icon: Icon,
  onPress,
  accessibilityLabel,
  color = colors.primary,
  backgroundColor = colors.surfaceRaised,
  size = 48,
  iconSize = 21,
  elevated = false,
  disabled,
  style,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        elevated ? shadows.soft : null,
        {
          width: size,
          height: size,
          borderRadius: Math.min(radii.lg, size / 2),
          backgroundColor,
          opacity: disabled ? 0.48 : pressed ? 0.82 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
        style,
      ]}
    >
      <Icon color={color} size={iconSize} strokeWidth={2.35} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
});
