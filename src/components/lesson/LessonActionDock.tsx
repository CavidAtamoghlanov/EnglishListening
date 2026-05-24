import type { ComponentType } from "react";
import { useEffect, useMemo } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";
import { Mic } from "lucide-react-native";
import type { LucideProps } from "lucide-react-native";
import { AppText } from "../common/AppText";
import { lessonColors, lessonShadow } from "./lessonTheme";

export type LessonAction = {
  label: string;
  icon: ComponentType<LucideProps>;
  onPress: () => void;
  active?: boolean;
};

type LessonActionDockProps = {
  actions: LessonAction[];
  onMicPress: () => void;
  isListening?: boolean;
  disabled?: boolean;
};

export function LessonActionDock({
  actions,
  onMicPress,
  isListening = false,
  disabled = false,
}: LessonActionDockProps) {
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
          duration: 850,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 850,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [isListening, pulse]);

  const leftActions = actions.slice(0, Math.ceil(actions.length / 2));
  const rightActions = actions.slice(Math.ceil(actions.length / 2));

  const pulseStyle = {
    opacity: pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.28, 0],
    }),
    transform: [
      {
        scale: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.42],
        }),
      },
    ],
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.sideActions}>
        {leftActions.map((action) => (
          <ActionButton key={action.label} action={action} disabled={disabled} />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start listening"
        onPress={onMicPress}
        disabled={disabled}
        style={({ pressed }) => [styles.micWrap, pressed && !disabled && styles.pressed, disabled && styles.disabled]}
      >
        <Animated.View style={[styles.micPulse, pulseStyle]} />
        <View style={[styles.micButton, lessonShadow]}>
          <Mic color={lessonColors.background} size={32} strokeWidth={2.8} />
        </View>
      </Pressable>

      <View style={styles.sideActions}>
        {rightActions.map((action) => (
          <ActionButton key={action.label} action={action} disabled={disabled} />
        ))}
      </View>
    </View>
  );
}

function ActionButton({ action, disabled }: { action: LessonAction; disabled: boolean }) {
  const Icon = action.icon;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={action.label}
      onPress={action.onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.action,
        action.active && styles.actionActive,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Icon
        color={action.active ? lessonColors.yellowButton : lessonColors.text}
        size={20}
        strokeWidth={2.5}
      />
      <AppText variant="small" style={[styles.actionLabel, action.active && styles.actionLabelActive]} numberOfLines={1}>
        {action.label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    maxWidth: 520,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 6,
  },
  sideActions: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  action: {
    width: 66,
    minHeight: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 22,
    backgroundColor: lessonColors.panel,
    borderWidth: 1,
    borderColor: lessonColors.border,
  },
  actionActive: {
    borderColor: "rgba(250,204,21,0.45)",
    backgroundColor: "rgba(250,204,21,0.10)",
  },
  actionLabel: {
    maxWidth: 58,
    color: lessonColors.muted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  actionLabelActive: {
    color: lessonColors.yellowButton,
  },
  micWrap: {
    width: 82,
    height: 82,
    alignItems: "center",
    justifyContent: "center",
  },
  micPulse: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: lessonColors.yellowButton,
  },
  micButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lessonColors.yellowButton,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.48,
  },
});
