import { PropsWithChildren } from "react";
import { ViewStyle } from "react-native";
import { AppCard, type CardTone } from "./AppCard";

type CardProps = PropsWithChildren<{
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  tone?: CardTone;
}>;

export function Card({ children, onPress, style, tone = "default" }: CardProps) {
  return (
    <AppCard onPress={onPress} style={style} tone={tone}>
      {children}
    </AppCard>
  );
}
