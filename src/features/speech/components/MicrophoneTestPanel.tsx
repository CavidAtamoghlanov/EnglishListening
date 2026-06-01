import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Mic, RefreshCw, Square, Stethoscope } from "lucide-react-native";
import { AppButton } from "../../../components/common/AppButton";
import { AppCard } from "../../../components/common/AppCard";
import { AppText } from "../../../components/common/AppText";
import { IconBubble } from "../../../components/common/IconBubble";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { useSpeechPracticeController } from "../hooks/useSpeechPracticeController";
import {
  speechDiagnosticsService,
  type SpeechDiagnosticSnapshot,
} from "../services/speechDiagnosticsService";

function formatBoolean(value: boolean): string {
  return value ? "Yes" : "No";
}

export function MicrophoneTestPanel() {
  const [recognizedText, setRecognizedText] = useState("");
  const [snapshot, setSnapshot] = useState<SpeechDiagnosticSnapshot | null>(null);

  const refreshDiagnostics = useCallback(async () => {
    setSnapshot(await speechDiagnosticsService.getSnapshot());
  }, []);

  const speech = useSpeechPracticeController({
    contextualStrings: ["hello", "test", "english practice"],
    canListen: true,
    hasActiveItem: true,
    itemKey: "settings-microphone-test",
    onTranscript: (transcript) => {
      setRecognizedText(transcript);
    },
    onFinalResult: (transcript) => {
      setRecognizedText(transcript);
    },
  });

  useEffect(() => {
    void refreshDiagnostics();
  }, [refreshDiagnostics, speech.isListening, speech.lastError, speech.transcript]);

  const supportMessage = snapshot?.isSupported
    ? "Speech recognition is available here."
    : "Speech recognition is not available here. Manual answers still work.";
  const permissionMessage = snapshot
    ? `Permission: ${snapshot.microphonePermissionState}`
    : "Permission: checking...";

  return (
    <AppCard tone="blue" padding="lg">
      <View style={styles.sectionHeader}>
        <IconBubble icon={Stethoscope} backgroundColor={colors.surfaceAlt} color={colors.teal} />
        <View style={styles.sectionCopy}>
          <AppText variant="h2">Microphone Test</AppText>
          <AppText color={colors.muted}>
            Check speech support, permission, and the last recognized text.
          </AppText>
        </View>
      </View>

      <View style={styles.statusGrid}>
        <StatusItem label="Platform" value={snapshot?.platform ?? "checking"} />
        <StatusItem label="Supported" value={snapshot ? formatBoolean(snapshot.isSupported) : "checking"} />
        <StatusItem label="Web Speech API" value={snapshot ? formatBoolean(snapshot.hasWebSpeechRecognition) : "checking"} />
        <StatusItem label="Secure Context" value={snapshot?.isHttps === null ? "native" : formatBoolean(Boolean(snapshot?.isHttps))} />
        <StatusItem label="Permission" value={snapshot?.microphonePermissionState ?? "checking"} />
        <StatusItem label="Confidence" value={snapshot?.lastConfidence ? `${Math.round(snapshot.lastConfidence * 100)}%` : "n/a"} />
      </View>

      <View style={styles.testBox}>
        <AppText variant="label" color={colors.muted}>
          Test transcript
        </AppText>
        <AppText style={styles.transcript}>
          {recognizedText || speech.interimTranscript || speech.transcript || "Press Start Test and say a short English phrase."}
        </AppText>
        <AppText color={speech.lastError ? colors.danger : colors.muted}>
          {speech.lastError ?? supportMessage}
        </AppText>
        <AppText color={colors.muted}>{permissionMessage}</AppText>
      </View>

      <View style={styles.actions}>
        <AppButton
          icon={speech.isMicActive ? Square : Mic}
          variant={speech.isMicActive ? "danger" : "primary"}
          onPress={speech.toggleListening}
          disabled={speech.manualFallbackRecommended}
        >
          {speech.isMicActive ? "Stop Test" : "Start Test"}
        </AppButton>
        <AppButton variant="secondary" icon={RefreshCw} onPress={() => void refreshDiagnostics()}>
          Refresh
        </AppButton>
      </View>

      <AppText variant="small" color={colors.muted}>
        If microphone recognition does not work, every practice screen still supports typing your answer.
      </AppText>
    </AppCard>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusItem}>
      <AppText variant="small" color={colors.muted}>
        {label}
      </AppText>
      <AppText style={styles.statusValue}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  sectionCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statusItem: {
    minWidth: 132,
    flexGrow: 1,
    gap: 2,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusValue: {
    color: colors.text,
    fontWeight: "800",
  },
  testBox: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transcript: {
    color: colors.text,
    fontWeight: "800",
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
