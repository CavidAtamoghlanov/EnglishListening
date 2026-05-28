import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../../../components/common/AppText";
import { lessonColors } from "../../../components/lesson/lessonTheme";
import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";
import type { WritingHint } from "../types";

type WritingHintChipsProps = {
  displayText: string;
  hints: WritingHint[];
};

function cleanToken(token: string): string {
  return token.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

function findHint(token: string, hints: WritingHint[]): WritingHint | null {
  const normalized = cleanToken(token);
  return (
    hints.find((hint) => {
      const hintText = cleanToken(hint.text);
      return normalized === hintText || normalized.includes(hintText) || hintText.includes(normalized);
    }) ?? null
  );
}

function getHintText(hint: WritingHint): string {
  return hint.correction ?? hint.translation ?? hint.note ?? hint.text;
}

export function WritingHintChips({ displayText, hints }: WritingHintChipsProps) {
  const tokens = useMemo(() => displayText.trim().split(/\s+/).filter(Boolean), [displayText]);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  if (tokens.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.chips}>
        {tokens.map((token, index) => {
          const hint = findHint(token, hints);
          return (
            <Pressable
              key={`${token}-${index}`}
              accessibilityRole={hint ? "button" : undefined}
              onPress={() => {
                if (!hint) {
                  return;
                }
                const label = getHintText(hint);
                setActiveHint(activeHint === label ? null : label);
              }}
              style={({ pressed }) => [
                styles.chip,
                hint && styles.chipHasHint,
                pressed && hint && styles.chipPressed,
              ]}
            >
              <AppText style={styles.chipText}>{token}</AppText>
            </Pressable>
          );
        })}
      </View>
      {activeHint ? (
        <View style={styles.hintBox}>
          <AppText style={styles.hintText}>{activeHint}</AppText>
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
  chipHasHint: {
    borderColor: "rgba(250,204,21,0.32)",
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    color: lessonColors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
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
    color: lessonColors.text,
    textAlign: "center",
    fontWeight: "700",
  },
});
