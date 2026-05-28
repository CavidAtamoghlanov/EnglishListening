# EnglishVoicePractice

EnglishVoicePractice is a local-first English vocabulary speaking practice app for Azerbaijani speakers. It is built with Expo, React Native, TypeScript, Expo Router, local JSON word data, and local device/browser storage.

The app targets Android, iOS, and Web. The web export is ready for Vercel, Android builds are ready for EAS APK/AAB, and iOS is prepared for a later EAS/TestFlight workflow.

## Main Features

- Multiple local user profiles on the same device/browser.
- Profile picker on every app open. The app never auto-enters the last active profile.
- Per-profile vocabulary progress for **A1, A2, B1, and B2** (target **5000** words per level).
- Local shuffled word order saved per profile and level.
- Speaking practice with speech recognition where available.
- Manual typed answer fallback when voice recognition is unavailable or permission is denied.
- Text-to-speech replay with speed and accent preferences.
- Favorite words and difficult-word review modes.
- Daily goal, practice streak, level stats, and automatic local progress saving.
- Shared learning system with learning events, Mistake Review, spaced repetition, XP, daily learning path, and progress dashboard.
- Grammar Practice and Writing Practice use typing-only flows with profile-scoped progress.
- Settings for profile details, daily goal, voice settings, and destructive progress/profile actions.

## Local Multi-Profile Storage

Profiles are stored under:

```text
english-practice:profiles
```

Progress and settings are stored by profile ID:

```text
english-practice:progress:{profileId}
english-practice:settings:{profileId}
english-practice:learning-events:{profileId}
english-practice:review-queue:{profileId}
english-practice:xp:{profileId}
english-practice:daily-path:{profileId}
```

Names can repeat, but IDs are unique. Deleting a profile removes only that profile and only that profile's progress/settings. Other profiles are not affected.

Important limitation: profiles and progress are local to the current device or browser. Uninstalling the app or clearing browser storage can remove progress. There is no sync between devices because this project intentionally has no backend.

## Architecture

```text
src/
  app/                      Expo Router screens
  components/               Shared UI, layout, profile, word, and stat components
  data/words/               Local JSON vocabulary datasets
  data/sentences/           Local repeat/translate sentence datasets
  data/grammar/             Local grammar exercise datasets
  data/writing/             Local writing exercise datasets
  features/profile/         Profile hooks, services, and types
  features/progress/        Progress hooks, services, models, and streak/goal utilities
  features/settings/        Voice/settings hooks and storage service
  features/speech/          Speech recognition and text-to-speech abstractions
  features/words/           Practice hooks, word service, answer checking, validation utilities
  features/sentences/       Repeat and translate sentence practice
  features/grammar/         Typing-only grammar practice
  features/writing/         Typing-only writing practice
  features/learning/        Learning events, SRS review, XP, daily path, dashboard helpers
  storage/                  AsyncStorage wrapper and storage keys
  theme/                    Colors, spacing, typography, shadows
  utils/                    ID, date, and confirmation helpers
scripts/
  generateSampleWords.ts    Maintainer helper for regenerating sample JSON
  validateWords.ts          JSON validation report
  validateSentences.ts      Sentence schema and strict count validation
  validateGrammar.ts        Grammar exercise validation
  validateWriting.ts        Writing item validation
  validateLearning.ts       Learning module registry validation
```

## Installed Packages

Core runtime:

- `expo`
- `react`
- `react-native`
- `react-dom`
- `react-native-web`
- `expo-router`
- `@react-native-async-storage/async-storage`
- `expo-speech`
- `expo-speech-recognition`
- `lucide-react-native`
- `react-native-svg`
- `react-native-safe-area-context`
- `react-native-screens`
- `expo-linking`
- `expo-constants`
- `expo-status-bar`

Tooling:

- `typescript`
- `tsx`
- `eslint`
- `eslint-config-expo`
- `@types/node`
- `@types/react`

## Install

```bash
npm install
```

## Run

```bash
npm run web
npm run android
npm run ios
```

`npm run ios` requires macOS for native iOS simulator workflows.

## Validate Words

```bash
npm run validate:words
npm run validate:words:strict
npm run stats:words
```

- `validate:words` — schema and quality checks; reports `count / 5000` per level.
- `validate:words:strict` — same checks and requires exactly **5000** words per level.
- `stats:words` — counts, duplicates, ID issues, category distribution.

The validator checks valid JSON, required fields, unique IDs, unique English words inside each level, matching level fields, non-empty strings, examples, array fields, and whether `acceptedAnswers` includes the main English word.

See `WORD_DATA_GUIDE.md` for adding words in chunks and category rules.

## Validate Learning Data

```bash
npm run validate:sentences
npm run validate:sentences:strict
npm run validate:grammar
npm run validate:writing
npm run validate:learning
```

- `validate:sentences` validates schema and reports counts.
- `validate:sentences:strict` enforces the 5000-item target per sentence mode/level.
- Current known data gap: `src/data/sentences/translate/b1.json` has 10 items while the strict target is 5000.
- `validate:learning` checks the learning module registry and route duplicates.

See `LEARNING_SYSTEM.md`, `MODULES.md`, and `DATA_LOADING.md` for the learning layer and safe performance plan.

## Add New Words

Add items to:

```text
src/data/words/a1.json
src/data/words/a2.json
src/data/words/b1.json
src/data/words/b2.json
```

Use IDs like:

```text
a1_0001 … a1_5000
a2_0001 … a2_5000
b1_0001 … b1_5000
b2_0001 … b2_5000
```

Recommended: add seeds under `scripts/wordBank/seeds/` and run `npx tsx scripts/buildWordBank.ts`.

Each item must match:


```ts
type WordItem = {
  id: string;
  level: CEFRLevel;
  english: string;
  azeri: string;
  acceptedAnswers: string[];
  synonyms: string[];
  category: string;
  icon: string;
  imageKey?: string;
  exampleEn: string;
  exampleAz: string;
  hint?: string;
};
```

Run `npm run validate:words` after editing.

## Add New Levels

1. Add the level to `WORD_LEVELS` in `src/features/words/config/levels.ts`.
2. Add a JSON file under `src/data/words/`.
3. Register the static JSON import in `src/data/words/index.ts`.
4. Run `npm run validate:words` and `npm run typecheck`.

## Profiles And Progress

Create a profile from the profile picker or settings/profile management flow. Progress is created automatically for the new profile. To reset progress, open Settings and use either selected-level reset or all-progress reset. All destructive actions ask for confirmation.

## Learning Flow

Home shows Today's Plan, XP, and due Mistake Review. Wrong answers and skipped items are added to the profile's review queue without replacing existing module progress. Review uses a simple spaced repetition schedule: today, 1 day, 3 days, 7 days, 14 days, then 30 days after repeated correct reviews.

Before opening a new lesson, Home can gently offer review first when due items exist. The user can always continue the lesson; review never blocks learning.

## Web Deployment To Vercel

This repo includes `vercel.json`.

```bash
npm run export:web
```

Vercel should use:

```text
Build command: npm run export:web
Output directory: dist
```

## Android APK/AAB With EAS

Install and log in to EAS:

```bash
npm install -g eas-cli
eas login
```

Create an internal APK:

```bash
eas build -p android --profile preview
```

Create a production AAB:

```bash
eas build -p android --profile production
```

The `expo-speech-recognition` config plugin is already configured in `app.json`. Native speech recognition requires a development build or EAS build because it adds Android/iOS native permissions and configuration.

## iOS / TestFlight Readiness

The project is configured for iOS and supports tablets. Later, use:

```bash
eas build -p ios --profile production
```

Apple Developer credentials and TestFlight submission setup are still required.

## Speech Recognition Limitations

- Web uses the browser Web SpeechRecognition API when available.
- Native uses `expo-speech-recognition`.
- Some browsers do not support speech recognition.
- Native speech recognition can depend on OS services, language packs, permissions, and network/on-device recognizer availability.
- If speech recognition is unavailable or permission is denied, the practice screen remains usable through the manual typed answer fallback.

## Answer Checking

Answer checking is intentionally strict:

- Lowercase
- Trim
- Remove punctuation
- Collapse repeated spaces
- Compare to the main English word
- Compare to `acceptedAnswers`
- Synonyms are not accepted unless they are also in `acceptedAnswers`

This avoids accepting unrelated words such as `fruit` for `apple` unless `fruit` is explicitly listed as an accepted answer.
