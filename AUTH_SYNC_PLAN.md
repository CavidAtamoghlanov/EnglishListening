# Auth And Sync Plan

## Current Local Storage

The app is currently local-first. All learning state is stored in AsyncStorage/browser storage with the `english-practice` prefix.

Current keys:

- `english-practice:profiles`
- `english-practice:progress:{profileId}`
- `english-practice:sentence-progress:{profileId}`
- `english-practice:grammar-progress:{profileId}`
- `english-practice:writing-progress:{profileId}`
- `english-practice:learning-events:{profileId}`
- `english-practice:review-queue:{profileId}`
- `english-practice:xp:{profileId}`
- `english-practice:daily-path:{profileId}`
- `english-practice:settings:{profileId}`

## Current Profile Model

Local profiles use:

```ts
type UserProfile = {
  id: string;
  name: string;
  avatarEmoji?: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
};
```

Progress is separated by `profileId`. Names can repeat. Deleting a profile deletes only that profile's local progress/settings/learning data.

## What Will Sync

Cloud sync should store only user-owned state, not static lesson content:

- profile display name/avatar
- voice/settings data
- word progress, including favorites and difficult IDs
- sentence progress
- grammar progress when present
- writing progress when present
- learning events
- review queue
- XP
- daily path
- future user-generated data such as journal entries

## What Stays Local

- static word JSON
- static sentence JSON
- static grammar/writing exercise JSON
- temporary UI state
- selected local/offline profile state
- local mock sync data used during development

## JSON Document Model

Auth metadata is stored separately from user learning data.

`users.index.json`:

```ts
type UserIndexRecord = {
  userId: string;
  email: string;
  normalizedEmail: string;
  username: string;
  displayName: string;
  avatar: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
};
```

`user-data/{userId}.json`:

```ts
type UserCloudData = {
  schemaVersion: number;
  userId: string;
  email: string;
  username: string;
  profile: {
    displayName: string;
    avatar: string;
    activeLevel?: "A1" | "A2" | "B1" | "B2";
    createdAt: string;
    updatedAt: string;
  };
  settings: unknown;
  wordProgress: unknown;
  sentenceProgress: unknown;
  grammarProgress?: unknown;
  writingProgress?: unknown;
  learningEvents?: unknown[];
  reviewQueue?: unknown[];
  xp?: unknown;
  dailyPath?: unknown;
  favorites?: unknown;
  difficultItems?: unknown;
  statistics?: unknown;
  sync: {
    updatedAt: string;
    lastPulledAt?: string;
    lastPushedAt?: string;
    revision: number;
  };
};
```

## Storage Adapters

The client must never write directly to cloud JSON storage. API routes own persistence.

Adapters:

- `localMockJsonStore`: server-side local development fallback using local JSON files. This does not sync across devices and is not production storage.
- `vercelBlobJsonStore`: server-side Vercel Blob adapter using `BLOB_READ_WRITE_TOKEN`. Storage tokens stay on the server.

## API Shape

Initial endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/sync/pull`
- `POST /api/sync/push`
- `GET /api/admin/users`
- `GET /api/admin/users/:userId`

Passwords are salted and hashed server-side. API responses never include password hashes or salts. User tokens are HMAC-signed and stored client-side.

## Migration Strategy

The first sync-enabled version should keep local profiles working.

When a user logs in/registers and a local active profile exists:

1. Ask whether to merge this device's local progress into the account.
2. Merge module progress by preserving completed IDs and choosing newer `updatedAt` snapshots when clear.
3. Preserve favorites, difficult items, review queue, XP, daily path, and settings.
4. If conflict handling is unclear, never delete cloud data automatically.
5. Save merged data locally under a cloud-linked profile and queue a push.

## Stable Checkpoint Scope

Because full auth + cloud sync touches routing, storage, server APIs, migration, admin, and all progress services, the safe first checkpoint is:

- auth/sync types
- server-side JSON storage adapters
- server auth helpers
- Vercel-compatible API routes
- client auth/session service
- login/register screens with offline option
- local data snapshot builder/restorer
- manual pull/push service
- users JSON validator
- docs and env example

Automatic sync after every progress change and full local-profile merge UI can follow once the foundational API is verified.
