import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { AppNavigation } from "../common/AppNavigation";
import { Screen } from "./Screen";
import { spacing } from "../../theme/spacing";
import { useResponsive } from "../../utils/useResponsive";

type AppScaffoldProps = PropsWithChildren<{
  maxWidth?: number;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function AppScaffold({ children, maxWidth = 1240, contentStyle }: AppScaffoldProps) {
  const { isMobile } = useResponsive();

  return (
    <Screen
      maxWidth={maxWidth}
      contentStyle={[styles.screen, contentStyle]}
      fixedFooter={isMobile ? <AppNavigation variant="bottom" /> : undefined}
      fixedFooterHeight={100}
    >
      <View style={[styles.shell, !isMobile && styles.shellWide]}>
        {!isMobile ? <AppNavigation variant="sidebar" /> : null}
        <View style={styles.main}>
          {children}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  shell: {
    width: "100%",
    gap: spacing.lg,
  },
  shellWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  main: {
    flex: 1,
    minWidth: 0,
    gap: spacing.lg,
  },
});
