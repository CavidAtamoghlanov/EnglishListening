import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Shield, UserRound } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppText } from "../../components/common/AppText";
import { PageHeader } from "../../components/common/PageHeader";
import { TextInputField } from "../../components/common/TextInputField";
import { AppScaffold } from "../../components/layout/AppScaffold";
import type { SafeUser, UserCloudData } from "../../features/sync/types";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type UserDetail = {
  user: SafeUser;
  data: UserCloudData | null;
};

export default function UserDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string }>();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const [adminToken, setAdminToken] = useState("");
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadDetail() {
    if (!userId) {
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: { "X-Admin-Token": adminToken },
      });
      const body = (await response.json()) as UserDetail & { error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? "Admin request failed.");
      }
      setDetail(body);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Admin request failed.");
    }
  }

  return (
    <AppScaffold maxWidth={900}>
      <PageHeader title="User Detail" subtitle={userId} icon={UserRound} onBack={() => router.back()} />
      <AppCard padding="lg" tone="violet">
        <TextInputField label="Admin token" value={adminToken} onChangeText={setAdminToken} secureTextEntry />
        {error ? <AppText color={colors.danger}>{error}</AppText> : null}
        <AppButton icon={Shield} disabled={!adminToken.trim()} onPress={() => void loadDetail()}>
          Load Detail
        </AppButton>
      </AppCard>

      {detail ? (
        <AppCard padding="lg">
          <View style={styles.header}>
            <AppText style={styles.avatar}>{detail.user.avatar}</AppText>
            <View style={styles.copy}>
              <AppText variant="h2">{detail.user.displayName}</AppText>
              <AppText color={colors.muted}>{detail.user.email}</AppText>
              <AppText color={colors.muted}>Revision {detail.data?.sync.revision ?? 0}</AppText>
            </View>
          </View>
          <AppText color={colors.muted}>Settings: {detail.data?.settings ? "stored" : "empty"}</AppText>
          <AppText color={colors.muted}>Word progress: {detail.data?.wordProgress ? "stored" : "empty"}</AppText>
          <AppText color={colors.muted}>Sentence progress: {detail.data?.sentenceProgress ? "stored" : "empty"}</AppText>
          <AppText color={colors.muted}>Review items: {detail.data?.reviewQueue?.length ?? 0}</AppText>
          <AppText color={colors.muted}>Learning events: {detail.data?.learningEvents?.length ?? 0}</AppText>
        </AppCard>
      ) : null}
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    fontSize: 42,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
});
