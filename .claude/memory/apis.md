---
name: External APIs in use
description: Moxfield API usage, CORS behaviour, Scryfall image URLs, and YouTube thumbnail conventions
type: reference
---

## Moxfield (src/lib/moxfield.js)

Unofficial API — no public documentation, no auth required for public decks.

- **Base URL:** `https://api2.moxfield.com/v3` — called server-side directly (no proxy needed)
- **Deck endpoint:** `GET /decks/all/{deckId}` — returns full deck object
- **Response parsing:** `parseMoxfieldDeck(data)` → `{ name, format, cardCount, commanders, viewCount, likeCount, updatedAt, publicUrl }`
- **Decklist building:** `buildDecklist(data)` → `{ commanders, mainboard, sideboard }` — each card normalised to `{ quantity, name, typeLine, manaCost, cmc, imageUrl }`

**CORS:** Not an issue — fetch runs server-side in Next.js Server Components. Browser never touches `api2.moxfield.com`. A browser User-Agent and Referer header are sent to pass Moxfield's bot filter.

**Caching:** Moxfield is called once at build time (`next build` statically renders every deck page). All pages are fully static — no runtime revalidation. Deck data refreshes on the next deploy.

**Graceful degradation:** The deck detail page wraps the Moxfield fetch in try/catch. If it fails, `decklist` and `moxfield` are null and the page falls back to `deck.txt`, or links to Moxfield if no local file exists.

**Iframe removed:** The Moxfield iframe embed was replaced with a custom `DecklistViewer` component that renders card images fetched from the API.

## Scryfall
Three uses:
1. **Static art in frontmatter** — art crop URLs copied manually. Format: `https://cards.scryfall.io/art_crop/front/{a}/{b}/{uuid}.jpg`
2. **Card hover previews (runtime, client-side)** — `MarkdownContent.jsx` fetches card images on hover via:
   `https://api.scryfall.com/cards/named?format=image&version=normal&fuzzy={encodedName}`
   No auth required. Called directly from the browser (no CORS issue — Scryfall allows public access).
3. **Deck image enrichment (server-side, `src/lib/scryfall.js` + `scripts/warm-cache.js`)** — resolves card names → image URLs and stores them in `.cache/scryfall-cards.json` (gitignored, baked into Docker image).

   **Endpoint used:** `POST /cards/collection` — up to 75 identifiers per request, returns `image_uris` directly. Far more efficient than per-card GET. Unmatched cards fall back to `GET /cards/named?fuzzy=`.

   **Key detail — split card name mapping:** Scryfall returns split cards as `"Front // Back"` but deck.txt files only list `"Front"`. `resolveBatch` maps returned cards back to their input name via a lowercase index, splitting on ` // ` to match front-face names.

   **Cache lifecycle:**
   - `npm run build` → `prebuild` runs `scripts/warm-cache.js` first: reads all `deck.txt` files, batches all unique card names into POST calls, writes results to `.cache/scryfall-cards.json`. `next build` then reads entirely from the warm cache — zero Scryfall calls during static render.
   - `docker build` → `.cache/` copied from build stage into serve image (`COPY --from=build /app/.cache ./.cache`). Cache is baked in.
   - `npm run dev` → no prebuild; cache populated lazily on first page visit per card.
   - Running container → cache reads only; any runtime write (missing card) is ephemeral and lost on next deploy. Rebuild to persist.

   MTGA-parsed cards carry `set` + `collectorNumber` used to build Scryfall card page links (`/card/{set}/{number}`); other cards fall back to `search?q=!"{name}"`.

## YouTube
Not called at runtime. Thumbnail URLs follow a predictable pattern:
- `https://img.youtube.com/vi/{youtubeId}/maxresdefault.jpg`

`VideoCard` and the content scroll strip use this pattern as the default when no `thumbnail` field is provided in frontmatter.

## Google Fonts
Loaded via `next/font/google` in `src/app/layout.jsx` — self-hosted at build time, no CDN dependency.
Fonts in use: **Space Grotesk** (display/headings, `--font-display` CSS var), **Inter** (body, `--font-sans` CSS var).
