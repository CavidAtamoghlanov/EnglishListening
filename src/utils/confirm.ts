import { Alert, Platform } from "react-native";

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
): void {
  if (Platform.OS === "web") {
    const ok =
      typeof window !== "undefined" ? window.confirm(`${title}\n\n${message}`) : true;
    if (ok) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "Confirm", style: "destructive", onPress: onConfirm },
  ]);
}
