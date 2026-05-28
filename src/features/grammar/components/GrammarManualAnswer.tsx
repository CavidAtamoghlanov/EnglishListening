import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Send } from "lucide-react-native";
import { AppText } from "../../../components/common/AppText";
import { lessonColors } from "../../../components/lesson/lessonTheme";

type GrammarManualAnswerProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
};

export function GrammarManualAnswer({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  disabled = false,
}: GrammarManualAnswerProps) {
  return (
    <View style={styles.panel}>
      <TextInput
        accessibilityLabel="Grammar answer"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={lessonColors.muted}
        autoCapitalize="sentences"
        editable={!disabled}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        style={styles.input}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Check answer"
        disabled={disabled}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.submit,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <Send color={lessonColors.background} size={18} strokeWidth={2.5} />
        <AppText style={styles.submitText}>Check</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: "100%",
    maxWidth: 560,
    gap: 10,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "rgba(12,23,38,0.94)",
    borderWidth: 1,
    borderColor: lessonColors.border,
  },
  input: {
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    color: lessonColors.text,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: lessonColors.borderStrong,
    fontSize: 16,
    fontWeight: "700",
  },
  submit: {
    minHeight: 50,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: lessonColors.yellowButton,
  },
  submitText: {
    color: lessonColors.background,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.48,
  },
  pressed: {
    opacity: 0.82,
  },
});
