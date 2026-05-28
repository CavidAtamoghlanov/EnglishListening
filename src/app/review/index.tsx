import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import type { Href } from "expo-router";
import { BookOpen, ClipboardCheck, FilePenLine, MessageSquareText, RefreshCw } from "lucide-react-native";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppText } from "../../components/common/AppText";
import { EmptyState } from "../../components/common/EmptyState";
import { PageHeader } from "../../components/common/PageHeader";
import { SegmentedControl } from "../../components/common/SegmentedControl";
import { AppScaffold } from "../../components/layout/AppScaffold";
import { getLearningModuleConfig } from "../../features/learning/config/moduleRegistry";
import { useReviewQueue, type ReviewQueueFilter } from "../../features/learning/hooks/useReviewQueue";
import { useActiveProfile } from "../../features/profile/hooks/useActiveProfile";
import { colors } from "../../theme/colors";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { formatFriendlyDate } from "../../utils/date";

const filters: { label: string; value: ReviewQueueFilter }[] = [
  { label: "All", value: "all" },
  { label: "Words", value: "words" },
  { label: "Sentences", value: "sentences" },
  { label: "Grammar", value: "grammar" },
  { label: "Writing", value: "writing" },
];

const moduleIcons = {
  words: BookOpen,
  sentences: MessageSquareText,
  grammar: ClipboardCheck,
  writing: FilePenLine,
} as const;

export default function ReviewCenterScreen() {
  const router = useRouter();
  const { activeProfile } = useActiveProfile();
  const [filter, setFilter] = useState<ReviewQueueFilter>("all");
  const { items, reload } = useReviewQueue(activeProfile?.id, filter);

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
    }
  }, [activeProfile, router]);

  useFocusEffect(
    useCallback(() => {
      if (activeProfile?.id) {
        void reload();
      }
    }, [activeProfile?.id, reload]),
  );

  if (!activeProfile) {
    return null;
  }

  return (
    <AppScaffold maxWidth={1060}>
      <PageHeader
        title="Mistake Review"
        subtitle="Review the items that need another round."
        icon={RefreshCw}
        onBack={() => router.back()}
      />

      <AppCard tone="yellow" padding="lg">
        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <AppText variant="h2">Due now: {items.length}</AppText>
            <AppText color={colors.muted}>
              Wrong answers and skipped items are scheduled here with simple spaced repetition.
            </AppText>
          </View>
          <AppButton
            icon={RefreshCw}
            disabled={items.length === 0}
            onPress={() => router.push(`/review/practice?filter=${filter}` as Href)}
          >
            Start Review
          </AppButton>
        </View>
      </AppCard>

      <SegmentedControl options={filters} value={filter} onChange={setFilter} />

      {items.length === 0 ? (
        <EmptyState
          icon="OK"
          title="No due review"
          message="Fresh board. New mistakes or skipped items will appear here automatically."
        />
      ) : (
        <View style={styles.list}>
          {items.slice(0, 30).map((item) => {
            const config = getLearningModuleConfig(item.sourceModule);
            const Icon = moduleIcons[item.sourceModule as keyof typeof moduleIcons] ?? RefreshCw;
            return (
              <AppCard key={item.id} padding="lg" style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.moduleBadge}>
                    <Icon color={colors.primary} size={18} />
                    <AppText variant="small" color={colors.primary}>
                      {config.shortTitle}
                      {item.level ? ` · ${item.level}` : ""}
                    </AppText>
                  </View>
                  <AppText variant="small" color={colors.muted}>
                    Due {formatFriendlyDate(item.dueAt)}
                  </AppText>
                </View>
                <AppText variant="h3">{item.prompt}</AppText>
                {item.userAnswer ? (
                  <AppText color={colors.danger}>Last answer: {item.userAnswer}</AppText>
                ) : null}
                <AppText color={colors.success}>Correct: {item.correctAnswer}</AppText>
                {item.explanationAz ? (
                  <AppText variant="small" color={colors.muted}>
                    {item.explanationAz}
                  </AppText>
                ) : null}
              </AppCard>
            );
          })}
        </View>
      )}
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  heroCopy: {
    flex: 1,
    minWidth: 220,
    gap: spacing.xs,
  },
  list: {
    gap: spacing.md,
  },
  itemCard: {
    borderColor: colors.borderStrong,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  moduleBadge: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: "rgba(255,210,31,0.24)",
  },
});
