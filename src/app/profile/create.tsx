import { useState } from "react";
import { StyleSheet } from "react-native";
import { Check, UserPlus } from "lucide-react-native";
import { PageHeader } from "../../components/common/PageHeader";
import { useRouter } from "expo-router";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AvatarChipGrid } from "../../components/common/AvatarChipGrid";
import { IconBubble } from "../../components/common/IconBubble";
import { TextInputField } from "../../components/common/TextInputField";
import { Screen } from "../../components/layout/Screen";
import { PROFILE_AVATARS } from "../../features/profile/services/profileStorageService";
import { useActiveProfile } from "../../features/profile/hooks/useActiveProfile";
import { useProfiles } from "../../features/profile/hooks/useProfiles";
import { colors } from "../../theme/colors";

export default function CreateProfileScreen() {
  const router = useRouter();
  const { createProfile } = useProfiles();
  const { setActiveProfile } = useActiveProfile();
  const [name, setName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState(PROFILE_AVATARS[0] ?? "\u{1F642}");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleCreate() {
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Enter a display name.");
      return;
    }

    setIsSaving(true);
    const profile = await createProfile(cleanName, avatarEmoji);
    setActiveProfile(profile);
    setIsSaving(false);
    router.replace("/home");
  }

  return (
    <Screen maxWidth={680}>
      <PageHeader
        title="Create Profile"
        subtitle="Names can repeat. Progress is separated by profile ID."
        onBack={() => router.replace("/")}
      />

      <AppCard tone="blue" padding="lg" style={styles.card}>
        <IconBubble icon={UserPlus} size={68} iconSize={30} backgroundColor={colors.surfaceAlt} style={styles.centerBubble} />
        <TextInputField
          label="Display name"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setError(null);
          }}
          error={error}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => void handleCreate()}
          placeholder="Cavid"
        />

        <AvatarChipGrid
          avatars={PROFILE_AVATARS}
          selected={avatarEmoji}
          onSelect={setAvatarEmoji}
        />

        <AppButton icon={Check} disabled={isSaving} onPress={() => void handleCreate()} size="lg">
          Create Profile
        </AppButton>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: "flex-start",
  },
  card: {
    maxWidth: 560,
    alignSelf: "center",
    width: "100%",
  },
  centerBubble: {
    alignSelf: "center",
  },
  center: {
    textAlign: "center",
  },
});
