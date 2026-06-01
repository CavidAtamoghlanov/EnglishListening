import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { LogIn, WifiOff } from "lucide-react-native";
import { useRouter } from "expo-router";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppText } from "../../components/common/AppText";
import { PageHeader } from "../../components/common/PageHeader";
import { TextInputField } from "../../components/common/TextInputField";
import { Screen } from "../../components/layout/Screen";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { authApi } from "../../features/auth/services/authApi";
import { useActiveProfile } from "../../features/profile/hooks/useActiveProfile";
import { localUserDataService } from "../../features/sync/services/localUserDataService";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export default function LoginScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { setActiveProfile } = useActiveProfile();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await authApi.login({ email, password });
      await auth.setAuthenticated(response);
      const profile = await localUserDataService.applyCloudDataToLocal(response.data, response.user);
      setActiveProfile(profile);
      router.replace("/home");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOffline() {
    await auth.continueOffline();
    router.replace("/");
  }

  return (
    <Screen maxWidth={620}>
      <PageHeader
        title="Log in"
        subtitle="Sync progress across devices, or continue offline on this device."
      />

      <AppCard padding="lg" tone="blue" style={styles.card}>
        <TextInputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <TextInputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 8 characters"
          onSubmitEditing={() => void handleLogin()}
        />
        {error ? <AppText color={colors.danger}>{error}</AppText> : null}
        <AppButton icon={LogIn} disabled={isSubmitting} onPress={() => void handleLogin()} size="lg">
          Log in
        </AppButton>
        <View style={styles.row}>
          <AppButton variant="secondary" onPress={() => router.push("/auth/register")} style={styles.flex}>
            Create account
          </AppButton>
          <AppButton icon={WifiOff} variant="ghost" onPress={() => void handleOffline()} style={styles.flex}>
            Continue offline
          </AppButton>
        </View>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    gap: spacing.lg,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    minWidth: 170,
  },
});
