import { useEffect } from "react";
import { FilePenLine } from "lucide-react-native";
import { useRouter } from "expo-router";
import { PageHeader } from "../../components/common/PageHeader";
import { Grid } from "../../components/layout/Grid";
import { AppScaffold } from "../../components/layout/AppScaffold";
import { WRITING_MODES } from "../../features/writing/config/modes";
import { WritingModeCard } from "../../features/writing/components/WritingModeCard";
import { useActiveProfile } from "../../features/profile/hooks/useActiveProfile";
import { spacing } from "../../theme/spacing";

export default function WritingPracticeEntryScreen() {
  const router = useRouter();
  const { activeProfile } = useActiveProfile();

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
    }
  }, [activeProfile, router]);

  if (!activeProfile) {
    return null;
  }

  return (
    <AppScaffold maxWidth={1120}>
      <PageHeader
        title="Writing Practice"
        subtitle="Improve English writing with short daily exercises."
        icon={FilePenLine}
        onBack={() => router.back()}
      />

      <Grid minItemWidth={300} gap={spacing.lg}>
        {WRITING_MODES.map((mode) => (
          <WritingModeCard
            key={mode.id}
            config={mode}
            onStart={() => router.push(`/writing/levels/${mode.id}`)}
          />
        ))}
      </Grid>
    </AppScaffold>
  );
}
