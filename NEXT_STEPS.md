# Next Steps

This checkpoint stops after the shared learning engine, XP, daily path, and Mistake Review Center.

## Remaining Major Modules

1. Developer English
   - Add routes under `src/app/developer-english`.
   - Add data under `src/data/developer-english`.
   - Add profile-scoped topic progress.
   - Record learning events and review items.

2. Mini Dialogues
   - Add routes under `src/app/dialogues`.
   - Add scenario data.
   - Add typed reply practice first.
   - Add optional TTS for system lines.

3. Listening Stories
   - Add routes under `src/app/listening-stories`.
   - Add 5 stories per level.
   - Use existing TTS service.
   - Add question answer checking and review recording.

4. Writing Journal
   - Add routes under `src/app/journal`.
   - Add profile-scoped journal storage.
   - Add local rule-based checks for common mistakes.

5. Data Loading Optimization
   - Add dynamic level/mode loading in a separate safe pass.
   - Start with new modules, then move to Words/Sentences.
   - Current safe improvement removed Home's direct word-bank import; full async migration is still deferred.

6. Sentence Data Gap
   - `translate/B1` still has 10 items while the current validator expects 5000.
   - Expand that JSON in a dedicated data task.

7. Optional Future Polish
   - Add Developer English, Mini Dialogues, Listening Stories, and Writing Journal in dedicated module passes.
   - Add richer chart visuals after the current View-based statistics dashboard has enough real learning history.

## Validation To Keep Running

```bash
npm run typecheck
npm run validate:words
npm run validate:sentences
npm run validate:grammar
npm run validate:writing
npm run validate:learning
npx expo export -p web
```
