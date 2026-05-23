import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActiveProfileProvider } from "../features/profile/hooks/useActiveProfile";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ActiveProfileProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#F7F9FC" },
          }}
        />
      </ActiveProfileProvider>
    </SafeAreaProvider>
  );
}
