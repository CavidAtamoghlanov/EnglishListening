import { useCallback, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { AppButton } from "./AppButton";
import { AppCard } from "./AppCard";
import { AppText } from "./AppText";
import { IconBubble } from "./IconBubble";

type ConfirmVariant = "default" | "danger";

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onCancel: () => void;
  onConfirm: () => void;
};

type ConfirmOptions = Omit<ConfirmDialogProps, "visible" | "onCancel">;

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <AppCard padding="lg" style={styles.dialog} elevated>
          <IconBubble
            icon={AlertTriangle}
            color={isDanger ? colors.danger : colors.primary}
            backgroundColor={isDanger ? colors.dangerSoft : colors.primarySoft}
            size={56}
            iconSize={26}
          />
          <View style={styles.copy}>
            <AppText variant="h2" style={styles.center}>
              {title}
            </AppText>
            <AppText color={colors.muted} style={styles.center}>
              {message}
            </AppText>
          </View>
          <View style={styles.actions}>
            <AppButton variant="secondary" onPress={onCancel} style={styles.actionButton}>
              {cancelLabel}
            </AppButton>
            <AppButton
              variant={isDanger ? "danger" : "primary"}
              onPress={onConfirm}
              style={styles.actionButton}
            >
              {confirmLabel}
            </AppButton>
          </View>
        </AppCard>
      </View>
    </Modal>
  );
}

export function useConfirmDialog() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const close = useCallback(() => setOptions(null), []);
  const confirm = useCallback((nextOptions: ConfirmOptions) => {
    setOptions(nextOptions);
  }, []);

  const handleConfirm = useCallback(() => {
    const action = options?.onConfirm;
    setOptions(null);
    action?.();
  }, [options]);

  const dialog = (
    <ConfirmDialog
      visible={Boolean(options)}
      title={options?.title ?? ""}
      message={options?.message ?? ""}
      confirmLabel={options?.confirmLabel}
      cancelLabel={options?.cancelLabel}
      variant={options?.variant}
      onCancel={close}
      onConfirm={handleConfirm}
    />
  );

  return { confirm, dialog };
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.overlay,
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    borderRadius: radii.xl,
  },
  copy: {
    gap: spacing.sm,
  },
  center: {
    textAlign: "center",
  },
  actions: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: 130,
  },
});
