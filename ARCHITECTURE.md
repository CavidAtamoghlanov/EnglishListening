# Architecture Notes

EnglishVoicePractice is organized around reusable feature services plus small route screens. Profile, progress, settings, speech, storage, and theme live outside the Words module so future practice modules can share them.

## Extension Points

Central configs:

- `src/features/words/config/levels.ts`: canonical `WORD_LEVELS` (A1–B2, 5000 target each), `CEFR_LEVELS`, parsing helpers.
- `src/config/levels.ts`: re-exports from the words config for backward-compatible imports.
- `src/config/homeModules.ts`: Home menu modules and future module placeholders.
- `src/config/reviewModes.ts`: Words review modes and their progress fields.
- `src/data/words/index.ts`: Static word-data registry used by Metro/Expo.

Reusable services:

- `src/storage/storageService.ts`: local storage wrapper and profile-scoped keys.
- `src/features/profile/services/profileStorageService.ts`: profile CRUD.
- `src/features/progress/services/progressStorageService.ts`: profile-scoped progress persistence.
- `src/features/settings/services/settingsStorageService.ts`: profile-scoped settings.
- `src/features/speech/services/*`: speech recognition and text-to-speech abstraction.
- `src/features/words/services/wordsPracticeService.ts`: Words Practice business rules.
- `src/features/words/services/wordsDataService.ts`: word lookup/query API.

## CEFR levels and progress

The app supports **A1, A2, B1, and B2**. Each level targets **5000** vocabulary items in `src/data/words/{fileKey}.json`.

`createEmptyProgress()` builds a `levels` record for every entry in `CEFR_LEVELS`. When a profile is loaded, `progressStorageService.getProgress()` merges stored progress with empty slots for any newly added level, so existing profiles gain B2 (or future C1/C2) without losing other levels.

Level selection, home “continue learning”, settings reset, favorites, difficult-word review, and stats all iterate `WORD_LEVELS` / `CEFR_LEVELS` — never hardcode level arrays in screens.

## Add A New Level

Example: `C1`.

1. Add metadata to `WORD_LEVELS` in `src/features/words/config/levels.ts`.
2. Add `src/data/words/c1.json`.
3. Import and register it in `src/data/words/index.ts`.
4. Ensure every word has `level: "C1"` and IDs like `c1_0001` … `c1_5000`.
5. Add seeds under `scripts/wordBank/seeds/` and run `npx tsx scripts/buildWordBank.ts`, or edit JSON directly in chunks.
6. Run:

```bash
npm run validate:words
npm run stats:words
npm run typecheck
```

Screens, settings reset controls, review selectors, progress initialization, and validation all read the centralized level list.

## Add More Words

1. Edit the relevant JSON file in `src/data/words/`.
2. Keep IDs unique and sequential enough to maintain.
3. Keep `english` unique within the level.
4. Include the main English word inside `acceptedAnswers`.
5. Run `npm run validate:words` and `npm run stats:words`.

See `WORD_DATA_GUIDE.md` for the full data model, category rules, and chunk expansion workflow.

The app loads words only through `wordsDataService`; screens should not import JSON directly.

## Profile Progress Storage

Profiles are stored as one local list:

```text
english-practice:profiles
```

Progress and settings are stored separately by unique profile ID:

```text
english-practice:progress:{profileId}
english-practice:settings:{profileId}
```

The display name is never used as a storage key, so two people can both be named `Cavid` and still have isolated progress. Profile selection sets only an in-memory active profile for the current app session; reopening the app returns to the profile picker.

When a profile is deleted, `profileStorageService.deleteProfile(profileId)` removes that profile from the profile list and deletes only:

```text
english-practice:progress:{profileId}
english-practice:settings:{profileId}
```

Other profiles and their progress keys are not touched.

## Add A New Practice Module

Example: Sentence Practice.

1. Add or update its Home tile in `src/config/homeModules.ts`.
2. Create a feature folder under `src/features/sentences/`.
3. Reuse profile/progress/settings/storage hooks where possible.
4. Add routes under `src/app/sentences/`.
5. Keep module-specific business rules in feature services/hooks, not route screens.

Home is config-driven, so new modules should usually start by adding a module definition and route.

## Add A New Review Mode

Example: "recent mistakes".

1. Add the saved progress field to `LevelProgress` if the mode needs new persisted IDs.
2. Add the mode to `REVIEW_MODE_CONFIG` in `src/config/reviewModes.ts`.
3. Update `wordsPracticeService` only if the mode needs behavior beyond selecting IDs from progress.
4. Add a route screen that renders `ReviewModeSelection` for that mode, or create a custom selector if the mode needs special filtering.
5. Run `npm run typecheck`.

The practice screen uses `parsePracticeMode()` and `getPracticeModeConfig()`, and the hook delegates business rules to `wordsPracticeService`.
