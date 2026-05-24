import { useEffect } from "react";
import type { ComponentType } from "react";
import { StyleSheet, View } from "react-native";
import { ChevronRight, type LucideProps } from "lucide-react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { AppText } from "../../../components/common/AppText";
import { AppCard } from "../../../components/common/AppCard";
import { EmptyState } from "../../../components/common/EmptyState";
import { IconBubble } from "../../../components/common/IconBubble";
import { PageHeader } from "../../../components/common/PageHeader";
import { Grid } from "../../../components/layout/Grid";
import { AppScaffold } from "../../../components/layout/AppScaffold";
import { CEFR_LEVELS, type CEFRLevel } from "../../../config/levels";
import {
  getPracticeModeConfig,
  getReviewWordIds,
  type ReviewPracticeMode,
} from "../../../config/reviewModes";
import { useActiveProfile } from "../../profile/hooks/useActiveProfile";
import { useProgress } from "../../progress/hooks/useProgress";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";

type LevelCount = {
  level: CEFRLevel;
  count: number;
};

export function ReviewModeSelection({ mode }: { mode: ReviewPracticeMode }) {
  const router = useRouter();
  const { activeProfile } = useActiveProfile();
  const { progress } = useProgress(activeProfile?.id);
  const config = getPracticeModeConfig(mode);
  const Icon = config.icon;

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
    }
  }, [activeProfile, router]);

  if (!activeProfile || !progress) {
    return null;
  }

  const levelCounts: LevelCount[] = CEFR_LEVELS.map((level) => ({
    level,
    count: getReviewWordIds(progress.levels[level], mode).length,
  }));
  const total = levelCounts.reduce((sum, item) => sum + item.count, 0);

  function practiceHref(level: CEFRLevel | "all"): Href {
    return `/words/practice/${level}?mode=${mode}${level === "all" ? "&scope=all" : ""}` as Href;
  }

  return (
    <AppScaffold>
      <PageHeader
        title={config.title}
        subtitle={config.emptyMessage}
        icon={Icon}
        onBack={() => router.back()}
      />

      {total === 0 ? (
        <EmptyState
          icon={config.emptyIcon}
          title={config.emptyTitle}
          message={config.emptyMessage}
        />
      ) : (
        <Grid minItemWidth={240} gap={spacing.md}>
          <ReviewCard
            title="All Levels"
            count={total}
            icon={Icon}
            iconColor={config.iconColor}
            tone={config.tone}
            onPress={() => router.push(practiceHref("all"))}
          />
          {levelCounts
            .filter((item) => item.count > 0)
            .map((item) => (
              <ReviewCard
                key={item.level}
                title={item.level}
                count={item.count}
                icon={Icon}
                iconColor={config.iconColor}
                tone={config.tone}
                onPress={() => router.push(practiceHref(item.level))}
              />
            ))}
        </Grid>
      )}
    </AppScaffold>
  );
}

function ReviewCard({
  title,
  count,
  icon: Icon,
  iconColor,
  tone,
  onPress,
}: {
  title: string | CEFRLevel;
  count: number;
  icon: ComponentType<LucideProps>;
  iconColor: string;
  tone: "default" | "blue" | "green" | "yellow" | "violet" | "coral";
  onPress: () => void;
}) {
  return (
    <AppCard tone={tone} padding="lg" style={styles.tile} onPress={onPress}>
      <View style={styles.tileTop}>
        <IconBubble icon={Icon} color={iconColor} backgroundColor={colors.surfaceAlt} />
        <ChevronRight color={colors.muted} size={22} />
      </View>
      <View style={styles.tileCopy}>
        <AppText variant="h2">{title}</AppText>
        <AppText color={colors.muted}>{count} words ready to practice</AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  tile: {
    minHeight: 150,
  },
  tileTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tileCopy: {
    gap: spacing.xs,
  },
});
