# Data Loading

## Current State

The app still statically imports large local JSON files for existing word and sentence data.

Known impact:

- Expo web export works.
- The web JavaScript bundle is large because the word/sentence banks are bundled.
- Latest checked export emitted a single web JS bundle of about 25 MB.
- Home no longer imports the word data service just to show the continue card; it uses centralized level target counts until a session order exists.
- This checkpoint does not rewrite the core word/sentence practice services because changing synchronous data APIs to async loaders would touch the most important existing flows.

## Why Full Lazy Loading Is Deferred

Words and Sentences currently expose synchronous services. A true per-level dynamic JSON import would require async APIs through level screens, practice hooks, review lookups, favorites, difficult-word review, and previous-item panels. That should be done in a dedicated performance pass with browser and native QA after each service migration.

## Safe Optimization Plan

Recommended future work:

1. Add dynamic data loaders per module and level.
2. Keep each existing service API stable.
3. Start with new or small modules first.
4. Move Words and Sentences last because they have the largest JSON banks and most user-facing behavior.
5. Validate Expo web export after each service migration.

Suggested migration order:

1. Add async loader functions next to the existing services.
2. Migrate level selection screens first.
3. Migrate practice hooks for one module at a time.
4. Keep a small in-memory cache per level/mode.
5. Remove static `src/data/words/index.ts` and `src/data/sentences/index.ts` imports only after all callers are async-safe.

## Rules

- Do not fetch from a backend.
- Do not use a database.
- Keep data local-first.
- Keep Vercel web export working.
- Do not load all levels at startup if the service can load only the requested level/mode.
