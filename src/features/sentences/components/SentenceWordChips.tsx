import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../../../components/common/AppText";
import type { SentenceWordHint } from "../types";
import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";
import { lessonColors } from "../../../components/lesson/lessonTheme";

type SentenceWordChipsProps = {
  displayText: string;
  hints: SentenceWordHint[];
  matchedIndices?: Set<number>;
  hintShowsTranslation?: boolean;
};

function findHintForToken(token: string, hints: SentenceWordHint[]): SentenceWordHint | null {
  const normalized = token.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  return (
    hints.find((hint) => {
      const hintText = hint.text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
      return normalized === hintText || normalized.includes(hintText) || hintText.includes(normalized);
    }) ?? null
  );
}

export function SentenceWordChips({
  displayText,
  hints,
  matchedIndices = new Set(),
  hintShowsTranslation,
}: SentenceWordChipsProps) {
  const tokens = useMemo(() => displayText.trim().split(/\s+/), [displayText]);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  return (
    <View style={styles.wrap}>
      <View style={styles.chips}>
        {tokens.map((token, index) => {
          const hint = findHintForToken(token, hints);
          const matched = matchedIndices.has(index);
          return (
            <Pressable
              key={`${token}-${index}`}
              accessibilityRole="button"
              onPress={() => {
                if (hint) {
                  const label = hint.translation;
                  setActiveHint(activeHint === label ? null : label);
                }
              }}
              style={({ pressed }) => [
                styles.chip,
                matched && styles.chipMatched,
                pressed && styles.chipPressed,
              ]}
            >
              <AppText style={[styles.chipText, matched && styles.chipTextMatched]}>{token}</AppText>
            </Pressable>
          );
        })}
      </View>
      {activeHint ? (
        <View style={styles.hintBox}>
          <AppText color={lessonColors.text} style={styles.hintText}>
            {activeHint}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    gap: spacing.sm,
    alignItems: "center",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: lessonColors.border,
  },
  chipMatched: {
    backgroundColor: "rgba(103,213,59,0.14)",
    borderColor: lessonColors.success,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    fontSize: 18,
    lineHeight: 24,
    color: lessonColors.text,
    fontWeight: "800",
  },
  chipTextMatched: {
    color: lessonColors.success,
  },
  hintBox: {
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: "rgba(250,204,21,0.10)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.22)",
    maxWidth: "100%",
  },
  hintText: {
    textAlign: "center",
    fontWeight: "700",
  },
});
