import { PropsWithChildren, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AppNavigation } from "../common/AppNavigation";
import { AppText } from "../common/AppText";
import { spacing } from "../../theme/spacing";
import { useResponsive } from "../../utils/useResponsive";
import { lessonColors } from "./lessonTheme";

type LessonResponsiveShellProps = PropsWithChildren<{
  topBar: ReactNode;
  sectionTitle: string;
  previousPanel: ReactNode;
  statsPanel: ReactNode;
}>;

export function LessonResponsiveShell({
  topBar,
  sectionTitle,
  previousPanel,
  statsPanel,
  children,
}: LessonResponsiveShellProps) {
  const { isMobile, isDesktop } = useResponsive();
  const insets = useSafeAreaInsets();

  if (isMobile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.mobileHeader}>
            {topBar}
            <AppText style={styles.mobileSectionTitle}>{sectionTitle}</AppText>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            contentContainerStyle={[
              styles.mobileScrollContent,
              { paddingBottom: 112 + Math.max(insets.bottom, spacing.md) },
            ]}
          >
            <View style={styles.lessonColumn}>{children}</View>
            <View style={styles.mobilePanels}>
              {previousPanel}
              {statsPanel}
            </View>
          </ScrollView>

          <View
            style={[
              styles.fixedFooter,
              { paddingBottom: Math.max(insets.bottom, spacing.xs) },
            ]}
            pointerEvents="box-none"
          >
            <AppNavigation variant="bottom" />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        contentContainerStyle={styles.wideScrollContent}
      >
        <View style={[styles.container, isDesktop && styles.containerDesktop]}>
          <View style={styles.rail}>
            <AppNavigation variant="sidebar" />
          </View>

          <View style={styles.main}>
            {topBar}
            <AppText style={styles.sectionTitle}>{sectionTitle}</AppText>
            <View style={styles.contentRow}>
              <View style={styles.lessonColumn}>{children}</View>
              <View style={styles.sideColumn}>
                {previousPanel}
                {statsPanel}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: lessonColors.background,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  mobileHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
    backgroundColor: lessonColors.background,
  },
  mobileSectionTitle: {
    color: lessonColors.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  mobileScrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    gap: spacing.sm,
    backgroundColor: lessonColors.background,
  },
  wideScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 22,
    backgroundColor: lessonColors.background,
  },
  container: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    flexDirection: "row",
    gap: 18,
  },
  containerDesktop: {
    minHeight: 690,
  },
  rail: {
    flexShrink: 0,
  },
  main: {
    flex: 1,
    minWidth: 0,
    gap: 14,
  },
  sectionTitle: {
    color: lessonColors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  contentRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 26,
  },
  lessonColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: spacing.sm,
  },
  sideColumn: {
    width: 300,
    flexShrink: 0,
    gap: 18,
  },
  mobilePanels: {
    width: "100%",
    gap: spacing.sm,
  },
  fixedFooter: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.xs,
    paddingTop: spacing.xs,
    backgroundColor: "rgba(7,17,31,0.92)",
  },
});
