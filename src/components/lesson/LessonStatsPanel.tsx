import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Check, ChevronDown, Flame, RotateCcw, X } from "lucide-react-native";
import { AppText } from "../common/AppText";
import { useResponsive } from "../../utils/useResponsive";
import { lessonColors } from "./lessonTheme";

type LessonStatsPanelProps = {
  correct: number;
  wrong: number;
  remaining: number;
  streak: number;
  attempts: number;
  best: number;
};

export function LessonStatsPanel({
  correct,
  wrong,
  remaining,
  streak,
  attempts,
  best,
}: LessonStatsPanelProps) {
  const { isMobile } = useResponsive();
  const [expanded, setExpanded] = useState(false);
  const rows = [
    { label: "Correct", value: correct, icon: Check, color: lessonColors.success },
    { label: "Wrong", value: wrong, icon: X, color: lessonColors.red },
    { label: "Remaining", value: remaining, icon: RotateCcw, color: lessonColors.blue },
    { label: "Streak", value: streak, icon: Flame, color: lessonColors.yellowButton },
  ];

  return (
    <View style={styles.panel}>
      <Pressable
        accessibilityRole={isMobile ? "button" : undefined}
        accessibilityLabel={isMobile ? `${expanded ? "Collapse" : "Expand"} statistics` : undefined}
        onPress={isMobile ? () => setExpanded((value) => !value) : undefined}
        style={({ pressed }) => [styles.header, pressed && isMobile && styles.pressed]}
      >
        <View style={styles.headerTitle}>
          <AppText style={styles.title}>Statistics</AppText>
          {isMobile ? (
            <ChevronDown
              color={lessonColors.muted}
              size={18}
              style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}
            />
          ) : null}
        </View>
        <AppText style={styles.subtle}>
          {correct} ok - {wrong} wrong - {remaining} left
        </AppText>
      </Pressable>

      {!isMobile || expanded ? (
        <>
          <View style={styles.rows}>
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <View key={row.label} style={styles.row}>
                  <View style={styles.rowLabel}>
                    <Icon color={row.color} size={17} strokeWidth={2.8} />
                    <AppText style={styles.label}>{row.label}</AppText>
                  </View>
                  <AppText style={[styles.value, { color: row.color }]}>{row.value}</AppText>
                </View>
              );
            })}
          </View>
          <AppText style={styles.best}>Best streak: {best} - {attempts} attempts</AppText>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: "100%",
    padding: 14,
    borderRadius: 22,
    backgroundColor: lessonColors.panel,
    borderWidth: 1,
    borderColor: lessonColors.border,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerTitle: {
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
  subtle: {
    flex: 1,
    color: lessonColors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    textAlign: "right",
  },
  rows: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    color: lessonColors.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  value: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  best: {
    color: lessonColors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.84,
  },
});
