import type { ComponentType } from "react";
import { StyleSheet, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import type { LucideProps } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { AppCard, type CardTone } from "./AppCard";
import { AppText } from "./AppText";
import { IconBubble } from "./IconBubble";

type ActionCardProps = {
  title: string;
  subtitle: string;
  icon: ComponentType<LucideProps>;
  iconColor?: string;
  iconBackground?: string;
  buttonLabel?: string;
  tone?: CardTone;
  onPress: () => void;
};

export function ActionCard({
  title,
  subtitle,
  icon,
  iconColor = colors.primary,
  iconBackground = colors.primarySoft,
  buttonLabel = "Start",
  tone = "default",
  onPress,
}: ActionCardProps) {
  return (
    <AppCard tone={tone} padding="lg" onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <IconBubble icon={icon} color={iconColor} backgroundColor={iconBackground} size={56} />
        <View style={styles.copy}>
          <AppText variant="h3">{title}</AppText>
          <AppText variant="small" color={colors.muted}>
            {subtitle}
          </AppText>
        </View>
        <View style={styles.right}>
          <View style={styles.pill}>
            <AppText variant="label" color={colors.primaryDark}>
              {buttonLabel}
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
