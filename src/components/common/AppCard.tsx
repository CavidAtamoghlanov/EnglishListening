import { PropsWithChildren, useEffect, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { shadows } from "../../theme/shadows";
import { spacing } from "../../theme/spacing";

export type CardTone = "default" | "blue" | "green" | "yellow" | "violet" | "coral" | "muted";
export type CardPadding = "sm" | "md" | "lg";

type AppCardProps = PropsWithChildren<{
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  tone?: CardTone;
  padding?: CardPadding;
  elevated?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}>;

const toneBackground: Record<CardTone, string> = {
  default: colors.surfaceRaised,
  blue: colors.primaryTint,
  green: colors.successSoft,
  yellow: colors.warningSoft,
  violet: colors.violetSoft,
  coral: colors.coralSoft,
  muted: colors.surfaceAlt,
};

const paddingMap: Record<CardPadding, number> = {
  sm: spacing.md,
  md: spacing.lg,
  lg: spacing.xl,
};

export function AppCard({
  children,
  onPress,
  style,
  tone = "default",
  padding = "md",
  elevated = true,
  disabled,
  accessibilityLabel,
}: AppCardProps) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, [opacity, translateY]);

  const baseStyle = [
    styles.card,
    elevated ? shadows.soft : null,
    {
      backgroundColor: toneBackground[tone],
      padding: paddingMap[padding],
      opacity,
      transform: [{ translateY }],
    },
    style,
  ];

  if (!onPress) {
    return <Animated.View style={baseStyle}>{children}</Animated.View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: disabled ? 0.55 : pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      <Animated.View style={baseStyle}>{children}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
});
