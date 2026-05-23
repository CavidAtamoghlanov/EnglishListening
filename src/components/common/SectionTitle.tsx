import { StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { AppText } from "./AppText";

type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <View style={styles.wrap}>
      <AppText variant="h2">{title}</AppText>
      {subtitle ? <AppText color={colors.muted}>{subtitle}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
});
