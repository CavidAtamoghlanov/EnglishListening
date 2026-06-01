# Responsive UI Audit

## Screens Inspected

- Home: `src/app/home.tsx`
- Profile picker: `src/app/index.tsx`
- Create profile: `src/app/profile/create.tsx`
- Manage profiles: `src/app/profile/manage.tsx`
- Settings: `src/app/settings/index.tsx`
- Words level selection: `src/app/words/levels.tsx`
- Words lesson/practice: `src/app/words/practice/[level].tsx`
- Sentence entry: `src/app/sentences/index.tsx`
- Sentence level selection: `src/app/sentences/levels.tsx`
- Sentence lesson/practice: `src/app/sentences/practice/[mode]/[level].tsx`
- Grammar lesson/practice: `src/app/grammar/practice/[mode]/[level].tsx`
- Writing lesson/practice: `src/app/writing/practice/[mode]/[level].tsx`
- Review practice: `src/app/review/practice.tsx`
- Statistics: `src/app/statistics.tsx`
- Auth login/register: `src/app/auth/login.tsx`, `src/app/auth/register.tsx`
- Shared layout/navigation: `src/components/layout/Screen.tsx`, `src/components/layout/AppScaffold.tsx`, `src/components/common/AppNavigation.tsx`
- Lesson layout components: `src/components/lesson/*`

## Mobile Issues Found

- The shared lesson shell renders the full lesson as one vertical scroll column. On iPhone-sized screens, the prompt card, action dock, feedback, input, previous panel, stats, and bottom nav all compete for the same vertical space.
- The prompt card has a mobile `minHeight` of 286px, which pushes manual answer controls below the first viewport.
- Manual answer for Words/Sentences is collapsed by default and placed after the action dock, so a typing user must open it below several controls.
- When the keyboard opens, the current prompt can scroll out of view because the answer input is not directly adjacent to a compact prompt card.
- Previous item and stats panels are fully expanded on mobile and can dominate the lower part of the lesson.
- The lesson bottom navigation is fixed, but the lesson scroll area does not account for keyboard height and uses a fixed bottom padding.
- Global `Screen` lacks `keyboardShouldPersistTaps`, `keyboardDismissMode`, and keyboard avoiding behavior, which makes form-heavy screens less predictable on mobile.
- Some dashboard cards use desktop-friendly row layouts that can become visually crowded on 360-390px widths.

## Tablet Issues Found

- Tablet lesson layout uses side panels, which is good, but the main lesson card remains tall and can make the input feel detached.
- Some grids rely on `flexWrap` and `minWidth`; this generally works, but card heights vary between modules.

## Desktop Issues Found

- Most dashboard pages use centered max-width containers through `AppScaffold`.
- Lesson pages use a centered main area with side panels, but the lesson card can still feel oversized relative to the answer/input workflow.
- Sidebar layout is stable and not duplicated on wide screens.

## Lesson-Specific Usability Problems

- Words Practice: Azerbaijani prompt is high on the page, while manual input is hidden/collapsed below the action dock.
- Sentence Repeat/Translate: long sentences and chips increase card height, pushing typing controls down.
- Grammar: the input is visible, but it comes after feedback/actions; on mobile the prompt and input can feel separated.
- Writing: writing input is present, but it appears below actions and feedback; the prompt can move away when the keyboard opens.
- Review: the review prompt card has a large minimum height, with actions before the input. The answer input should be closer to the prompt.

## Files That Need Changes

- `src/components/layout/Screen.tsx`
- `src/components/lesson/LessonShell.tsx`
- `src/components/lesson/LessonCard.tsx`
- `src/components/lesson/LessonManualAnswerSheet.tsx`
- `src/components/lesson/LessonActionDock.tsx`
- `src/components/lesson/LessonPreviousPanel.tsx`
- `src/components/lesson/LessonStatsPanel.tsx`
- `src/app/words/practice/[level].tsx`
- `src/app/sentences/practice/[mode]/[level].tsx`
- `src/app/grammar/practice/[mode]/[level].tsx`
- `src/app/writing/practice/[mode]/[level].tsx`
- `src/app/review/practice.tsx`

The safest approach is to improve the shared layout primitives first, then reorder only the lesson UI controls so prompt and answer stay together without touching business logic.
