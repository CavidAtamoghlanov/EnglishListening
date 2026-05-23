import { StyleSheet, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import type { SentenceModeConfig } from "../config/modes";
import { AppText } from "../../../components/common/AppText";
import { AppCard } from "../../../components/common/AppCard";
import { IconBubble } from "../../../components/common/IconBubble";
import { colors } from "../../../theme/colors";
import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";

type SentenceModeCardProps = {
  config: SentenceModeConfig;
  onStart: () => void;
};

export function SentenceModeCard({ config, onStart }: SentenceModeCardProps) {
  const Icon = config.icon;

  return (
    <AppCard padding="lg" onPress={onStart} style={styles.card}>
      <View style={styles.row}>
        <IconBubble icon={Icon} color={config.iconColor} backgroundColor={colors.primarySoft} size={56} />
        <View style={styles.copy}>
          <AppText variant="h3">{config.title}</AppText>
          <AppText variant="small" color={colors.muted}>
            {config.subtitle}
          </AppText>
        </View>
        <View style={styles.right}>
          <View style={styles.pill}>
            <AppText variant="label" color={colors.primaryDark}>
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
    flexBasis: 280,
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
    gap: spacing.xs,
    minWidth: 0,
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
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
