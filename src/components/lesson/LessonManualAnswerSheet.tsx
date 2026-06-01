import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { ChevronDown, Keyboard, Send } from "lucide-react-native";
import { AppText } from "../common/AppText";
import { useResponsive } from "../../utils/useResponsive";
import { lessonColors } from "./lessonTheme";

type LessonManualAnswerSheetProps = {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
  defaultOpen?: boolean;
};

export function LessonManualAnswerSheet({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  disabled = false,
  defaultOpen,
}: LessonManualAnswerSheetProps) {
  const { isMobile } = useResponsive();
  const [open, setOpen] = useState(defaultOpen ?? isMobile);

  return (
    <View style={styles.sheet}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={open ? "Hide manual answer" : "Type answer instead"}
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
      >
        <View style={styles.toggleLeft}>
          <Keyboard color={lessonColors.yellowButton} size={18} />
          <AppText style={styles.toggleText}>{open ? "Gizlət" : "Yazaraq cavabla"}</AppText>
        </View>
        <ChevronDown
          color={lessonColors.muted}
          size={20}
          style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
        />
      </Pressable>

      {open ? (
        <View style={styles.body}>
          <TextInput
            accessibilityLabel="Manual answer"
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={lessonColors.muted}
            autoCapitalize="none"
            editable={!disabled}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            blurOnSubmit={false}
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Check"
            onPress={onSubmit}
            disabled={disabled}
            style={({ pressed }) => [styles.submit, pressed && !disabled && styles.pressed, disabled && styles.disabled]}
          >
            <Send color={lessonColors.background} size={18} strokeWidth={2.5} />
            <AppText style={styles.submitText}>Check</AppText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    width: "100%",
    maxWidth: 620,
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: "rgba(12,23,38,0.94)",
    borderWidth: 1,
    borderColor: lessonColors.border,
  },
  toggle: {
    minHeight: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  toggleText: {
    color: lessonColors.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  body: {
    padding: 14,
    gap: 10,
    flexDirection: "row",
    alignItems: "stretch",
    borderTopWidth: 1,
    borderTopColor: lessonColors.border,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
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
    width: 96,
    minHeight: 48,
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
