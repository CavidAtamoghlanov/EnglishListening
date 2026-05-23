import { ComponentType } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import type { LucideProps } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { AppText } from "./AppText";

type IconBubbleProps = {
  icon?: ComponentType<LucideProps>;
  emoji?: string;
  color?: string;
  backgroundColor?: string;
  size?: number;
  iconSize?: number;
  style?: ViewStyle | ViewStyle[];
};

export function IconBubble({
  icon: Icon,
  emoji,
  color = colors.primary,
  backgroundColor = colors.primarySoft,
  size = 52,
  iconSize = 24,
  style,
}: IconBubbleProps) {
  return (
    <View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: Math.min(radii.xl, size / 2),
          backgroundColor,
        },
        style,
      ]}
    >
      {Icon ? <Icon color={color} size={iconSize} strokeWidth={2.25} /> : null}
      {emoji ? <AppText style={[styles.emoji, { fontSize: Math.round(size * 0.48) }]}>{emoji}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xs,
  },
  emoji: {
    textAlign: "center",
  },
});
