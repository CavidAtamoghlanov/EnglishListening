import { TextInput, TextInputProps, StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { AppText } from "./AppText";

type TextInputFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
};

export function TextInputField({ label, error, style, ...props }: TextInputFieldProps) {
  return (
    <View style={styles.wrap}>
      <AppText variant="small" color={colors.muted}>
        {label}
      </AppText>
      <TextInput
        {...props}
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
      />
      {error ? (
        <AppText variant="small" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  input: {
    minHeight: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
