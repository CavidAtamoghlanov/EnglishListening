import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../../../components/common/AppText";
import type { SentenceWordHint } from "../types";
import { colors } from "../../../theme/colors";
import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";

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
          <AppText color={colors.primaryDark}>{activeHint}</AppText>
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
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipMatched: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    fontSize: 22,
    lineHeight: 28,
    color: colors.ink,
    fontWeight: "600",
  },
  chipTextMatched: {
    color: colors.success,
  },
  hintBox: {
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: "100%",
  },
});
