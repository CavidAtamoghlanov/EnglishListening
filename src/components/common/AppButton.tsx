import { ComponentType, PropsWithChildren } from "react";
import { Pressable, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import type { LucideProps } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { shadows } from "../../theme/shadows";
import { spacing } from "../../theme/spacing";
import { AppText } from "./AppText";

export type AppButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type AppButtonSize = "sm" | "md" | "lg";

type AppButtonProps = PropsWithChildren<{
  onPress?: () => void;
  disabled?: boolean;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  icon?: ComponentType<LucideProps>;
  accessibilityLabel?: string;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}>;

const variants: Record<AppButtonVariant, { bg: string; color: string; border: string }> = {
  primary: { bg: colors.primary, color: colors.white, border: colors.primary },
  secondary: { bg: colors.surfaceRaised, color: colors.text, border: colors.border },
  ghost: { bg: "transparent", color: colors.primaryDark, border: "transparent" },
  danger: { bg: colors.danger, color: colors.white, border: colors.danger },
  success: { bg: colors.success, color: colors.white, border: colors.success },
};

const sizes: Record<AppButtonSize, { minHeight: number; padding: number; icon: number }> = {
  sm: { minHeight: 40, padding: spacing.md, icon: 17 },
  md: { minHeight: 48, padding: spacing.lg, icon: 19 },
  lg: { minHeight: 56, padding: spacing.xl, icon: 21 },
};

export function AppButton({
  children,
  onPress,
  disabled,
  variant = "primary",
  size = "md",
  icon: Icon,
  accessibilityLabel,
  style,
  textStyle,
}: AppButtonProps) {
  const current = variants[variant];
  const currentSize = sizes[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" || variant === "success" ? shadows.button : null,
        {
          minHeight: currentSize.minHeight,
          paddingHorizontal: currentSize.padding,
          backgroundColor: current.bg,
          borderColor: current.border,
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <View style={styles.inner}>
        {Icon ? <Icon size={currentSize.icon} color={current.color} strokeWidth={2.3} /> : null}
        <AppText variant="small" style={[styles.label, textStyle]} color={current.color}>
          {children}
        </AppText>
      </View>
    </Pressable>
  );
}

export function PrimaryButton(props: Omit<AppButtonProps, "variant">) {
  return <AppButton {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<AppButtonProps, "variant">) {
  return <AppButton {...props} variant="secondary" />;
}

export function DangerButton(props: Omit<AppButtonProps, "variant">) {
  return <AppButton {...props} variant="danger" />;
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  label: {
    fontWeight: "700",
    textAlign: "center",
  },
});
