import { StyleSheet, View } from "react-native";
import { StatPill } from "../stats/StatPill";
import { spacing } from "../../theme/spacing";

type PracticeStatsRowProps = {
  attempts: number;
  correct: number;
  wrong: number;
  streak: number;
  best: number;
};

export function PracticeStatsRow({
  attempts,
  correct,
  wrong,
  streak,
  best,
}: PracticeStatsRowProps) {
  return (
    <View style={styles.grid}>
      <StatPill label="Attempts" value={attempts} tone="blue" />
      <StatPill label="Correct" value={correct} tone="green" />
      <StatPill label="Wrong" value={wrong} tone="red" />
      <StatPill label="Streak" value={streak} tone="orange" />
      <StatPill label="Best" value={best} tone="violet" />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
