import { StyleSheet, View } from "react-native";
import { Check, Flame, RotateCcw, X } from "lucide-react-native";
import { AppText } from "../common/AppText";
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
  const rows = [
    { label: "Düz", value: correct, icon: Check, color: lessonColors.success },
    { label: "Yanlış", value: wrong, icon: X, color: lessonColors.red },
    { label: "Qalan", value: remaining, icon: RotateCcw, color: lessonColors.blue },
    { label: "Seriya", value: streak, icon: Flame, color: lessonColors.yellowButton },
  ];

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <AppText style={styles.title}>Statistika</AppText>
        <AppText style={styles.subtle}>{attempts} cəhd</AppText>
      </View>
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
      <AppText style={styles.best}>Best streak: {best}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: "100%",
    padding: 16,
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
  title: {
    color: lessonColors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
  },
  subtle: {
    color: lessonColors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
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
});
