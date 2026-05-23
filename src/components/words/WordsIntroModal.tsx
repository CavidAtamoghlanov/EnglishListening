import { Modal, StyleSheet, View } from "react-native";
import { BookOpenCheck } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { AppText } from "../common/AppText";
import { AppButton } from "../common/AppButton";
import { AppCard } from "../common/AppCard";

type WordsIntroModalProps = {
  visible: boolean;
  onContinue: () => void;
};

const points = [
  "You will see Azerbaijani words and phrases.",
  "Say the English answer aloud.",
  "Tap once for a hint.",
  "Double tap for meaning, synonyms, and an example.",
  "Correct answers move forward. Wrong answers stay here for another try.",
  "Progress is saved automatically for this profile.",
];

export function WordsIntroModal({ visible, onContinue }: WordsIntroModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.backdrop}>
        <AppCard style={styles.modal} padding="lg">
          <View style={styles.iconWrap}>
            <BookOpenCheck color={colors.primary} size={34} />
          </View>
          <AppText variant="h2" style={styles.center}>
            Words Practice
          </AppText>
          <View style={styles.points}>
            {points.map((point) => (
              <View key={point} style={styles.pointRow}>
                <View style={styles.dot} />
                <AppText color={colors.muted} style={styles.pointText}>
                  {point}
                </AppText>
              </View>
            ))}
          </View>
          <AppButton onPress={onContinue} size="lg">Start practicing</AppButton>
        </AppCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modal: {
    width: "100%",
    maxWidth: 520,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    textAlign: "center",
  },
  points: {
    gap: spacing.sm,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.success,
    marginTop: 8,
  },
  pointText: {
    flex: 1,
  },
});
