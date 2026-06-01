import { PropsWithChildren, ReactNode, useEffect, useMemo } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { ArrowUp, CheckCircle2, XCircle } from "lucide-react-native";
import { AppText } from "../common/AppText";
import { lessonColors, lessonGlow } from "./lessonTheme";

export type LessonCardTone = "neutral" | "correct" | "wrong";

type LessonCardProps = PropsWithChildren<{
  itemKey: string;
  prompt: string;
  eyebrow: string;
  icon?: string;
  tone: LessonCardTone;
  hintText?: string | null;
  topRight?: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  onSkip?: () => void;
  skipTitle?: string;
  skipSubtitle?: string;
  feedbackMessage?: string | null;
  displayedAnswer?: string | null;
  answerLabel?: string | null;
}>;

export function LessonCard({
  itemKey,
  prompt,
  eyebrow,
  icon,
  tone,
  hintText,
  topRight,
  onPress,
  onLongPress,
  onSkip,
  skipTitle = "Yuxarı sürüşdür",
  skipSubtitle = "Sona at",
  feedbackMessage,
  displayedAnswer,
  answerLabel,
  children,
}: LessonCardProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const enterOpacity = useMemo(() => new Animated.Value(1), []);
  const enterY = useMemo(() => new Animated.Value(0), []);
  const scale = useMemo(() => new Animated.Value(1), []);
  const shakeX = useMemo(() => new Animated.Value(0), []);
  const panY = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    enterOpacity.setValue(0);
    enterY.setValue(20);
    Animated.parallel([
      Animated.timing(enterOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(enterY, {
        toValue: 0,
        friction: 8,
        tension: 120,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }, [enterOpacity, enterY, itemKey]);

  useEffect(() => {
    if (tone === "correct") {
      scale.setValue(0.97);
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 170,
        useNativeDriver: Platform.OS !== "web",
      }).start();
      return;
    }

    if (tone === "wrong") {
      Animated.sequence([
        Animated.timing(shakeX, {
          toValue: -8,
          duration: 55,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(shakeX, {
          toValue: 8,
          duration: 70,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(shakeX, {
          toValue: 0,
          duration: 55,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]).start();
    }
  }, [scale, shakeX, tone]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Boolean(onSkip) && Math.abs(gesture.dy) > 16 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          if (gesture.dy < 0) {
            panY.setValue(Math.max(gesture.dy, -110));
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (onSkip && gesture.dy < -58) {
            Animated.timing(panY, {
              toValue: -92,
              duration: 130,
              useNativeDriver: Platform.OS !== "web",
            }).start(() => {
              panY.setValue(0);
              onSkip();
            });
            return;
          }

          Animated.spring(panY, {
            toValue: 0,
            friction: 7,
            tension: 120,
            useNativeDriver: Platform.OS !== "web",
          }).start();
        },
      }),
    [onSkip, panY],
  );

  const borderColor =
    tone === "correct" ? lessonColors.success : tone === "wrong" ? lessonColors.red : lessonColors.yellow;
  const glow = tone === "correct" ? lessonGlow.correct : tone === "wrong" ? lessonGlow.wrong : lessonGlow.neutral;
  const StatusIcon = tone === "correct" ? CheckCircle2 : tone === "wrong" ? XCircle : null;

  return (
    <View style={styles.outer}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          isMobile ? styles.cardMobile : styles.cardWide,
          glow,
          {
            borderColor,
            opacity: enterOpacity,
            transform: [
              { translateY: Animated.add(enterY, panY) },
              { translateX: shakeX },
              { scale },
            ],
          },
        ]}
      >
        <View style={styles.topRow}>
          <View style={styles.iconBox}>
            <AppText style={styles.iconText}>{icon ?? "•"}</AppText>
          </View>
          <AppText variant="small" style={styles.eyebrow} numberOfLines={2}>
            {eyebrow}
          </AppText>
          <View style={styles.topRight}>{topRight}</View>
        </View>

        <Pressable
          accessibilityRole={onPress ? "button" : undefined}
          onPress={onPress}
          onLongPress={onLongPress}
          style={({ pressed }) => [styles.promptArea, pressed && onPress && styles.promptPressed]}
        >
          <AppText
            style={[styles.prompt, !isMobile && styles.promptWide]}
            numberOfLines={isMobile ? 4 : 5}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
          >
            {prompt}
          </AppText>
        </Pressable>

        {children}

        {hintText ? (
          <View style={styles.hintBox}>
            <AppText style={styles.hintText}>{hintText}</AppText>
          </View>
        ) : null}

        {(feedbackMessage || displayedAnswer) && tone !== "neutral" ? (
          <View style={styles.cardFeedback}>
            {StatusIcon ? (
              <StatusIcon
                size={30}
                color={tone === "correct" ? lessonColors.success : lessonColors.red}
                strokeWidth={2.8}
              />
            ) : null}
            {displayedAnswer && answerLabel ? (
              <AppText style={styles.cardAnswer} numberOfLines={2}>
                {answerLabel}: {displayedAnswer}
              </AppText>
            ) : null}
            {feedbackMessage ? (
              <AppText
                style={[
                  styles.cardFeedbackText,
                  tone === "correct" && styles.cardFeedbackCorrect,
                  tone === "wrong" && styles.cardFeedbackWrong,
                ]}
              >
                {feedbackMessage}
              </AppText>
            ) : null}
          </View>
        ) : null}
      </Animated.View>

      <View style={styles.swipeHint}>
        <View style={styles.arrowCircle}>
          <ArrowUp color={lessonColors.text} size={18} strokeWidth={2.8} />
        </View>
        <AppText style={styles.swipeTitle}>{skipTitle}</AppText>
        <AppText style={styles.swipeSubtitle}>{skipSubtitle}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  card: {
    width: "100%",
    maxWidth: 620,
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 3,
    borderRadius: 34,
    backgroundColor: lessonColors.card,
  },
  cardMobile: {
    minHeight: 192,
    borderRadius: 28,
  },
  cardWide: {
    width: "100%",
    minHeight: 350,
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderRadius: 38,
  },
  topRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: lessonColors.border,
  },
  iconText: {
    color: lessonColors.text,
    fontSize: 21,
    lineHeight: 26,
  },
  eyebrow: {
    flex: 1,
    minWidth: 0,
    color: lessonColors.muted,
    textAlign: "center",
    textTransform: "uppercase",
    fontWeight: "900",
  },
  topRight: {
    width: 44,
    alignItems: "flex-end",
  },
  promptArea: {
    flex: 1,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  promptPressed: {
    opacity: 0.86,
  },
  prompt: {
    color: lessonColors.yellowButton,
    textAlign: "center",
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "900",
  },
  promptWide: {
    fontSize: 42,
    lineHeight: 52,
  },
  hintBox: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(250,204,21,0.10)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.22)",
  },
  hintText: {
    color: lessonColors.text,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  cardFeedback: {
    alignItems: "center",
    gap: 6,
  },
  cardAnswer: {
    color: lessonColors.muted,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },
  cardFeedbackText: {
    color: lessonColors.text,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  cardFeedbackCorrect: {
    color: lessonColors.success,
  },
  cardFeedbackWrong: {
    color: lessonColors.red,
  },
  swipeHint: {
    alignItems: "center",
    gap: 2,
  },
  arrowCircle: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  swipeTitle: {
    color: lessonColors.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  swipeSubtitle: {
    color: lessonColors.muted,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
  },
});
