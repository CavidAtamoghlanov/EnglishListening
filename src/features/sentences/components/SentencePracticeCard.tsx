import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "../../../components/common/AppText";
import { AppCard } from "../../../components/common/AppCard";
import { IconBubble } from "../../../components/common/IconBubble";
import type { SentenceItem, SentencePracticeMode } from "../types";
import { SentenceActionRow } from "./SentenceActionRow";
import { SentenceWordChips } from "./SentenceWordChips";
import { getMatchedWordIndices } from "../utils/sentenceAnswer";
import { colors } from "../../../theme/colors";
import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";

type SentencePracticeCardProps = {
  mode: SentencePracticeMode;
  sentence: SentenceItem;
  recognizedOrSubmittedAnswer: string;
  onReplay: () => void;
  onMicPress: () => void;
  isListening: boolean;
  inputsDisabled?: boolean;
};

export function SentencePracticeCard({
  mode,
  sentence,
  recognizedOrSubmittedAnswer,
  onReplay,
  onMicPress,
  isListening,
  inputsDisabled = false,
}: SentencePracticeCardProps) {
  const [showFullTranslation, setShowFullTranslation] = useState(false);
  const isRepeat = mode === "repeat";
  const displayText = isRepeat ? sentence.english : sentence.azeri;
  const matchedIndices = useMemo(
    () =>
      isRepeat
        ? getMatchedWordIndices(sentence.english, recognizedOrSubmittedAnswer)
        : new Set<number>(),
    [isRepeat, recognizedOrSubmittedAnswer, sentence.english],
  );

  return (
    <AppCard style={styles.card} padding="lg">
      <View style={styles.top}>
        <IconBubble emoji={sentence.icon} size={64} backgroundColor={colors.mint} />
        <AppText variant="label" color={colors.muted} style={styles.instruction}>
          {isRepeat ? "Say this sentence in English" : "Say the English translation"}
        </AppText>
      </View>

      <View style={styles.sentenceRow}>
        <AppText variant="title" style={styles.sentenceTitle}>
          {isRepeat ? sentence.english : sentence.azeri}
        </AppText>
      </View>

      <SentenceWordChips
        displayText={displayText}
        hints={sentence.words}
        matchedIndices={matchedIndices}
      />

      <AppText variant="small" color={colors.teal} style={styles.chipHint}>
        Tap any word to see its meaning
      </AppText>

      <SentenceActionRow
        mode={mode}
        showFullTranslation={showFullTranslation}
        onToggleTranslation={() => setShowFullTranslation((value) => !value)}
        onReplay={onReplay}
        onMicPress={onMicPress}
        isListening={isListening}
        disabled={inputsDisabled}
      />

      {showFullTranslation ? (
        <View style={styles.fullTranslation}>
          <View style={styles.translationHeader}>
            <AppText variant="label" color={colors.muted}>
              {isRepeat ? "Translation" : "English"}
            </AppText>
          </View>
          <AppText style={styles.translationText}>
            {isRepeat ? sentence.azeri : sentence.english}
          </AppText>
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    gap: spacing.md,
    width: "100%",
  },
  top: {
    alignItems: "center",
    gap: spacing.xs,
  },
  instruction: {
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sentenceRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  sentenceTitle: {
    textAlign: "center",
    fontSize: 26,
    lineHeight: 34,
    color: colors.ink,
    flexShrink: 1,
  },
  chipHint: {
    textAlign: "center",
  },
  fullTranslation: {
    width: "100%",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: "#C8EBD8",
  },
  translationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  translationText: {
    color: colors.ink,
    lineHeight: 24,
    textAlign: "center",
    fontWeight: "500",
  },
});
