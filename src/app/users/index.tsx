import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Shield, Users } from "lucide-react-native";
import { useRouter } from "expo-router";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppText } from "../../components/common/AppText";
import { PageHeader } from "../../components/common/PageHeader";
import { TextInputField } from "../../components/common/TextInputField";
import { AppScaffold } from "../../components/layout/AppScaffold";
import type { SafeUser } from "../../features/sync/types";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type UserSummary = {
  user: SafeUser;
  totalXp: number;
  todayXp: number;
  levelTitle: string;
  streak: number;
  dueReviewCount: number;
  lastSyncAt?: string;
};

export default function UsersAdminScreen() {
  const router = useRouter();
  const [adminToken, setAdminToken] = useState("");
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadUsers() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/users", {
        headers: { "X-Admin-Token": adminToken },
      });
      const body = (await response.json()) as { users?: UserSummary[]; error?: string };
      if (!response.ok) {
        throw new Error(body.error ?? "Admin request failed.");
      }
      setUsers(body.users ?? []);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Admin request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppScaffold maxWidth={960}>
      <PageHeader title="Users" subtitle="Read-only admin user summaries." icon={Users} onBack={() => router.back()} />

      <AppCard padding="lg" tone="violet">
        <TextInputField
          label="Admin token"
          value={adminToken}
          onChangeText={setAdminToken}
          secureTextEntry
          placeholder="ADMIN_TOKEN"
        />
        {error ? <AppText color={colors.danger}>{error}</AppText> : null}
        <AppButton icon={Shield} disabled={!adminToken.trim() || isLoading} onPress={() => void loadUsers()}>
          {isLoading ? "Loading..." : "Load Users"}
        </AppButton>
      </AppCard>

      <View style={styles.list}>
        {users.map((item) => (
          <AppCard key={item.user.userId} padding="lg" onPress={() => router.push(`/users/${item.user.userId}`)}>
            <View style={styles.userRow}>
              <AppText style={styles.avatar}>{item.user.avatar}</AppText>
              <View style={styles.copy}>
                <AppText variant="h3">{item.user.displayName}</AppText>
                <AppText color={colors.muted}>
                  {item.user.username} - {item.user.email}
                </AppText>
                <AppText variant="small" color={colors.muted}>
                  XP {item.totalXp} - Streak {item.streak} - Review {item.dueReviewCount}
                </AppText>
              </View>
            </View>
          </AppCard>
        ))}
      </View>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    fontSize: 34,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
});
