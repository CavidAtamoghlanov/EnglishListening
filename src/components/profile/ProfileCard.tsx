import { StyleSheet, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { formatFriendlyDate } from "../../utils/date";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { AppCard } from "../common/AppCard";
import { AppText } from "../common/AppText";
import { IconBubble } from "../common/IconBubble";
import type { UserProfile } from "../../features/profile/types";
import { PROFILE_AVATARS } from "../../features/profile/services/profileStorageService";

type ProfileCardProps = {
  profile: UserProfile;
  summary?: string;
  onPress?: () => void;
};

export function ProfileCard({ profile, summary, onPress }: ProfileCardProps) {
  return (
    <AppCard
      padding="md"
      elevated={false}
      onPress={onPress}
      accessibilityLabel={`Select ${profile.name}`}
    >
      <View style={styles.row}>
        <IconBubble emoji={profile.avatarEmoji ?? PROFILE_AVATARS[0]} backgroundColor={colors.primarySoft} size={54} />
        <View style={styles.info}>
          <AppText variant="h3">{profile.name}</AppText>
          <AppText variant="small" color={colors.muted}>
            Last active: {formatFriendlyDate(profile.lastActiveAt)}
          </AppText>
          {summary ? (
            <View style={styles.summaryPill}>
              <AppText variant="label" color={colors.primaryDark}>
                {summary}
              </AppText>
            </View>
          ) : null}
        </View>
        <ChevronRight color={colors.muted} size={22} />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  summaryPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primarySoft,
  },
});
