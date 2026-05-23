import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Flame,
  Mic,
  Settings,
  Sparkles,
  Target,
  Users,
} from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import type { Href } from "expo-router";
import { AppText } from "../components/common/AppText";
import { ActionCard } from "../components/common/ActionCard";
import { AppCard } from "../components/common/AppCard";
import { ComingSoonRow } from "../components/common/ComingSoonRow";
import { HeroLearningCard } from "../components/common/HeroLearningCard";
import { IconButton } from "../components/common/IconButton";
import { IconBubble } from "../components/common/IconBubble";
import { SectionTitle } from "../components/common/SectionTitle";
import { Screen } from "../components/layout/Screen";
import { Grid } from "../components/layout/Grid";
import { ProgressBar } from "../components/stats/ProgressBar";
import { WordsIntroModal } from "../components/words/WordsIntroModal";
import { DEFAULT_CEFR_LEVEL, getLevelConfig } from "../config/levels";
import { HOME_MODULES, type HomeModuleConfig } from "../config/homeModules";
import { useActiveProfile } from "../features/profile/hooks/useActiveProfile";
import { PROFILE_AVATARS } from "../features/profile/services/profileStorageService";
import { useProgress } from "../features/progress/hooks/useProgress";
import { useFirstTimeModal } from "../features/words/hooks/useFirstTimeModal";
import { wordsDataService } from "../features/words/services/wordsDataService";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

function countIds(values: string[][]): number {
  return new Set(values.flat()).size;
}

export default function HomeScreen() {
  const router = useRouter();
  const { activeProfile, clearActiveProfile } = useActiveProfile();
  const { progress, reload } = useProgress(activeProfile?.id);
  const intro = useFirstTimeModal(activeProfile?.id);
  const [wordsIntroVisible, setWordsIntroVisible] = useState(false);

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
    } else {
      setWordsIntroVisible(false);
    }
  }, [activeProfile, router]);

  useFocusEffect(
    useCallback(() => {
      if (activeProfile?.id) {
        void reload();
      }
    }, [activeProfile?.id, reload]),
  );

  if (!activeProfile || !progress) {
    return null;
  }

  const profile = activeProfile;
  const currentProgress = progress;
  const heroLevel = currentProgress.lastSelectedLevel ?? DEFAULT_CEFR_LEVEL;
  const heroConfig = getLevelConfig(heroLevel);
  const heroProgress = currentProgress.levels[heroLevel];
  const heroWordCount =
    heroProgress.sessionOrderWordIds.length || wordsDataService.getWordCount(heroLevel);
  const heroWordIndex = Math.min(heroProgress.currentIndex, heroWordCount);
  const heroPercent = heroWordCount > 0 ? (heroWordIndex / heroWordCount) * 100 : 0;
  const canContinue = heroProgress.sessionOrderWordIds.length > 0;
  const difficultCount = countIds(Object.values(currentProgress.levels).map((level) => level.difficultWordIds));
  const favoriteCount = countIds(Object.values(currentProgress.levels).map((level) => level.favoriteWordIds));
  const moduleContext = { progress: currentProgress, difficultCount, favoriteCount };
  const dailyPercent = Math.min(
    100,
    Math.round((currentProgress.dailyGoal.completedWords / currentProgress.dailyGoal.targetWords) * 100),
  );

  async function goToWordsPractice() {
    const latest = await reload();
    if (latest && !latest.wordsIntroSeen) {
      setWordsIntroVisible(true);
      return;
    }
    router.push("/words/levels");
  }

  async function continueAfterIntro() {
    setWordsIntroVisible(false);
    await intro.markSeen();
    router.push("/words/levels");
  }

  function getModuleDescription(module: HomeModuleConfig): string {
    return typeof module.description === "function"
      ? module.description(moduleContext)
      : module.description;
  }

  function handleModulePress(module: HomeModuleConfig): void {
    if (module.id === "words") {
      void goToWordsPractice();
      return;
    }

    if (module.route) {
      router.push(module.route as Href);
    }
  }

  function handleContinue() {
    if (canContinue) {
      router.push(`/words/practice/${heroLevel}`);
      return;
    }

    void goToWordsPractice();
  }

  function renderRouteModule(module: HomeModuleConfig) {
    const Icon = module.icon;
    const description = getModuleDescription(module);

    return (
      <ActionCard
        key={module.id}
        title={module.title}
        subtitle={description}
        icon={Icon}
        iconColor={module.iconColor}
        iconBackground={module.tone === "yellow" ? colors.warningSoft : colors.coralSoft}
        buttonLabel="Review"
        tone={module.tone}
        onPress={() => handleModulePress(module)}
      />
    );
  }

  const reviewModules = HOME_MODULES.filter(
    (module) => module.kind === "route" && (module.visible?.(moduleContext) ?? true),
  );
  const comingSoonModules = HOME_MODULES.filter((module) => module.kind === "placeholder");

  return (
    <Screen>
      <WordsIntroModal visible={wordsIntroVisible} onContinue={() => void continueAfterIntro()} />

      <View style={styles.header}>
        <View style={styles.identity}>
          <IconBubble
            emoji={profile.avatarEmoji ?? PROFILE_AVATARS[0]}
            size={58}
            backgroundColor={colors.white}
            style={styles.avatar}
          />
          <View style={styles.headerCopy}>
            <AppText variant="h1">Welcome back, {profile.name}!{" \u{1F44B}"}</AppText>
            <AppText color={colors.muted}>Small daily reps, big speaking confidence.</AppText>
          </View>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon={Users}
            accessibilityLabel="Switch profile"
            onPress={() => {
              clearActiveProfile();
              router.replace("/");
            }}
          />
          <IconButton
            icon={Settings}
            accessibilityLabel="Open settings"
            onPress={() => router.push("/settings")}
          />
        </View>
      </View>

      <HeroLearningCard
        levelLabel={heroConfig.title}
        wordLabel={`Word ${heroWordIndex} of ${heroWordCount}`}
        progressPercent={heroPercent}
        onContinue={handleContinue}
      />

      <ActionCard
        title="Words Practice"
        subtitle="See Azerbaijani words and say them in English."
        icon={Mic}
        iconColor={colors.success}
        iconBackground={colors.successSoft}
        buttonLabel="Start Practice"
        tone="green"
        onPress={() => void goToWordsPractice()}
      />

      <ActionCard
        title="Sentence Practice"
        subtitle="Practice short sentences by speaking aloud."
        icon={Sparkles}
        iconColor={colors.primary}
        iconBackground={colors.primarySoft}
        buttonLabel="Start"
        tone="blue"
        onPress={() => router.push("/sentences")}
      />

      <View style={styles.statsRow}>
        <AppCard padding="md" style={styles.statCard}>
          <View style={styles.statTop}>
            <IconBubble icon={Target} color={colors.primary} backgroundColor={colors.primarySoft} size={44} />
            <View style={styles.statCopy}>
              <AppText variant="label" color={colors.muted}>Daily Goal</AppText>
              <AppText variant="h2">
                {currentProgress.dailyGoal.completedWords} / {currentProgress.dailyGoal.targetWords}
              </AppText>
              <AppText variant="small" color={colors.muted}>words today</AppText>
            </View>
          </View>
          <ProgressBar percent={dailyPercent} height={8} color={colors.primary} />
        </AppCard>
        <AppCard padding="md" style={styles.statCard}>
          <View style={styles.statTop}>
            <IconBubble icon={Flame} color={colors.warning} backgroundColor={colors.warningSoft} size={44} />
            <View style={styles.statCopy}>
              <AppText variant="label" color={colors.muted}>Streak</AppText>
              <AppText variant="h2">{currentProgress.currentDayStreak} Day Streak</AppText>
              <AppText variant="small" color={colors.muted}>
                Best streak: {currentProgress.bestDayStreak} days
              </AppText>
            </View>
          </View>
          <WeekDots activeCount={currentProgress.currentDayStreak} />
        </AppCard>
      </View>

      {reviewModules.length > 0 ? (
        <>
          <SectionTitle title="Review" subtitle="Focused sets from your own saved progress." />
          <Grid minItemWidth={300} gap={spacing.md}>
            {reviewModules.map(renderRouteModule)}
          </Grid>
        </>
      ) : null}

      <SectionTitle title="More practice" subtitle="Listening and grammar modules are on the way." />
      <AppCard padding="md" style={styles.comingSoonList}>
        {comingSoonModules.map((module) => (
          <ComingSoonRow
            key={module.id}
            title={module.title}
            subtitle={getModuleDescription(module)}
            icon={module.icon}
          />
        ))}
      </AppCard>
    </Screen>
  );
}

function WeekDots({ activeCount }: { activeCount: number }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <View style={styles.weekDots}>
      {days.map((day, index) => {
        const active = index >= days.length - Math.min(activeCount, days.length);
        return (
          <View key={`${day}-${index}`} style={styles.weekItem}>
            <View style={[styles.weekDot, active ? styles.weekDotActive : null]} />
            <AppText variant="label" color={active ? colors.primaryDark : colors.muted}>
              {day}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
  },
  identity: {
    flex: 1,
    minWidth: 260,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 260,
  },
  statTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  statCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  weekDots: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  weekItem: {
    alignItems: "center",
    gap: spacing.xs,
  },
  weekDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  weekDotActive: {
    backgroundColor: colors.primary,
  },
  comingSoonList: {
    gap: spacing.sm,
  },
});
