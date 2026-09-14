# Favorites frontend

The UI is available at `/favorites` and from the heart link in the signed-in navigation. Book cards on Home, Book List, Author Detail, and Book Detail share `FavoriteButton`.

## Temporary storage

`src/services/favorites.ts` is the browser storage adapter. Favorites are keyed by the authenticated user ID under `nexread:favorites:v1:<id>`. They survive refresh and logout on that browser, but do not sync across devices. Only book display fields are stored; no tokens or profile data. Storage failures are surfaced to the user. Auth changes clear the visible list before loading the next account; browser storage events synchronize open tabs.

## Backend integration

Suggested contract (not implemented):

- `GET /me/favorites`: return the signed-in user's favorite books.
- `POST /me/favorites` with `{ "bookId": "..." }`: add a favorite, preferably idempotently.
- `DELETE /me/favorites/:bookId`: remove a favorite.

Once endpoints exist, add a cookie-authenticated Next.js API proxy following `/api/cart`, replace the storage adapter with asynchronous API operations, and update FavoritesProvider loading/toggling to await them. Keep access tokens server-side, map backend book records with `mapBook`, and add pending state to prevent duplicate mutations. Remove the browser-only notice from FavoritesList when server persistence is enabled. Do not silently upload existing browser favorites; define an explicit migration flow if desired.
