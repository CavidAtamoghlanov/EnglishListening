import { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import { Animated, Platform, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  fixedFooter?: ReactNode;
  fixedFooterHeight?: number;
  maxWidth?: number;
}>;

export function Screen({
  children,
  scroll = true,
  contentStyle,
  fixedFooter,
  fixedFooterHeight = 96,
  maxWidth = 1060,
}: ScreenProps) {
  const [opacity] = useState(() => new Animated.Value(Platform.OS === "web" ? 1 : 0));
  const [translateY] = useState(() => new Animated.Value(Platform.OS === "web" ? 0 : 8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, [opacity, translateY]);

  const content = (
    <Animated.View
      style={[
        styles.content,
        { maxWidth, opacity, transform: [{ translateY }] },
        contentStyle,
      ]}
    >
      {children}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            fixedFooter ? { paddingBottom: fixedFooterHeight } : null,
          ]}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {fixedFooter ? (
        <View style={styles.fixedFooter} pointerEvents="box-none">
          <View style={[styles.fixedFooterInner, { maxWidth }]}>{fixedFooter}</View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: "100%",
    alignSelf: "center",
    padding: spacing.xl2,
    gap: spacing.lg,
  },
  fixedFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: "rgba(6,17,31,0.92)",
  },
  fixedFooterInner: {
    width: "100%",
    alignSelf: "center",
  },
});
