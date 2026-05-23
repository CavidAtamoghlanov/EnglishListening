import { Pressable, StyleSheet, View } from "react-native";
import { Volume2 } from "lucide-react-native";
import { AppText } from "../../../components/common/AppText";
import { AppCard } from "../../../components/common/AppCard";
import { IconBubble } from "../../../components/common/IconBubble";
import type { WordItem } from "../types";
import { colors } from "../../../theme/colors";
import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";

type PreviousWordCardProps = {
  word: WordItem | null;
  onReplay: (english: string) => void;
};

export function PreviousWordCard({ word, onReplay }: PreviousWordCardProps) {
  return (
    <AppCard padding="md" elevated={false} style={styles.card}>
      <AppText variant="label" color={colors.muted} style={styles.title}>
        Previous word
      </AppText>

      {!word ? (
        <AppText color={colors.muted} style={styles.empty}>
          No previous word yet
        </AppText>
      ) : (
        <View style={styles.body}>
          <View style={styles.header}>
            <IconBubble emoji={word.icon} size={44} backgroundColor={colors.mint} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Replay ${word.english}`}
              onPress={() => onReplay(word.english)}
              style={({ pressed }) => [styles.replayButton, pressed && styles.replayPressed]}
            >
              <Volume2 color={colors.primaryDark} size={20} />
            </Pressable>
          </View>
          <AppText variant="body" style={styles.azeri}>
            {word.azeri}
          </AppText>
          <AppText variant="h3" color={colors.primaryDark}>
            {word.english}
          </AppText>
        </View>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    minWidth: 0,
  },
  title: {
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  empty: {
    fontStyle: "italic",
    lineHeight: 22,
  },
  body: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  azeri: {
    color: colors.ink,
    lineHeight: 22,
  },
  replayButton: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  replayPressed: {
    opacity: 0.85,
  },
});
