import { useEffect } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet } from "react-native";
import { Screen } from "../../components/layout/Screen";
import { colors } from "../../theme/colors";
import { useActiveProfile } from "../../features/profile/hooks/useActiveProfile";
import { useFirstTimeModal } from "../../features/words/hooks/useFirstTimeModal";
import { WordsIntroModal } from "../../components/words/WordsIntroModal";

export default function WordsIndexScreen() {
  const router = useRouter();
  const { activeProfile } = useActiveProfile();
  const intro = useFirstTimeModal(activeProfile?.id);

  useEffect(() => {
    if (!activeProfile) {
      router.replace("/");
      return;
    }

    if (!intro.isLoading && !intro.isVisible) {
      router.replace("/words/levels");
    }
  }, [activeProfile, intro.isLoading, intro.isVisible, router]);

  async function continueAfterIntro() {
    intro.setIsVisible(false);
    await intro.markSeen();
    router.replace("/words/levels");
  }

  return (
    <Screen scroll={false} contentStyle={styles.center}>
      <WordsIntroModal visible={intro.isVisible} onContinue={() => void continueAfterIntro()} />
      <ActivityIndicator color={colors.primary} size="large" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
