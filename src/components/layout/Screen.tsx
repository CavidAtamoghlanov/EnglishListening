import { PropsWithChildren, useEffect, useState } from "react";
import { Animated, Platform, ScrollView, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: ViewStyle;
  maxWidth?: number;
}>;

export function Screen({ children, scroll = true, contentStyle, maxWidth = 1060 }: ScreenProps) {
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
        <ScrollView contentContainerStyle={styles.scrollContent}>{content}</ScrollView>
      ) : (
        content
      )}
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
  },
  content: {
    width: "100%",
    alignSelf: "center",
    padding: spacing.xl2,
    gap: spacing.lg,
  },
});
