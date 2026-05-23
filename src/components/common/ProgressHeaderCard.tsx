import { StyleSheet, View } from "react-native";
import { AppCard } from "./AppCard";
import { AppText } from "./AppText";
import { ProgressBar } from "../stats/ProgressBar";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type ProgressHeaderCardProps = {
  percent: number;
  label?: string;
};

export function ProgressHeaderCard({ percent, label = "Progress" }: ProgressHeaderCardProps) {
  return (
    <AppCard padding="md" elevated={false} style={styles.card}>
      <View style={styles.meta}>
        <AppText variant="label" color={colors.muted}>
          {label}
        </AppText>
        <AppText variant="label" color={colors.success}>
          {Math.round(percent)}%
        </AppText>
      </View>
      <ProgressBar percent={percent} height={10} color={colors.success} trackColor={colors.surfaceAlt} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
