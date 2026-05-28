# Implementation Plan

## Stable Checkpoint Scope

This pass adds the shared learning system around the existing app without rebuilding existing modules.

Completed in this checkpoint:
- Phase 1: Learning Engine Foundation
- Phase 2: Spaced Repetition
- Phase 3: Mistake Review Center
- Phase 4: Daily Learning Path
- Phase 5: XP and level titles
- Phase 6: Smart review prompt before new lessons
- Phase 7: Progress dashboard expansion
- Phase 8: Low-risk data-loading cleanup

Deferred to `NEXT_STEPS.md`:
- Developer English
- Mini Dialogues
- Listening Stories
- Writing Journal
- Full async large JSON data-loading optimization

## Safety Rules

- Keep all existing module progress storage intact.
- Add learning events and review items as side effects only.
- Keep storage separated by `profileId`.
- Do not modify existing word, sentence, grammar, or writing JSON data.
- Keep Expo Router web export compatible.
- Keep mobile bottom navigation and desktop sidebar routes real.

## Implementation Order

1. Add shared learning types, storage keys, storage services, and helpers.
2. Add spaced repetition queue logic.
3. Add XP service with local profile-scoped state.
4. Add daily path generation from due reviews and installed modules.
5. Record learning events from Words, Sentences, Grammar, and Writing answer hooks.
6. Add Review Center screens and typed review practice.
7. Integrate due review count, daily path, and XP into Home.
8. Add optional smart review prompt before lesson entry.
9. Expand Statistics with XP, due review, daily path, and module totals.
10. Add learning validation and documentation.
11. Run typecheck, validators, and web export.

## Validation

Commands for this checkpoint:

```bash
npm run typecheck
npm run validate:words
npm run validate:sentences
npm run validate:grammar
npm run validate:writing
npm run validate:learning
npx expo export -p web
```

Known existing issue: `validate:sentences` may fail because `translate/B1` has 10 items while the validator target is 5000. This checkpoint does not edit sentence JSON data.
