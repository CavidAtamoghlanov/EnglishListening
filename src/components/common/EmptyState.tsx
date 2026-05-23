import { StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { AppText } from "./AppText";

type EmptyStateProps = {
  icon: string;
  title: string;
  message: string;
};

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <AppText style={styles.icon}>{icon}</AppText>
      <AppText variant="h2" style={styles.center}>
        {title}
      </AppText>
      <AppText color={colors.muted} style={styles.center}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 54,
  },
  center: {
    textAlign: "center",
  },
});
