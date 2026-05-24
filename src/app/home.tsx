import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Flame,
  Heart,
  Languages,
  Menu,
  MessageSquareText,
  Settings,
  Star,
  Target,
  Users,
} from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import type { Href } from "expo-router";
import { AppText } from "../components/common/AppText";
import { IconButton } from "../components/common/IconButton";
import { ProgressBar } from "../components/stats/ProgressBar";
import { WordsIntroModal } from "../components/words/WordsIntroModal";
import { AppScaffold } from "../components/layout/AppScaffold";
import { DEFAULT_CEFR_LEVEL, getLevelConfig } from "../config/levels";
import { useActiveProfile } from "../features/profile/hooks/useActiveProfile";
import { PROFILE_AVATARS } from "../features/profile/services/profileStorageService";
import { useProgress } from "../features/progress/hooks/useProgress";
import { useFirstTimeModal } from "../features/words/hooks/useFirstTimeModal";
import { wordsDataService } from "../features/words/services/wordsDataService";
import { colors } from "../theme/colors";
import { gradients } from "../theme/gradients";
import { radii } from "../theme/radii";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { useResponsive } from "../utils/useResponsive";

function countIds(values: string[][]): number {
  return new Set(values.flat()).size;
}

export default function HomeScreen() {
  const router = useRouter();
  const { isMobile } = useResponsive();
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
  const heroLevel = progress.lastSelectedLevel ?? DEFAULT_CEFR_LEVEL;
  const heroConfig = getLevelConfig(heroLevel);
  const heroProgress = progress.levels[heroLevel];
  const heroWordCount =
    heroProgress.sessionOrderWordIds.length || wordsDataService.getWordCount(heroLevel);
  const heroWordIndex = Math.min(heroProgress.currentIndex, heroWordCount);
  const heroPercent = heroWordCount > 0 ? (heroWordIndex / heroWordCount) * 100 : 0;
  const canContinue = heroProgress.sessionOrderWordIds.length > 0;
  const difficultCount = countIds(Object.values(progress.levels).map((level) => level.difficultWordIds));
  const favoriteCount = countIds(Object.values(progress.levels).map((level) => level.favoriteWordIds));
  const dailyPercent = Math.min(
    100,
    Math.round((progress.dailyGoal.completedWords / progress.dailyGoal.targetWords) * 100),
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

  function handleContinue() {
    if (canContinue) {
      router.push(`/words/practice/${heroLevel}`);
      return;
    }

    void goToWordsPractice();
  }

  return (
    <AppScaffold>
      <WordsIntroModal visible={wordsIntroVisible} onContinue={() => void continueAfterIntro()} />

      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <IconButton icon={Menu} accessibilityLabel="Menu" color={colors.text} />
          <View>
            <AppText variant="h2">Home</AppText>
            <AppText variant="small" color={colors.muted}>
              Dark learning dashboard
            </AppText>
          </View>
        </View>
        <View style={styles.topActions}>
          <IconButton
            icon={Users}
            accessibilityLabel="Switch profile"
            color={colors.text}
            onPress={() => {
              clearActiveProfile();
              router.replace("/");
            }}
          />
          <IconButton
            icon={Settings}
            accessibilityLabel="Open settings"
            color={colors.text}
            onPress={() => router.push("/settings")}
          />
        </View>
      </View>

      <LinearGradient colors={gradients.hero} start={[0, 0]} end={[1, 1]} style={styles.hero}>
        <View style={styles.avatarRing}>
          <AppText style={styles.avatar}>{profile.avatarEmoji ?? PROFILE_AVATARS[0]}</AppText>
        </View>
        <View style={styles.heroCopy}>
          <AppText variant="h2">Salam, {profile.name}! 👋</AppText>
          <AppText color={colors.textSoft}>Səviyyən: {heroLevel}</AppText>
          <AppText variant="small" color={colors.muted}>
            {heroConfig.title} · Word {heroWordIndex} / {heroWordCount}
          </AppText>
          <ProgressBar percent={heroPercent} height={8} color={colors.progress} trackColor="rgba(255,255,255,0.12)" />
        </View>
        <Pressable style={styles.heroButton} onPress={handleContinue}>
          <AppText style={styles.heroButtonText}>{canContinue ? "Davam et" : "Başla"}</AppText>
        </Pressable>
      </LinearGradient>

      <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
        <MetricCard
          icon={<Target color={colors.progress} size={22} />}
          title="Günlük hədəf"
          value={`${progress.dailyGoal.completedWords} / ${progress.dailyGoal.targetWords}`}
          detail="söz bugün"
          progress={dailyPercent}
        />
        <MetricCard
          icon={<Flame color={colors.primary} size={22} />}
          title="Streak"
          value={`${progress.currentDayStreak} gün`}
          detail={`Best: ${progress.bestDayStreak} gün`}
        />
        {!isMobile ? (
          <MetricCard
            icon={<Star color={colors.secondary} size={22} />}
            title="Səviyyə"
            value={heroLevel}
            detail={heroConfig.title}
          />
        ) : null}
      </View>

      <View style={styles.sectionHeader}>
        <AppText variant="h2">Dərslər</AppText>
        <AppText variant="small" color={colors.muted}>
          Sözlər, cümlələr və şəxsi təkrarlar
        </AppText>
      </View>

      <View style={styles.lessonGrid}>
        <DashboardTile
          title="Sözlər"
          subtitle="A1 · A2 · B1 · B2"
          icon={<BookOpen color={colors.background} size={24} />}
          gradient={gradients.words}
          onPress={() => void goToWordsPractice()}
        />
        <DashboardTile
          title="Cümlə təkrarı"
          subtitle="Repeat"
          icon={<MessageSquareText color={colors.white} size={24} />}
          gradient={gradients.repeat}
          onPress={() => router.push("/sentences")}
        />
        <DashboardTile
          title="Tərcümə & Danış"
          subtitle="Translate"
          icon={<Languages color={colors.white} size={24} />}
          gradient={gradients.translate}
          onPress={() => router.push("/sentences")}
        />
        <DashboardTile
          title="Favoritlər"
          subtitle={`${favoriteCount} söz`}
          icon={<Heart color={colors.white} size={24} />}
          gradient={gradients.favorites}
          onPress={() => router.push("/words/favorites")}
        />
        <DashboardTile
          title="Çətin sözlər"
          subtitle={`${difficultCount} söz`}
          icon={<AlertTriangle color={colors.white} size={24} />}
          gradient={gradients.difficult}
          onPress={() => router.push("/words/review-difficult")}
        />
        <DashboardTile
          title="Statistika"
          subtitle="İrəliləyiş"
          icon={<BarChart3 color={colors.white} size={24} />}
          gradient={gradients.stats}
          onPress={() => router.push("/statistics" as Href)}
        />
      </View>
    </AppScaffold>
  );
}

function MetricCard({
  icon,
  title,
  value,
  detail,
  progress,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  detail: string;
  progress?: number;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTop}>
        <View style={styles.metricIcon}>{icon}</View>
        <View style={styles.metricCopy}>
          <AppText variant="small" color={colors.muted} style={styles.metricLabel}>
            {title}
          </AppText>
          <AppText variant="h3">{value}</AppText>
          <AppText variant="small" color={colors.muted}>
            {detail}
          </AppText>
        </View>
      </View>
      {typeof progress === "number" ? (
        <ProgressBar percent={progress} height={7} color={colors.progress} trackColor="rgba(255,255,255,0.10)" />
      ) : null}
    </View>
  );
}

function DashboardTile({
  title,
  subtitle,
  icon,
  gradient,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  gradient: readonly [string, string];
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.tilePressable, pressed && styles.pressed]}
    >
      <LinearGradient colors={gradient} start={[0, 0]} end={[1, 1]} style={styles.tile}>
        <View style={styles.tileIcon}>{icon}</View>
        <View style={styles.tileCopy}>
          <AppText variant="h3" color={colors.white}>
            {title}
          </AppText>
          <AppText variant="small" color="rgba(255,255,255,0.82)">
            {subtitle}
          </AppText>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  topLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  topActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  hero: {
    minHeight: 140,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.glow,
  },
  avatarRing: {
    width: 76,
    height: 76,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatar: {
    fontSize: 38,
    lineHeight: 44,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  heroButton: {
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  heroButtonText: {
    color: colors.background,
    fontWeight: "900",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statsRowMobile: {
    flexDirection: "column",
  },
  metricCard: {
    flex: 1,
    minWidth: 180,
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  metricCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  metricLabel: {
    fontWeight: "800",
  },
  sectionHeader: {
    gap: spacing.xs,
  },
  lessonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  tilePressable: {
    flexGrow: 1,
    flexBasis: 170,
    minWidth: 150,
  },
  tile: {
    minHeight: 132,
    justifyContent: "space-between",
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  tileIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  tileCopy: {
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
});
