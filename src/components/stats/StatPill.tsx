import { StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { AppText } from "../common/AppText";

type StatTone = "default" | "blue" | "green" | "red" | "orange" | "violet";

type StatPillProps = {
  label: string;
  value: string | number;
  tone?: StatTone;
};

const toneStyles: Record<StatTone, { bg: string; border: string; value: string }> = {
  default: { bg: colors.surfaceRaised, border: colors.border, value: colors.ink },
  blue: { bg: colors.primarySoft, border: colors.primaryTint, value: colors.primaryDark },
  green: { bg: colors.successSoft, border: "#C8EBD8", value: colors.success },
  red: { bg: colors.dangerSoft, border: "#F5D0CE", value: colors.danger },
  orange: { bg: colors.warningSoft, border: "#F5E2C0", value: colors.warning },
  violet: { bg: colors.violetSoft, border: "#E2DAFF", value: colors.violet },
};

export function StatPill({ label, value, tone = "default" }: StatPillProps) {
  const palette = toneStyles[tone];

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <AppText variant="small" color={colors.muted}>
        {label}
      </AppText>
      <AppText variant="h3" color={palette.value}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    minWidth: 92,
    flexGrow: 1,
    flexBasis: "30%",
    maxWidth: "100%",
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    gap: spacing.xs,
    alignItems: "center",
  },
});
