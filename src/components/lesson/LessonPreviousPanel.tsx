import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ChevronDown, Play } from "lucide-react-native";
import { AppText } from "../common/AppText";
import { useResponsive } from "../../utils/useResponsive";
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
  const { isMobile } = useResponsive();
  const [expanded, setExpanded] = useState(false);
  const hasItem = Boolean(primary || secondary);
  const compact = isMobile && !expanded;

  return (
    <View style={styles.panel}>
      <Pressable
        accessibilityRole={isMobile ? "button" : undefined}
        accessibilityLabel={isMobile ? `${expanded ? "Collapse" : "Expand"} ${title}` : undefined}
        onPress={isMobile ? () => setExpanded((value) => !value) : undefined}
        style={({ pressed }) => [styles.header, pressed && isMobile && styles.pressed]}
      >
        <View style={styles.headerTitle}>
          <AppText style={styles.title}>{title}</AppText>
          {isMobile ? (
            <ChevronDown
              color={lessonColors.muted}
              size={18}
              style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}
            />
          ) : null}
        </View>
        {hasItem && icon ? <AppText style={styles.icon}>{icon}</AppText> : null}
      </Pressable>

      {!hasItem ? (
        <AppText style={styles.empty}>{emptyText}</AppText>
      ) : (
        <View style={[styles.body, compact && styles.bodyCompact]}>
          {primary ? (
            <AppText style={styles.primary} numberOfLines={compact ? 1 : 3}>
              {primary}
            </AppText>
          ) : null}
          {secondary && (!compact || !primary) ? (
            <AppText style={styles.secondary} numberOfLines={compact ? 1 : 3}>
              {secondary}
            </AppText>
          ) : null}
          {onReplay && !compact ? (
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
    minHeight: 0,
    padding: 14,
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
  headerTitle: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  bodyCompact: {
    minHeight: 24,
    paddingRight: 0,
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
