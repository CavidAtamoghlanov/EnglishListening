import { PropsWithChildren } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { spacing } from "../../theme/spacing";

type GridProps = PropsWithChildren<{
  minItemWidth?: number;
  gap?: number;
  style?: ViewStyle | ViewStyle[];
}>;

export function Grid({ children, minItemWidth = 280, gap = spacing.lg, style }: GridProps) {
  return (
    <View style={[styles.grid, { gap }, style]}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <View key={index} style={{ flexGrow: 1, flexBasis: minItemWidth }}>
              {child}
            </View>
          ))
        : children}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
