import { ComponentType } from "react";
import { StyleSheet, View } from "react-native";
import type { LucideProps } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { AppText } from "./AppText";
import { IconBubble } from "./IconBubble";
import { ProgressBar } from "./ProgressBar";

type StatCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  icon?: ComponentType<LucideProps>;
  iconColor?: string;
  iconBackground?: string;
  progress?: number;
};

export function StatCard({
  label,
  value,
  detail,
  icon,
  iconColor = colors.primary,
  iconBackground = colors.primarySoft,
  progress,
}: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <AppText variant="label" color={colors.muted}>
            {label}
          </AppText>
          <AppText variant="h2">{value}</AppText>
        </View>
        {icon ? (
          <IconBubble icon={icon} color={iconColor} backgroundColor={iconBackground} size={44} iconSize={20} />
        ) : null}
      </View>
      {typeof progress === "number" ? <ProgressBar percent={progress} height={8} /> : null}
      {detail ? <AppText variant="small" color={colors.muted}>{detail}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 180,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
});
