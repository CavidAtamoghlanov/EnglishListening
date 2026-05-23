import { Pressable, StyleSheet, View } from "react-native";
import { Volume2 } from "lucide-react-native";
import { AppText } from "../../../components/common/AppText";
import { AppCard } from "../../../components/common/AppCard";
import { IconBubble } from "../../../components/common/IconBubble";
import type { SentenceItem } from "../types";
import { colors } from "../../../theme/colors";
import { radii } from "../../../theme/radii";
import { spacing } from "../../../theme/spacing";

type PreviousSentenceCardProps = {
  sentence: SentenceItem | null;
  onReplay: (english: string) => void;
};

export function PreviousSentenceCard({ sentence, onReplay }: PreviousSentenceCardProps) {
  return (
    <AppCard padding="md" elevated={false} style={styles.card}>
      <AppText variant="label" color={colors.muted} style={styles.title}>
        Previous sentence
      </AppText>

      {!sentence ? (
        <AppText color={colors.muted} style={styles.empty}>
          No previous sentence yet
        </AppText>
      ) : (
        <View style={styles.body}>
          <View style={styles.header}>
            <IconBubble emoji={sentence.icon} size={40} backgroundColor={colors.mint} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Replay English sentence"
              onPress={() => onReplay(sentence.english)}
              style={({ pressed }) => [styles.replayButton, pressed && styles.replayPressed]}
            >
              <Volume2 color={colors.primaryDark} size={20} />
            </Pressable>
          </View>
          <AppText variant="body" style={styles.english}>
            {sentence.english}
          </AppText>
          <AppText color={colors.muted}>{sentence.azeri}</AppText>
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
  },
  english: {
    color: colors.ink,
    fontWeight: "600",
    lineHeight: 24,
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
