import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { RotateCcw, Save, ShieldAlert, Target, Trash2, UserRound, Volume2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { AppText } from "../../components/common/AppText";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AvatarChipGrid } from "../../components/common/AvatarChipGrid";
import { useConfirmDialog } from "../../components/common/ConfirmDialog";
import { IconBubble } from "../../components/common/IconBubble";
import { PageHeader } from "../../components/common/PageHeader";
import { SegmentedControl } from "../../components/common/SegmentedControl";
import { TextInputField } from "../../components/common/TextInputField";
import { AppScaffold } from "../../components/layout/AppScaffold";
import { CEFR_LEVELS, DEFAULT_CEFR_LEVEL } from "../../config/levels";
import { useActiveProfile } from "../../features/profile/hooks/useActiveProfile";
import {
  PROFILE_AVATARS,
  profileStorageService,
} from "../../features/profile/services/profileStorageService";
import { useProgress } from "../../features/progress/hooks/useProgress";
import { progressStorageService } from "../../features/progress/services/progressStorageService";
import type { CEFRLevel } from "../../features/progress/types";
import { useVoiceSettings } from "../../features/settings/hooks/useVoiceSettings";
import type { PronunciationSpeed, VoiceAccentPreference } from "../../features/settings/types";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export default function SettingsScreen() {
  const router = useRouter();
  const { activeProfile, setActiveProfile, clearActiveProfile } = useActiveProfile();
  const { progress, saveProgress, reload } = useProgress(activeProfile?.id);
  const { settings, updateSettings } = useVoiceSettings(activeProfile?.id);
  const { confirm, dialog } = useConfirmDialog();
  const [name, setName] = useState(activeProfile?.name ?? "");
  const [resetLevel, setResetLevel] = useState<CEFRLevel>(DEFAULT_CEFR_LEVEL);

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
    } else {
      setName(activeProfile.name);
    }
  }, [activeProfile, router]);

  if (!activeProfile || !progress || !settings) {
    return null;
  }

  const profile = activeProfile;
  const currentProgress = progress;
  const currentSettings = settings;

  async function saveProfileChanges() {
    if (!name.trim()) {
      return;
    }

    const updated = await profileStorageService.updateProfile(profile.id, {
      name,
      avatarEmoji: profile.avatarEmoji,
    });
    if (updated) {
      setActiveProfile(updated);
    }
  }

  async function changeAvatar(avatarEmoji: string) {
    const updated = await profileStorageService.updateProfile(profile.id, { avatarEmoji });
    if (updated) {
      setActiveProfile(updated);
    }
  }

  async function changeDailyGoal(targetWords: string) {
    const updated = {
      ...currentProgress,
      dailyGoal: {
        ...currentProgress.dailyGoal,
        targetWords: Number(targetWords),
      },
    };
    await saveProgress(updated);
  }

  function resetSelectedLevel() {
    confirm({
      title: `Reset ${resetLevel}?`,
      message: "Only this level is reset for the current profile.",
      confirmLabel: "Reset Level",
      variant: "danger",
      onConfirm: () => {
        void (async () => {
          await progressStorageService.resetLevel(profile.id, resetLevel);
          await reload();
        })();
      },
    });
  }

  function resetAllProgress() {
    confirm({
      title: "Reset all progress?",
      message: "This clears all levels, favorites, difficult words, daily goal progress, and streaks for this profile only.",
      confirmLabel: "Reset All",
      variant: "danger",
      onConfirm: () => {
        void reloadAfter(progressStorageService.resetAll(profile.id));
      },
    });
  }

  async function reloadAfter(action: Promise<unknown>) {
    await action;
    await reload();
  }

  function deleteCurrentProfile() {
    confirm({
      title: "Delete this profile?",
      message: "This deletes this local profile and only this profile's progress.",
      confirmLabel: "Delete Profile",
      variant: "danger",
      onConfirm: () => {
        void (async () => {
          await profileStorageService.deleteProfile(profile.id);
          clearActiveProfile();
          router.replace("/");
        })();
      },
    });
  }

  return (
    <AppScaffold maxWidth={1020}>
      {dialog}
      <PageHeader
        title="Settings"
        subtitle={`Active profile: ${profile.name}`}
        icon={UserRound}
        onBack={() => router.back()}
      />

      <AppCard padding="lg">
        <View style={styles.sectionHeader}>
          <IconBubble icon={UserRound} backgroundColor={colors.primarySoft} color={colors.primary} />
          <View style={styles.sectionCopy}>
            <AppText variant="h2">Profile</AppText>
            <AppText color={colors.muted}>Update the local name and avatar shown around the app.</AppText>
          </View>
        </View>
        <TextInputField label="Display name" value={name} onChangeText={setName} />
        <AvatarChipGrid
          avatars={PROFILE_AVATARS}
          selected={profile.avatarEmoji ?? PROFILE_AVATARS[0] ?? "\u{1F642}"}
          onSelect={(emoji) => void changeAvatar(emoji)}
        />
        <AppButton icon={Save} onPress={() => void saveProfileChanges()} size="lg">
          Save Profile
        </AppButton>
      </AppCard>

      <AppCard tone="green" padding="lg">
        <View style={styles.sectionHeader}>
          <IconBubble icon={Target} backgroundColor={colors.surfaceAlt} color={colors.success} />
          <View style={styles.sectionCopy}>
            <AppText variant="h2">Daily Goal</AppText>
            <AppText color={colors.muted}>
              Today: {currentProgress.dailyGoal.completedWords} / {currentProgress.dailyGoal.targetWords} words
            </AppText>
          </View>
        </View>
        <SegmentedControl
          value={String(currentProgress.dailyGoal.targetWords)}
          onChange={changeDailyGoal}
          options={[
            { label: "10", value: "10" },
            { label: "20", value: "20" },
            { label: "30", value: "30" },
            { label: "50", value: "50" },
          ]}
        />
      </AppCard>

      <AppCard tone="blue" padding="lg">
        <View style={styles.sectionHeader}>
          <IconBubble icon={Volume2} backgroundColor={colors.surfaceAlt} color={colors.primary} />
          <View style={styles.sectionCopy}>
            <AppText variant="h2">Voice Settings</AppText>
            <AppText color={colors.muted}>Choose a comfortable pronunciation pace and accent preference.</AppText>
          </View>
        </View>
        <View style={styles.controlBlock}>
          <AppText variant="label" color={colors.muted}>
            Pronunciation speed
          </AppText>
          <SegmentedControl<PronunciationSpeed>
            value={currentSettings.pronunciationSpeed}
            onChange={(pronunciationSpeed) => void updateSettings({ pronunciationSpeed })}
            options={[
              { label: "Slow", value: "slow" },
              { label: "Normal", value: "normal" },
              { label: "Fast", value: "fast" },
            ]}
          />
        </View>
        <View style={styles.controlBlock}>
          <AppText variant="label" color={colors.muted}>
            English accent
          </AppText>
          <SegmentedControl<VoiceAccentPreference>
            value={currentSettings.voiceAccent}
            onChange={(voiceAccent) => void updateSettings({ voiceAccent })}
            options={[
              { label: "Default", value: "default" },
              { label: "US English", value: "us" },
              { label: "UK English", value: "uk" },
            ]}
          />
        </View>
      </AppCard>

      <AppCard tone="yellow" padding="lg">
        <View style={styles.sectionHeader}>
          <IconBubble icon={RotateCcw} backgroundColor={colors.surfaceAlt} color={colors.warning} />
          <View style={styles.sectionCopy}>
            <AppText variant="h2">Progress Controls</AppText>
            <AppText color={colors.muted}>Reset practice state only for {profile.name}.</AppText>
          </View>
        </View>
        <SegmentedControl<CEFRLevel>
          value={resetLevel}
          onChange={setResetLevel}
          options={CEFR_LEVELS.map((level) => ({ label: level, value: level }))}
        />
        <View style={styles.actions}>
          <AppButton variant="secondary" icon={RotateCcw} onPress={resetSelectedLevel}>
            Reset Selected Level
          </AppButton>
          <AppButton variant="danger" icon={RotateCcw} onPress={resetAllProgress}>
            Reset All Progress
          </AppButton>
        </View>
      </AppCard>

      <AppCard tone="coral" padding="lg">
        <View style={styles.sectionHeader}>
          <IconBubble icon={ShieldAlert} backgroundColor={colors.surfaceAlt} color={colors.danger} />
          <View style={styles.sectionCopy}>
            <AppText variant="h2">Danger Zone</AppText>
            <AppText color={colors.muted}>
              Delete only this local profile and its saved progress.
            </AppText>
          </View>
        </View>
        <AppButton variant="danger" icon={Trash2} onPress={deleteCurrentProfile}>
          Delete This Profile
        </AppButton>
      </AppCard>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  sectionCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  controlBlock: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
