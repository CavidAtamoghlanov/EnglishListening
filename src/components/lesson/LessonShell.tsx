import { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../common/AppText";
import { LessonBottomNav } from "./LessonBottomNav";
import { lessonColors } from "./lessonTheme";

type LessonShellProps = PropsWithChildren<{
  topBar: ReactNode;
  sectionTitle: string;
  primaryNavLabel: string;
  previousPanel: ReactNode;
  statsPanel: ReactNode;
}>;

export function LessonShell({
  topBar,
  sectionTitle,
  primaryNavLabel,
  previousPanel,
  statsPanel,
  children,
}: LessonShellProps) {
  const { width } = useWindowDimensions();
  const isTabletOrWide = width >= 768;
  const isDesktop = width >= 1024;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isTabletOrWide && styles.scrollContentWide,
        ]}
      >
        <View style={[styles.container, isDesktop && styles.containerDesktop]}>
          {isTabletOrWide ? (
            <View style={styles.rail}>
              <LessonBottomNav primaryLabel={primaryNavLabel} vertical />
            </View>
          ) : null}

          <View style={styles.main}>
            {topBar}
            <AppText style={[styles.sectionTitle, isTabletOrWide && styles.sectionTitleWide]}>
              {sectionTitle}
            </AppText>
            <View style={[styles.contentRow, isTabletOrWide && styles.contentRowWide]}>
              <View style={styles.lessonColumn}>{children}</View>
              {isTabletOrWide ? (
                <View style={styles.sideColumn}>
                  {previousPanel}
                  {statsPanel}
                </View>
              ) : null}
            </View>
            {!isTabletOrWide ? (
              <View style={styles.mobilePanels}>
                {previousPanel}
                {statsPanel}
                <LessonBottomNav primaryLabel={primaryNavLabel} />
              </View>
            ) : null}
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: lessonColors.background,
  },
  scrollContentWide: {
    paddingHorizontal: 24,
    paddingVertical: 22,
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
  },
  sectionTitleWide: {
    textAlign: "center",
  },
  contentRow: {
    width: "100%",
    gap: 14,
  },
  contentRowWide: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 26,
  },
  lessonColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 12,
  },
  sideColumn: {
    width: 300,
    flexShrink: 0,
    gap: 18,
  },
  mobilePanels: {
    gap: 12,
  },
});
