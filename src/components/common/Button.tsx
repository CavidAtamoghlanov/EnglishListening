import { ComponentType, PropsWithChildren } from "react";
import type { LucideProps } from "lucide-react-native";
import { AppButton, type AppButtonVariant } from "./AppButton";

type ButtonVariant = AppButtonVariant;

type ButtonProps = PropsWithChildren<{
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  icon?: ComponentType<LucideProps>;
  accessibilityLabel?: string;
}>;

export function Button({
  children,
  onPress,
  disabled,
  variant = "primary",
  icon: Icon,
  accessibilityLabel,
}: ButtonProps) {
  return (
    <AppButton
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      icon={Icon}
      onPress={onPress}
      variant={variant}
    >
      {children}
    </AppButton>
  );
}
