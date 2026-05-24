import { Pressable, StyleSheet, View } from "react-native";
import { Play } from "lucide-react-native";
import { AppText } from "../common/AppText";
import { lessonColors } from "./lessonTheme";

type LessonPreviousPanelProps = {
  title: string;
  emptyText: string;
  icon?: string;
  primary?: string;
  secondary?: string;
  onReplay?: () => void;
};

export function LessonPreviousPanel({
  title,
  emptyText,
  icon,
  primary,
  secondary,
  onReplay,
}: LessonPreviousPanelProps) {
  const hasItem = Boolean(primary || secondary);

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <AppText style={styles.title}>{title}</AppText>
        {hasItem && icon ? <AppText style={styles.icon}>{icon}</AppText> : null}
      </View>

      {!hasItem ? (
        <AppText style={styles.empty}>{emptyText}</AppText>
      ) : (
        <View style={styles.body}>
          {primary ? (
            <AppText style={styles.primary} numberOfLines={3}>
              {primary}
            </AppText>
          ) : null}
          {secondary ? (
            <AppText style={styles.secondary} numberOfLines={3}>
              {secondary}
            </AppText>
          ) : null}
          {onReplay ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Replay ${title.toLowerCase()}`}
              onPress={onReplay}
              style={({ pressed }) => [styles.replay, pressed && styles.pressed]}
            >
              <Play color={lessonColors.background} fill={lessonColors.background} size={18} />
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: "100%",
    minHeight: 112,
    padding: 16,
    borderRadius: 22,
    backgroundColor: lessonColors.panel,
    borderWidth: 1,
    borderColor: lessonColors.border,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    color: lessonColors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  icon: {
    color: lessonColors.text,
    fontSize: 22,
    lineHeight: 26,
  },
  empty: {
    color: lessonColors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    minHeight: 58,
    justifyContent: "center",
    paddingRight: 54,
    gap: 4,
  },
  primary: {
    color: lessonColors.yellowButton,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
  },
  secondary: {
    color: lessonColors.muted,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
  },
  replay: {
    position: "absolute",
    right: 0,
    top: 8,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lessonColors.yellowButton,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.96 }],
  },
});
