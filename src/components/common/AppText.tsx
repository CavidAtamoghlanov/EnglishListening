import { PropsWithChildren } from "react";
import { StyleProp, Text, TextProps, TextStyle } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

type Variant = keyof typeof typography;

type AppTextProps = PropsWithChildren<
  TextProps & {
    variant?: Variant;
    color?: string;
    style?: StyleProp<TextStyle>;
  }
>;

export function AppText({
  children,
  variant = "body",
  color = colors.text,
  style,
  ...props
}: AppTextProps) {
  return (
    <Text {...props} style={[typography[variant], { color, letterSpacing: 0 }, style]}>
      {children}
    </Text>
  );
}
