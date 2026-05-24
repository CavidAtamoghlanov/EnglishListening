import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Plus, Settings2, Users } from "lucide-react-native";
import { useRouter } from "expo-router";
import { AppText } from "../components/common/AppText";
import { AppButton } from "../components/common/AppButton";
import { AppCard } from "../components/common/AppCard";
import { IconBubble } from "../components/common/IconBubble";
import { ProfileCard } from "../components/profile/ProfileCard";
import { Screen } from "../components/layout/Screen";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { useActiveProfile } from "../features/profile/hooks/useActiveProfile";
import { useProfiles } from "../features/profile/hooks/useProfiles";
import { progressStorageService } from "../features/progress/services/progressStorageService";

export default function ProfilePickerScreen() {
  const router = useRouter();
  const { profiles, isLoading } = useProfiles();
  const { setActiveProfileById, clearActiveProfile } = useActiveProfile();
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  useEffect(() => {
    clearActiveProfile();
  }, [clearActiveProfile]);

  useEffect(() => {
    if (!isLoading && profiles.length === 0) {
      router.replace("/profile/create");
    }
  }, [isLoading, profiles.length, router]);

  useEffect(() => {
    let mounted = true;

    async function loadSummaries() {
      const entries = await Promise.all(
        profiles.map(async (profile) => {
          const progress = await progressStorageService.getProgress(profile.id);
          const level = progress.lastSelectedLevel;
          if (!level) {
            return [profile.id, "Ready to start"] as const;
          }
          const levelProgress = progress.levels[level];
          return [
            profile.id,
            `${level}: word ${levelProgress.currentIndex} / ${Math.max(
              levelProgress.sessionOrderWordIds.length,
              0,
            )}`,
          ] as const;
        }),
      );

      if (mounted) {
        setSummaries(Object.fromEntries(entries));
      }
    }

    void loadSummaries();
    return () => {
      mounted = false;
    };
  }, [profiles]);

  async function handleSelectProfile(profileId: string) {
    const profile = await setActiveProfileById(profileId);
    if (profile) {
      router.replace("/home");
    }
  }

  if (isLoading || profiles.length === 0) {
    return (
      <Screen scroll={false} contentStyle={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  return (
    <Screen maxWidth={760}>
      <AppCard tone="blue" padding="lg" style={styles.hero} elevated={false}>
        <IconBubble icon={Users} size={68} iconSize={30} backgroundColor={colors.surfaceAlt} />
        <AppText variant="title" style={styles.centerText}>
          Who is practicing today?
        </AppText>
        <AppText color={colors.muted} style={styles.centerText}>
          Choose a local profile. Each profile has its own progress on this device.
        </AppText>
      </AppCard>

      <View style={styles.list}>
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            summary={summaries[profile.id]}
            onPress={() => void handleSelectProfile(profile.id)}
          />
        ))}
      </View>

      <AppCard tone="default" padding="md">
        <View style={styles.actions}>
          <AppButton icon={Plus} onPress={() => router.push("/profile/create")}>
            Add New Profile
          </AppButton>
          <AppButton
            icon={Settings2}
            variant="secondary"
            onPress={() => router.push("/profile/manage")}
          >
            Manage Profiles
          </AppButton>
        </View>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    gap: spacing.md,
  },
  centerText: {
    textAlign: "center",
  },
  list: {
    gap: spacing.md,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
});
