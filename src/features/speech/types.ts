export type SpeechRecognitionState = {
  isAvailable: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  permissionDenied: boolean;
};
