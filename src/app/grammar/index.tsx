import { useEffect } from "react";
import { ClipboardCheck } from "lucide-react-native";
import { useRouter } from "expo-router";
import { PageHeader } from "../../components/common/PageHeader";
import { Grid } from "../../components/layout/Grid";
import { AppScaffold } from "../../components/layout/AppScaffold";
import { GRAMMAR_MODES } from "../../features/grammar/config/modes";
import { GrammarModeCard } from "../../features/grammar/components/GrammarModeCard";
import { useActiveProfile } from "../../features/profile/hooks/useActiveProfile";
import { spacing } from "../../theme/spacing";

export default function GrammarPracticeEntryScreen() {
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
    <AppScaffold maxWidth={1100}>
      <PageHeader
        title="Grammar Practice"
        subtitle="Learn grammar by writing and fixing practical English sentences."
        icon={ClipboardCheck}
        onBack={() => router.back()}
      />

      <Grid minItemWidth={300} gap={spacing.lg}>
        {GRAMMAR_MODES.map((mode) => (
          <GrammarModeCard
            key={mode.id}
            config={mode}
            onStart={() => router.push(`/grammar/levels/${mode.id}`)}
          />
        ))}
      </Grid>
    </AppScaffold>
  );
}
