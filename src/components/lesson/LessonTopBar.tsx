import { Pressable, StyleSheet, View } from "react-native";
import { RotateCcw, X } from "lucide-react-native";
import { AppText } from "../common/AppText";
import { lessonColors } from "./lessonTheme";

type LessonTopBarProps = {
  progressPercent: number;
  onClose: () => void;
  scoreLabel: string;
  onRestart?: () => void;
};

export function LessonTopBar({
  progressPercent,
  onClose,
  scoreLabel,
  onRestart,
}: LessonTopBarProps) {
  const bounded = Math.min(100, Math.max(0, progressPercent));

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close lesson"
        onPress={onClose}
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
      >
        <X color={lessonColors.text} size={25} strokeWidth={2.6} />
      </Pressable>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${bounded}%` }]} />
      </View>

      {onRestart ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Restart lesson"
          onPress={onRestart}
          style={({ pressed }) => [styles.restartButton, pressed && styles.pressed]}
        >
          <RotateCcw color={lessonColors.muted} size={18} strokeWidth={2.4} />
        </Pressable>
      ) : null}

      <View style={styles.score}>
        <AppText variant="small" style={styles.scoreText} numberOfLines={1}>
          {scoreLabel}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
  },
  progressTrack: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(148,163,184,0.24)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: lessonColors.green,
  },
  restartButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: lessonColors.border,
  },
  score: {
    minWidth: 58,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(124,224,47,0.10)",
    borderWidth: 1,
    borderColor: "rgba(124,224,47,0.22)",
  },
  scoreText: {
    color: lessonColors.text,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
});
