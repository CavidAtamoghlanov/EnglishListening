# Speech Recognition Audit

## Files Involved

- `src/features/speech/services/speechRecognitionService.ts`
  - Detects Web Speech API support.
  - Requests native speech permissions through `expo-speech-recognition`.
  - Starts native recognition with `continuous: false`.
- `src/features/speech/hooks/useSpeechRecognition.ts`
  - Owns the browser/native recognition lifecycle.
  - Exposes `start`, `stop`, `isListening`, `transcript`, `error`, and `manualFallbackRecommended`.
- `src/features/speech/hooks/useContinuousListening.ts`
  - Wraps `useSpeechRecognition` and restarts recognition while continuous mode is enabled.
- `src/app/words/practice/[level].tsx`
  - Creates contextual strings from the current word.
  - Submits final speech transcripts to `useWordsPractice`.
  - Uses `lastFinalSpeechKeyRef` to avoid duplicate speech submissions.
- `src/app/sentences/practice/[mode]/[level].tsx`
  - Creates contextual strings from the current sentence.
  - Submits final speech transcripts to `useSentencePractice`.
  - Uses the same final transcript guard pattern as Words Practice.
- `src/features/words/hooks/useWordsPractice.ts`
  - Receives speech/manual answers.
  - Currently checks both speech and manual answers with strict exact normalized matching.
- `src/features/sentences/hooks/useSentencePractice.ts`
  - Receives speech/manual answers.
  - Currently checks both speech and manual answers with strict exact normalized matching.

## Current Microphone Flow

1. Practice screen creates `useSpeechRecognition({ contextualStrings, onResult })`.
2. Practice screen passes that hook into `useContinuousListening`.
3. User presses the mic button in `LessonActionDock`.
4. `useContinuousListening.toggleContinuousListening()` starts speech recognition.
5. Web uses `SpeechRecognition` / `webkitSpeechRecognition`; native uses `expo-speech-recognition`.
6. Interim and final transcripts are passed to the practice screen.
7. The practice screen submits final transcripts to the module practice hook.
8. Correct answers are delayed for about two seconds before moving to the next item.
9. Continuous listening restarts after recognition ends, if it is still enabled.

## Current Error Types / Handling

Current handling is mostly raw:

- Web maps only `not-allowed` to a friendly permission message.
- Native maps only `not-allowed` to `permissionDenied`.
- Other errors such as `aborted`, `no-speech`, `audio-capture`, `network`, `service-not-allowed`, and dismissed permission prompts are surfaced directly or treated as generic failures.
- `manualFallbackRecommended` becomes true for any error, so recoverable events can disable the mic until the user restarts the flow.

## Suspected Reason For "Microphone Dismissed"

The likely root is a combination of speech API lifecycle events and broad error handling:

- Browser/native speech recognition often ends automatically after one utterance because recognition is started with `continuous: false`.
- Automatic end, user stop, skipped items, previous navigation, or restart races can produce `aborted` or dismissed-style errors.
- The current hook does not distinguish manual stop from real permission denial.
- Continuous listening can attempt restarts after transient errors, but also stops completely when any error sets `manualFallbackRecommended`.
- Practice screens call `speech.stop()` on Skip and Previous, which may produce aborted/dismissed events even though the user did not deny permission.

## Duplicate Logic

- Both Words and Sentences duplicate final transcript guard logic.
- Both screens duplicate continuous listening setup and mic error fallback UI.
- Strict answer checking is duplicated by module utility, while speech-specific tolerance does not exist.
- Error mapping is not shared between web/native paths.

## Recommended Fix Plan

1. Add speech diagnostics so Settings can show platform, support, permission, last error, and last transcript.
2. Improve speech recognition error normalization and friendly messages.
3. Add one shared `useSpeechPracticeController` that wraps `useSpeechRecognition`, owns mic toggle state, continuous restart logic, cleanup, and duplicate final transcript guards.
4. Keep manual typed fallback always available.
5. Add speech-only tolerant scoring at about 60-65% similarity while keeping typed/manual answer checking strict.
6. Apply tolerant scoring only when `source === "speech"` in Words and Sentences.
7. Add close-enough feedback with score and missing words.
8. Avoid stopping recognition on Skip/Previous unless the user explicitly toggles the mic off.
9. Add a small `test:speech-scoring` script to protect scoring behavior.
