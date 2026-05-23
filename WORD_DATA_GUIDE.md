# Word Data Guide

This app stores vocabulary in local JSON files under `src/data/words/`. Each CEFR level has its own file and a target size of **5000** practice items.

## Levels

| Level | File        | Target |
|-------|-------------|--------|
| A1    | `a1.json`   | 5000   |
| A2    | `a2.json`   | 5000   |
| B1    | `b1.json`   | 5000   |
| B2    | `b2.json`   | 5000   |

Central metadata lives in `src/features/words/config/levels.ts` (`WORD_LEVELS`). Screens and services read levels from this config — do not hardcode level lists in UI code.

## Word item shape

```json
{
  "id": "b2_0001",
  "level": "B2",
  "english": "authentication",
  "azeri": "autentifikasiya / istifadəçinin kimliyinin yoxlanması",
  "acceptedAnswers": ["authentication"],
  "synonyms": ["identity verification"],
  "category": "authentication",
  "icon": "🔐",
  "exampleEn": "The API requires authentication before returning user data.",
  "exampleAz": "API istifadəçi məlumatlarını qaytarmadan əvvəl autentifikasiya tələb edir.",
  "hint": "Optional short clue."
}
```

### Rules

- **IDs**: `{fileKey}_{####}` — e.g. `a1_0001` … `a1_5000`, sequential within the file.
- **`english`**: unique inside each level; avoid duplicates across levels when possible.
- **`acceptedAnswers`**: must include the main `english` value (synonyms alone are not accepted).
- **`synonyms`**: extra information only.
- **`azeri`**, **`exampleEn`**, **`exampleAz`**: natural Azerbaijani / English; no empty strings.
- Prefer **common, practical** words for an Azerbaijani backend developer (travel, work, APIs, SQL, meetings).

## Category guidance

- **A1**: everyday, family, food, numbers, colors, time, places, basic travel, basic verbs/adjectives, simple technology.
- **A2**: daily routine, shopping, directions, transport, hotel, restaurant, weather, health, work basics, simple technology/communication.
- **B1**: travel problems, social conversation, opinions, work communication, meetings, planning, software/backend/database/debugging/documentation basics.
- **B2**: professional communication, backend, C#, .NET, APIs, auth, SQL, logging, monitoring, deployment, architecture, cloud, code review, debugging, documentation, interviews, travel/social fluency.

## Add words (recommended workflow)

1. Add seeds to `scripts/wordBank/seeds/` (e.g. `b2.ts`, `a1Extra.ts`).
2. Run the merger:

   ```bash
   npx tsx scripts/buildWordBank.ts
   ```

   This keeps existing JSON entries, merges new seeds (by unique `english` per level), and reassigns sequential IDs.

3. Validate and inspect:

   ```bash
   npm run validate:words
   npm run stats:words
   ```

4. Run `npm run typecheck` before committing.

Expand in **chunks** (e.g. 200–500 words), validate after each chunk, and stop if quality drops.

## Add a new level (e.g. C1)

1. Add an entry to `WORD_LEVELS` in `src/features/words/config/levels.ts`.
2. Create `src/data/words/c1.json`.
3. Register the import in `src/data/words/index.ts`.
4. Run `npm run validate:words` and `npm run typecheck`.

Progress, settings reset, review modes, and level selection pick up new levels automatically via `CEFR_LEVELS`.

## Validation commands

| Command | Purpose |
|---------|---------|
| `npm run validate:words` | Schema, IDs, uniqueness, `acceptedAnswers`; warns if count &lt; 5000 |
| `npm run validate:words:strict` | Same checks **and** requires exactly 5000 words per level |
| `npm run stats:words` | Counts, duplicates, ID issues, category distribution |

## Maintainer scripts

- `scripts/buildWordBank.ts` — merge seed files into JSON.
- `scripts/generateSampleWords.ts` — legacy sample generator (101 words per level).
- `scripts/validateWords.ts` — CLI validation entry.
- `scripts/wordStats.ts` — detailed statistics report.

## Example B2 entry

```json
{
  "id": "b2_0001",
  "level": "B2",
  "english": "authentication",
  "azeri": "autentifikasiya / istifadəçinin kimliyinin yoxlanması",
  "acceptedAnswers": ["authentication"],
  "synonyms": ["identity verification", "login verification"],
  "category": "authentication",
  "icon": "🔐",
  "exampleEn": "The API requires authentication before returning user data.",
  "exampleAz": "API istifadəçi məlumatlarını qaytarmadan əvvəl autentifikasiya tələb edir.",
  "hint": "Used when the system checks who the user is."
}
```
