import { useEffect } from "react";
import { Sparkles } from "lucide-react-native";
import { useRouter } from "expo-router";
import { PageHeader } from "../../components/common/PageHeader";
import { Grid } from "../../components/layout/Grid";
import { AppScaffold } from "../../components/layout/AppScaffold";
import { SENTENCE_MODES } from "../../features/sentences/config/modes";
import { SentenceModeCard } from "../../features/sentences/components/SentenceModeCard";
import { useActiveProfile } from "../../features/profile/hooks/useActiveProfile";
import { spacing } from "../../theme/spacing";

export default function SentencePracticeEntryScreen() {
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
        title="Sentence Practice"
        subtitle="Practice short sentences by speaking aloud."
        icon={Sparkles}
        onBack={() => router.back()}
      />

      <Grid minItemWidth={300} gap={spacing.lg}>
        {SENTENCE_MODES.map((mode) => (
          <SentenceModeCard
            key={mode.id}
            config={mode}
            onStart={() => router.push({ pathname: "/sentences/levels", params: { mode: mode.id } })}
          />
        ))}
      </Grid>
    </AppScaffold>
  );
}
