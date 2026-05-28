# Learning System

This app now has a shared local-first learning layer around the existing practice modules.

## Profile Safety

All learning data is stored by `profileId`.

Storage keys:

- `english-practice:learning-events:{profileId}`
- `english-practice:review-queue:{profileId}`
- `english-practice:xp:{profileId}`
- `english-practice:daily-path:{profileId}`

Deleting a profile deletes only that profile's learning events, review queue, XP, and daily path.

## Learning Events

Words, Sentences, Grammar, and Writing record a `LearningEvent` after an answer or skip.

Events are side effects. Existing module progress remains the source of truth for each module.

Tracked results:

- `correct`
- `wrong`
- `skipped`

## Spaced Repetition

Wrong answers create or update a `ReviewItem`.

Schedule:

- New mistake: due today
- 1 correct review: due in 1 day
- 2 correct reviews: due in 3 days
- 3 correct reviews: due in 7 days
- 4 correct reviews: due in 14 days
- 5+ correct reviews: due in 30 days
- Wrong review: due today
- Skipped item: due later, without treating it exactly like a wrong answer

## Mistake Review

Route:

- `/review`
- `/review/practice`

The first version uses typed review for all source modules. Correct review answers move the item forward in the schedule and award review XP. Wrong review answers keep the item due today.

## Smart Review Prompt

Home gently prompts before starting a new lesson when the active profile has due review items. The prompt is optional: the learner can start Mistake Review or continue the selected lesson. It is shown once per lesson entry during the current app session so it stays helpful, not noisy.

## Statistics Dashboard

`/statistics` combines the original word/sentence stats with learning-system data:

- today XP and total XP
- level title
- due review count
- daily path completion
- grammar and writing totals when those modules exist
- strongest and weakest module based on local correct/wrong history

## Daily Path

The daily path is generated per profile and local date.

Current task mix:

- Review due mistakes first, when due items exist
- Practice words
- Practice sentences
- Do writing reps
- Fix grammar

Task completion is calculated from today's learning events.

## XP

XP is local, profile-scoped, and non-blocking.

Rules:

- Correct word: +10 XP
- Correct sentence: +12 XP
- Correct writing: +15 XP
- Correct grammar: +15 XP
- Correct review item: +20 XP
- 5-correct streak bonus: +10 XP
- Wrong or skipped item: +0 XP

Level titles:

- 0 XP: Beginner Explorer
- 500 XP: Daily Learner
- 1500 XP: Travel Speaker
- 3000 XP: Developer Communicator
- 6000 XP: Confident English User
