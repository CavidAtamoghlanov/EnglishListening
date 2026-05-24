import { ComponentType, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { ArrowLeft, type LucideProps } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { AppText } from "./AppText";
import { IconButton } from "./IconButton";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: ComponentType<LucideProps>;
  emoji?: string;
  onBack?: () => void;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, onBack, actions }: PageHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {onBack ? (
          <IconButton
            icon={ArrowLeft}
            onPress={onBack}
            accessibilityLabel="Go back"
            color={colors.text}
            backgroundColor={colors.surfaceRaised}
            size={44}
            iconSize={20}
          />
        ) : (
          <View style={styles.sideSlot} />
        )}

        <View style={styles.copy}>
          <AppText variant="h2" style={styles.title}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="small" color={colors.muted} numberOfLines={2}>
              {subtitle}
            </AppText>
          ) : null}
        </View>

        <View style={styles.sideSlot}>{actions ?? null}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  sideSlot: {
    minWidth: 44,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
    paddingTop: 2,
  },
  title: {
    color: colors.text,
  },
});
