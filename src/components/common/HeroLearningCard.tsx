import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, BookOpen, Mic, Sparkles } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { gradients } from "../../theme/gradients";
import { radii } from "../../theme/radii";
import { shadows } from "../../theme/shadows";
import { spacing } from "../../theme/spacing";
import { AppButton } from "./AppButton";
import { AppText } from "./AppText";
import { IconBubble } from "./IconBubble";
import { ProgressBar } from "./ProgressBar";

type HeroLearningCardProps = {
  levelLabel: string;
  wordLabel: string;
  progressPercent: number;
  onContinue: () => void;
};

export function HeroLearningCard({
  levelLabel,
  wordLabel,
  progressPercent,
  onContinue,
}: HeroLearningCardProps) {
  return (
    <LinearGradient colors={gradients.hero} start={[0, 0]} end={[1, 1]} style={styles.hero}>
      <View style={styles.copy}>
        <AppText variant="label" color="rgba(255,255,255,0.78)">
          Continue learning
        </AppText>
        <AppText variant="h1" color={colors.white}>
          {levelLabel}
        </AppText>
        <AppText color="rgba(255,255,255,0.82)">{wordLabel}</AppText>
        <ProgressBar
          percent={progressPercent}
          height={9}
          color={colors.progress}
          trackColor="rgba(255,255,255,0.14)"
        />
        <AppButton
          variant="primary"
          icon={ArrowRight}
          onPress={onContinue}
          style={styles.button}
        >
          Continue
        </AppButton>
      </View>
      <View style={styles.visual}>
        <View style={[styles.floatBubble, styles.floatOne]}>
          <Mic color={colors.white} size={28} />
        </View>
        <View style={[styles.floatBubble, styles.floatTwo]}>
          <BookOpen color={colors.white} size={24} />
        </View>
        <IconBubble
          icon={Sparkles}
          color={colors.white}
          backgroundColor="rgba(255,255,255,0.18)"
          size={86}
          iconSize={36}
          style={styles.mainBubble}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 218,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    flexDirection: "row",
    overflow: "hidden",
    gap: spacing.lg,
    ...shadows.card,
  },
  copy: {
    flex: 1,
    minWidth: 210,
    gap: spacing.md,
    justifyContent: "center",
  },
  button: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  visual: {
    width: 128,
    minHeight: 156,
    alignItems: "center",
    justifyContent: "center",
  },
  mainBubble: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.32)",
  },
  floatBubble: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
  },
  floatOne: {
    top: 8,
    right: 4,
  },
  floatTwo: {
    bottom: 12,
    left: 0,
  },
});
