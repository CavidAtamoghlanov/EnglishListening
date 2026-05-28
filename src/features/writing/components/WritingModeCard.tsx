import { StyleSheet, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import type { WritingModeConfig } from "../config/modes";
import { AppCard } from "../../../components/common/AppCard";
import { AppText } from "../../../components/common/AppText";
import { IconBubble } from "../../../components/common/IconBubble";
import { colors } from "../../../theme/colors";
import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";

type WritingModeCardProps = {
  config: WritingModeConfig;
  onStart: () => void;
};

export function WritingModeCard({ config, onStart }: WritingModeCardProps) {
  const Icon = config.icon;

  return (
    <AppCard padding="lg" onPress={onStart} style={styles.card}>
      <View style={styles.row}>
        <IconBubble icon={Icon} color={config.iconColor} backgroundColor={colors.surfaceAlt} size={56} />
        <View style={styles.copy}>
          <AppText variant="h3">{config.title}</AppText>
          <AppText variant="small" color={colors.muted}>
            {config.subtitle}
          </AppText>
        </View>
        <View style={styles.right}>
          <View style={styles.pill}>
            <AppText variant="label" color={colors.background}>
              Start
            </AppText>
          </View>
          <ChevronRight color={colors.muted} size={20} />
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexBasis: 300,
    minWidth: 280,
    minHeight: 104,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  pill: {
    minHeight: 34,
    borderRadius: radii.round,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
});
