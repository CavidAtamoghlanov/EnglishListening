import type { ComponentType } from "react";
import { StyleSheet, View } from "react-native";
import { Lock } from "lucide-react-native";
import type { LucideProps } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { AppText } from "./AppText";
import { IconBubble } from "./IconBubble";

type ComingSoonRowProps = {
  title: string;
  subtitle: string;
  icon?: ComponentType<LucideProps>;
};

export function ComingSoonRow({ title, subtitle, icon = Lock }: ComingSoonRowProps) {
  return (
    <View style={styles.row}>
      <IconBubble
        icon={icon}
        color={colors.muted}
        backgroundColor={colors.surfaceAlt}
        size={44}
        iconSize={19}
      />
      <View style={styles.copy}>
        <AppText variant="h3" color={colors.textSoft}>
          {title}
        </AppText>
        <AppText variant="small" color={colors.muted}>
          {subtitle}
        </AppText>
      </View>
      <View style={styles.badge}>
        <AppText variant="label" color={colors.muted}>
          Coming soon
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    opacity: 0.82,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  badge: {
    borderRadius: radii.round,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
