import { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { useResponsive } from "../../utils/useResponsive";

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
  const { isMobile } = useResponsive();
  const insets = useSafeAreaInsets();
  const [opacity] = useState(() => new Animated.Value(Platform.OS === "web" ? 1 : 0));
  const [translateY] = useState(() => new Animated.Value(Platform.OS === "web" ? 0 : 8));
  const resolvedBottomPadding =
    (fixedFooter ? fixedFooterHeight : spacing.xl2) + Math.max(insets.bottom, spacing.md);

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
        isMobile && styles.contentMobile,
        { maxWidth, opacity, transform: [{ translateY }] },
        contentStyle,
      ]}
    >
      {children}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: resolvedBottomPadding },
            ]}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
      {fixedFooter ? (
        <View
          style={[
            styles.fixedFooter,
            {
              paddingBottom: Math.max(insets.bottom, spacing.sm),
            },
          ]}
          pointerEvents="box-none"
        >
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
  keyboardAvoiding: {
    flex: 1,
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
  contentMobile: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  fixedFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: "rgba(6,17,31,0.92)",
  },
  fixedFooterInner: {
    width: "100%",
    alignSelf: "center",
  },
});
