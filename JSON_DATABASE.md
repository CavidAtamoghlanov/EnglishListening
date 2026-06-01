# JSON Cloud Database

## Why Static Frontend JSON Is Not Enough

Static JSON bundled into the Expo web app can be read by every deployed client, but a browser or mobile app cannot safely write back to those files. A deployed static frontend has no persistent writable filesystem and must not contain private storage credentials.

For cross-device sync, writes must go through server-side API routes.

## Architecture

The app stays local-first:

1. Practice screens save progress locally first.
2. Authenticated users can push/pull their user data through API routes.
3. API routes read and write JSON documents through a server-side storage adapter.
4. Static lesson data remains bundled/read-only and is not copied into user documents.

## Storage Documents

### `users.index.json`

Stores minimal account/auth metadata:

- `userId`
- `email`
- `normalizedEmail`
- `username`
- `displayName`
- `avatar`
- `passwordHash`
- `passwordSalt`
- timestamps
- `isActive`

This document is server-only. It is never returned raw to the client.

### `user-data/{userId}.json`

Stores learning state for one user:

- profile display name/avatar
- settings
- word progress
- sentence progress
- grammar progress
- writing progress
- learning events
- review queue
- XP
- daily path
- sync revision metadata

The document includes `schemaVersion` so future migrations can evolve the shape safely.

## Adapters

### Local Mock JSON Store

Used for local development only when `BLOB_READ_WRITE_TOKEN` is missing outside Vercel.

Path:

```text
.local-cloud-json/
```

This is not a cloud database and does not sync across devices.

### Vercel Blob JSON Store

Used when `BLOB_READ_WRITE_TOKEN` is configured.

The adapter stores private JSON blobs:

```text
english-practice/users.index.json
english-practice/user-data/{userId}.json
```

Storage credentials stay in server environment variables and are never imported into client code.

## Security Notes

- Passwords are salted and hashed with PBKDF2 before storage.
- API responses never include `passwordHash` or `passwordSalt`.
- User tokens are HMAC-signed with `AUTH_TOKEN_SECRET`.
- Normal sync endpoints only operate on the authenticated user's own data.
- Admin endpoints require `ADMIN_TOKEN` or `ADMIN_PIN`.
- This is appropriate for a small first version, not bank-grade identity infrastructure.

## Backup / Export / Import

Current checkpoint:

- Server stores user JSON in a documented shape.
- Admin endpoints can read summaries/details when protected by an admin token.

Recommended next step:

- Add user-facing "Export my data" and "Import my data" actions with confirmation.
- Add admin download of redacted user summaries only.

## Limitations

- Expo dev server does not run Vercel API functions. Use Vercel deployment or `vercel dev` for API testing.
- Local mock JSON storage is single-machine development storage only.
- Automatic sync after every practice write is not wired yet; Settings has manual Sync Now.
- Push requests include `baseRevision`; if the cloud revision changed, the server returns `conflict: true` with the current cloud document instead of overwriting it.
- The first merge UI is implemented for new registration. More nuanced conflict resolution should be added before heavy multi-device production use.

## Future Database Migration

If usage grows, this JSON document model can migrate to MongoDB/Postgres later:

- `users.index.json` becomes a users table/collection.
- `user-data/{userId}.json` becomes a user data document or module-specific documents.
- `schemaVersion` continues to drive migrations.
- API route contracts can stay mostly unchanged.
