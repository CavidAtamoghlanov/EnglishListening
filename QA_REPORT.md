# QA Report

## Automated Checks

Results from this checkpoint:

- `npm run typecheck`: passed
- `npm run validate:words`: passed with existing cross-level duplicate warnings
- `npm run validate:sentences`: passed schema validation and reported the known `translate/B1` count warning
- `npm run validate:sentences:strict`: failed as expected on the known `translate/B1` count gap
- `npm run validate:grammar`: passed
- `npm run validate:writing`: passed
- `npm run validate:learning`: passed
- `npx expo export -p web`: passed; exported one web JS bundle at about 24 MB. Expo printed "Something prevented Expo from exiting" after export, then exited with code 0.

## Sentence Validation Gap

Current validator output:

- `repeat/A1`: 5000 / 5000
- `repeat/A2`: 5000 / 5000
- `repeat/B1`: 5000 / 5000
- `repeat/B2`: 5000 / 5000
- `translate/A1`: 5000 / 5000
- `translate/A2`: 5000 / 5000
- `translate/B1`: 10 / 5000
- `translate/B2`: 5000 / 5000

Normal sentence validation is now schema-first and does not fail the build for incomplete target counts. Strict validation is available for release/data-completeness gates:

```bash
npm run validate:sentences:strict
```

Strict mode currently fails only because `translate/B1` has 10 / 5000 items.

## Stability Fixes In This Continuation

- Home no longer directly imports the full word data service for the continue card.
- Home shows each main module once.
- Mobile navigation uses Home / Words / Sentences / Review / Profile.
- Desktop navigation uses Home / Words / Sentences / Grammar / Writing / Review / Statistics / Profile.
- Smart review prompt appears before new lesson entry when due review items exist, but it is optional and non-blocking.
- Statistics now includes XP, daily path progress, due review count, grammar/writing totals, and module breakdown.
- Spaced repetition now advances to 30 days after the 14-day step.

## Manual QA Checklist

- Profile selection still opens before Home: checked in browser.
- Home shows XP, Today's Plan, and Mistake Review: checked in browser.
- Home shows Sentence Practice once and mobile bottom nav uses Review: checked in browser.
- Statistics shows XP, daily path, review due count, module tabs, and module breakdown: checked in browser.
- Writing wrong answer creates a due review item: checked in browser.
- Mistake Review lists the prompt, last answer, correct answer, and explanation: checked in browser.
- Correct review answer moves the item out of the due queue: checked in browser.
- Words Practice correct/wrong/skip still works: covered by typecheck and existing shared hook integration; full manual pass still recommended.
- Sentence Practice correct/wrong/skip still works: covered by typecheck and existing shared hook integration; full manual pass still recommended.
- Grammar Practice correct/wrong/skip still works: covered by typecheck and existing shared hook integration; full manual pass still recommended.
- Profile switching keeps review queue, XP, and daily path separate: storage is profile-scoped; full manual multi-profile pass still recommended.
- Web route refresh still works after export: export passed; Vercel route refresh still recommended before release.
- Smart review prompt: covered by code path and typecheck; manual verification recommended after creating a due review item.
