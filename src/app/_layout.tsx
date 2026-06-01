import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../features/auth/hooks/useAuth";
import { ActiveProfileProvider } from "../features/profile/hooks/useActiveProfile";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ActiveProfileProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#06111F" },
            }}
          />
        </ActiveProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
