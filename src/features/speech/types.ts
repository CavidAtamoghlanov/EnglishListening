import type { SpeechErrorCode } from "./services/speechRecognitionService";

export type SpeechRecognitionState = {
  isAvailable: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  errorCode: SpeechErrorCode | null;
  lastConfidence: number | null;
  permissionDenied: boolean;
  isRecoverableError: boolean;
  shouldRecommendManualFallback: boolean;
};
