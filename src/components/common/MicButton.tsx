import { useEffect, useMemo } from "react";
import { Animated, Platform, Pressable, StyleSheet } from "react-native";
import { Mic } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { shadows } from "../../theme/shadows";

type MicButtonProps = {
  onPress: () => void;
  isListening?: boolean;
  disabled?: boolean;
  size?: number;
};

export function MicButton({
  onPress,
  isListening = false,
  disabled = false,
  size = 56,
}: MicButtonProps) {
  const pulse = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (!isListening) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [isListening, pulse]);

  const pulseStyle = {
    opacity: pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 0],
    }),
    transform: [
      {
        scale: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.35],
        }),
      },
    ],
  };

  const iconSize = Math.round(size * 0.46);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Start listening"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        { width: size + 8, height: size + 8 },
        disabled && styles.disabled,
        pressed && !disabled && { transform: [{ scale: 0.96 }] },
      ]}
    >
      <Animated.View
        style={[
          styles.pulse,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          pulseStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.button,
          shadows.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isListening ? colors.danger : colors.primary,
          },
        ]}
      >
        <Mic color={colors.white} size={iconSize} strokeWidth={2.4} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
    backgroundColor: colors.primary,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});
