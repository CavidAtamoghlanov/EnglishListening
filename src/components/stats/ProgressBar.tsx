import { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";

type ProgressBarProps = {
  percent: number;
  height?: number;
  color?: string;
  trackColor?: string;
};

export function ProgressBar({
  percent,
  height = 12,
  color = colors.success,
  trackColor = colors.border,
}: ProgressBarProps) {
  const [animated] = useState(() => new Animated.Value(0));
  const bounded = Math.min(100, Math.max(0, percent));

  useEffect(() => {
    Animated.timing(animated, {
      toValue: bounded,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [animated, bounded]);

  const width = animated.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor }]}>
      <Animated.View style={[styles.fill, { width, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
