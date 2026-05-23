import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Plus, Save, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { AppText } from "../../components/common/AppText";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { useConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { IconBubble } from "../../components/common/IconBubble";
import { PageHeader } from "../../components/common/PageHeader";
import { TextInputField } from "../../components/common/TextInputField";
import { Screen } from "../../components/layout/Screen";
import { useActiveProfile } from "../../features/profile/hooks/useActiveProfile";
import { useProfiles } from "../../features/profile/hooks/useProfiles";
import { PROFILE_AVATARS } from "../../features/profile/services/profileStorageService";
import { formatFriendlyDate } from "../../utils/date";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export default function ManageProfilesScreen() {
  const router = useRouter();
  const { profiles, renameProfile, deleteProfile } = useProfiles();
  const { activeProfile, clearActiveProfile } = useActiveProfile();
  const { confirm, dialog } = useConfirmDialog();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    if (profiles.length === 0) {
      setEditingId(null);
    }
  }, [profiles.length]);

  async function saveRename(profileId: string) {
    if (!draftName.trim()) {
      return;
    }

    await renameProfile(profileId, draftName);
    setEditingId(null);
    setDraftName("");
  }

  function handleDelete(profileId: string) {
    confirm({
      title: "Delete profile?",
      message: "This removes only this profile and its local progress. Other profiles stay untouched.",
      confirmLabel: "Delete Profile",
      variant: "danger",
      onConfirm: () => {
        void (async () => {
          await deleteProfile(profileId);
          if (activeProfile?.id === profileId) {
            clearActiveProfile();
            router.replace("/");
          }
        })();
      },
    });
  }

  return (
    <Screen maxWidth={820}>
      {dialog}
      <PageHeader
        title="Manage Profiles"
        subtitle="Rename or delete local profiles. Progress is stored by profile ID."
        onBack={() => router.back()}
        actions={
          <AppButton icon={Plus} onPress={() => router.push("/profile/create")}>
            Add New Profile
          </AppButton>
        }
      />

      {profiles.length === 0 ? (
        <EmptyState
          icon="👋"
          title="No profiles yet"
          message="Create a local profile to start practicing."
        />
      ) : (
        <View style={styles.list}>
          {profiles.map((profile) => (
            <AppCard key={profile.id} padding="md">
              <View style={styles.profileRow}>
                <IconBubble emoji={profile.avatarEmoji ?? PROFILE_AVATARS[0]} size={54} backgroundColor={colors.primarySoft} />
                <View style={styles.profileCopy}>
                  <AppText variant="h3">{profile.name}</AppText>
                  <AppText variant="small" color={colors.muted}>
                    Last active: {formatFriendlyDate(profile.lastActiveAt)}
                  </AppText>
                </View>
              </View>
              {editingId === profile.id ? (
                <View style={styles.editRow}>
                  <TextInputField
                    label="New display name"
                    value={draftName}
                    onChangeText={setDraftName}
                    returnKeyType="done"
                    onSubmitEditing={() => void saveRename(profile.id)}
                  />
                  <AppButton icon={Save} onPress={() => void saveRename(profile.id)}>
                    Save
                  </AppButton>
                </View>
              ) : (
                <View style={styles.actions}>
                  <AppButton
                    variant="secondary"
                    onPress={() => {
                      setEditingId(profile.id);
                      setDraftName(profile.name);
                    }}
                  >
                    Rename
                  </AppButton>
                  <AppButton
                    variant="danger"
                    icon={Trash2}
                    onPress={() => handleDelete(profile.id)}
                  >
                    Delete
                  </AppButton>
                </View>
              )}
            </AppCard>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  profileCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  editRow: {
    gap: spacing.sm,
  },
});
