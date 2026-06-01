import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { UserPlus, WifiOff } from "lucide-react-native";
import { useRouter } from "expo-router";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppText } from "../../components/common/AppText";
import { AvatarChipGrid } from "../../components/common/AvatarChipGrid";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { PageHeader } from "../../components/common/PageHeader";
import { TextInputField } from "../../components/common/TextInputField";
import { Screen } from "../../components/layout/Screen";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { authApi } from "../../features/auth/services/authApi";
import type { AuthResponse } from "../../features/auth/types";
import { useActiveProfile } from "../../features/profile/hooks/useActiveProfile";
import { PROFILE_AVATARS } from "../../features/profile/services/profileStorageService";
import type { UserProfile } from "../../features/profile/types";
import { localToCloudMigrationService } from "../../features/sync/services/localToCloudMigrationService";
import { localUserDataService } from "../../features/sync/services/localUserDataService";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export default function RegisterScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { setActiveProfile } = useActiveProfile();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState(PROFILE_AVATARS[0] ?? "🙂");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingResponse, setPendingResponse] = useState<AuthResponse | null>(null);
  const [mergeCandidate, setMergeCandidate] = useState<UserProfile | null>(null);

  async function finishWithCloudData(response: AuthResponse) {
    await auth.setAuthenticated(response);
    const profile = await localUserDataService.applyCloudDataToLocal(response.data, response.user);
    setActiveProfile(profile);
    router.replace("/home");
  }

  async function handleRegister() {
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.register({
        email,
        username,
        displayName,
        avatar,
        password,
      });
      const candidate = await localToCloudMigrationService.getMergeCandidate(response.user.userId);
      if (candidate) {
        setPendingResponse(response);
        setMergeCandidate(candidate);
      } else {
        await finishWithCloudData(response);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOffline() {
    await auth.continueOffline();
    router.replace("/");
  }

  async function mergeCandidateIntoAccount() {
    if (!pendingResponse || !mergeCandidate) {
      return;
    }
    const session = { token: pendingResponse.token, user: pendingResponse.user };
    await auth.setAuthenticated(pendingResponse);
    await localToCloudMigrationService.mergeLocalProfileIntoCloud(session, mergeCandidate.id);
    const profile = await localUserDataService.ensureLocalProfile(pendingResponse.user);
    setActiveProfile(profile);
    setPendingResponse(null);
    setMergeCandidate(null);
    router.replace("/home");
  }

  async function startFreshAccount() {
    if (!pendingResponse) {
      return;
    }
    const response = pendingResponse;
    setPendingResponse(null);
    setMergeCandidate(null);
    await finishWithCloudData(response);
  }

  return (
    <Screen maxWidth={700}>
      <ConfirmDialog
        visible={Boolean(pendingResponse && mergeCandidate)}
        title="Move local progress?"
        message={`A local profile named ${mergeCandidate?.name ?? "this learner"} exists on this device. Merge it into your new cloud account?`}
        cancelLabel="Start fresh"
        confirmLabel="Merge progress"
        onCancel={() => void startFreshAccount()}
        onConfirm={() => void mergeCandidateIntoAccount()}
      />
      <PageHeader
        title="Create account"
        subtitle="Use email and password to sync your progress across devices."
        onBack={() => router.replace("/auth/login")}
      />

      <AppCard padding="lg" tone="violet" style={styles.card}>
        <TextInputField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInputField label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInputField label="Display name" value={displayName} onChangeText={setDisplayName} />
        <AvatarChipGrid avatars={PROFILE_AVATARS} selected={avatar} onSelect={setAvatar} />
        <TextInputField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TextInputField
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          onSubmitEditing={() => void handleRegister()}
        />
        {error ? <AppText color={colors.danger}>{error}</AppText> : null}
        <AppButton icon={UserPlus} disabled={isSubmitting} onPress={() => void handleRegister()} size="lg">
          Register
        </AppButton>
        <View style={styles.row}>
          <AppButton variant="secondary" onPress={() => router.replace("/auth/login")} style={styles.flex}>
            I have an account
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
    minWidth: 180,
  },
});
