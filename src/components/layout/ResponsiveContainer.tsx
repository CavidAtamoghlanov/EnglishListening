import { PropsWithChildren } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

type ResponsiveContainerProps = PropsWithChildren<{
  maxWidth?: number;
  style?: ViewStyle | ViewStyle[];
}>;

export function ResponsiveContainer({ children, maxWidth = 1060, style }: ResponsiveContainerProps) {
  return <View style={[styles.container, { maxWidth }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "center",
  },
});
