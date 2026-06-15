# Firestore Security Specification: WatchVault

This document outlines the data invariants, threat model, and "Dirty Dozen" malicious payloads designed to test our Zero-Trust Attribute-Based Access Control (ABAC) in Google Cloud Firestore.

## 1. Core Data Invariants

1. **User Ownership (PII Isolation)**:
   - A user profile (`/users/{userId}`) can only be created, read, updated, or deleted by the authenticated user whose `request.auth.uid` exactly matches the `{userId}`.
   - Users are strictly forbidden from reading or altering another user's profile or preferences.

2. **Immutable Identity**:
   - The `uid` in `/users/{userId}` must be immutable once created and must match `request.auth.uid`.
   - The owner of a watchlist entry under `/watchlist/{userId}/entries/{entryId}` is implicitly determined by the ancestral path `userId`, which must exactly match the authenticated user's ID.

3. **Schema Integrity & Value Poisoning Guards**:
   - All text inputs must undergo strict length checks (`size()`) to prevent storage abuse and script injection attacks.
   - All watchstatus values must be explicitly capped in both list definition and enum types: `status` must be either `planning`, `watching`, `paused`, `completed`, or `dropped`.
   - All type tags must be either `anime`, `tv`, or `movie`.

4. **Temporal Authenticity (Non-Spoofable Timestamps)**:
   - `createdAt` and `addedAt` are set to `request.time` on creation and are immutable.
   - `updatedAt` is updated to `request.time` on modification.

---

## 2. Threat Model: The "Dirty Dozen" Malicious Payloads

The following malicious request structures must be denied at the firewall layer:

### Payload 1: Profile Hijacking (Identity Spoofing)
An attacker tries to create a user document under another user's UID.
- **Request**: `setDoc(doc(db, 'users', 'victim_uid'), { uid: 'victim_uid', displayName: 'Attacker', email: 'attacker@gmail.com' })`
- **Auth context**: `auth.uid = 'attacker_uid'`
- **Target result**: `PERMISSION_DENIED`

### Payload 2: Ghost Field Value Poisoning
An attacker attempts to inject unapproved attributes (like `isAdmin: true` or custom fields) into their own user profile.
- **Request**: `setDoc(doc(db, 'users', 'my_uid'), { uid: 'my_uid', displayName: 'User', email: 'user@mail.com', isAdmin: true })`
- **Auth context**: `auth.uid = 'my_uid'`
- **Target result**: `PERMISSION_DENIED` (strictly bounded by exact keys validation size check)

### Payload 3: Cross-User List Insertion (Watchlist Hijack)
An attacker tries to add an entry to a victim's watchlist.
- **Request**: `addDoc(collection(db, 'watchlist/victim_uid/entries'), { title: 'Dune', type: 'movie', status: 'watching' })`
- **Auth context**: `auth.uid = 'attacker_uid'`
- **Target result**: `PERMISSION_DENIED`

### Payload 4: Invalid Status Enum Poisoning
An attacker tries to write an entry with an illegal status (e.g., `super-completed` or a 1MB string).
- **Request**: `addDoc(collection(db, 'watchlist/my_uid/entries'), { title: 'Dune', type: 'movie', status: 'mega-watched' })`
- **Auth context**: `auth.uid = 'my_uid'`
- **Target result**: `PERMISSION_DENIED`

### Payload 5: Denied Type Enum Injection
An attacker attempts to set type to an invalid category (e.g., `book`).
- **Request**: `addDoc(collection(db, 'watchlist/my_uid/entries'), { title: 'Book Title', type: 'book', status: 'planning' })`
- **Auth context**: `auth.uid = 'my_uid'`
- **Target result**: `PERMISSION_DENIED`

### Payload 6: Spoofed Relational Field (Invalid Parent)
An attacker attempts to create an entry pointing back to a non-existent TMDB ID, bypassing search boundaries.
- **Request**: `addDoc(collection(db, 'watchlist/my_uid/entries'), { externalId: '', title: 'Movie', type: 'movie', status: 'watching' })`
- **Auth context**: `auth.uid = 'my_uid'`
- **Target result**: `PERMISSION_DENIED` (empty `externalId` rejected by length verification)

### Payload 7: Client-Side Temporal Spoofing (Faked past date)
An attacker tries to set `addedAt` or `updatedAt` to a historical or future date to corrupt activity logs.
- **Request**: `addDoc(collection(db, 'watchlist/my_uid/entries'), { addedAt: '2020-01-01T00:00:00Z', updatedAt: '2020-01-01T00:00:00Z' })`
- **Auth context**: `auth.uid = 'my_uid'`
- **Target result**: `PERMISSION_DENIED` (must equal `request.time`)

### Payload 8: Immutable Attribute Lock-Opening
An attacker attempts to overwrite `addedAt` or the original `type` of a show on update.
- **Request**: `updateDoc(doc(db, 'watchlist/my_uid/entries/entry_id'), { type: 'movie' })` (where existing entry was `tv`)
- **Auth context**: `auth.uid = 'my_uid'`
- **Target result**: `PERMISSION_DENIED`

### Payload 9: Denial-of-Wallet Path Variable Poisoning
An attacker tries to register an entry under an extremely long, junk-character document ID to degrade index performance and raise storage costs.
- **Request**: `setDoc(doc(db, 'watchlist/my_uid/entries/', 'A'*1000), { ... })`
- **Auth context**: `auth.uid = 'my_uid'`
- **Target result**: `PERMISSION_DENIED`

### Payload 10: Anonymous Read Scraping (Query Trust Test Failure)
An unauthenticated or malicious scraper tries to run a list-query over all users' entries.
- **Request**: `getDocs(collectionGroup(db, 'entries'))` (without filtering by userId)
- **Auth context**: Unauthenticated or missing filter
- **Target result**: `PERMISSION_DENIED`

### Payload 11: Email Verification Spoofing
An attacker whose Google Auth account token lists `email_verified: false` tries to read database records.
- **Request**: `getDoc(doc(db, 'users', 'my_uid'))`
- **Auth context**: `auth.uid = 'my_uid'`, `auth.email_verified = false`
- **Target result**: `PERMISSION_DENIED` (requires verified auth status)

### Payload 12: Terminal State Overwrite
An entry that represents a completed status cannot have its core parameters altered or bypassed. All updates must conform to strict state transition allowances.
- **Request**: Changing restricted fields on an entry.
- **Auth context**: `auth.uid = 'my_uid'`
- **Target result**: `PERMISSION_DENIED` unless executing validated key differences.
