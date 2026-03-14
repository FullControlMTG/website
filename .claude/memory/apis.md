---
name: External APIs in use
description: Moxfield API usage, CORS behaviour, Scryfall image URLs, and YouTube thumbnail conventions
type: reference
---

## Moxfield (src/api/moxfield.js)

Unofficial API — no public documentation, no auth required for public decks.

- **Base URL:** `https://api2.moxfield.com/v3`
- **Deck endpoint:** `GET /decks/all/{deckId}` — returns full deck object
- **ID extraction:** `extractMoxfieldId(url)` parses the ID from a full Moxfield URL
- **Response parsing:** `parseMoxfieldDeck(data)` normalises to `{ name, format, cardCount, commanders, viewCount, likeCount, updatedAt, publicUrl }`

**CORS:** Blocks requests from non-Moxfield origins in production. Works on localhost. All Moxfield data is enhancement-only — deck pages render fully from local markdown if the fetch fails. The deck detail page also embeds a Moxfield iframe (`/decks/{moxfieldId}/embed`) which is separate from the API call and generally works cross-origin.

## Scryfall
Not called at runtime. Art crop URLs are copied into frontmatter manually.
Format: `https://cards.scryfall.io/art_crop/front/{a}/{b}/{uuid}.jpg`

## YouTube
Not called at runtime. Thumbnail URLs follow a predictable pattern:
- `https://img.youtube.com/vi/{youtubeId}/maxresdefault.jpg`

`VideoCard` and the content scroll strip use this pattern as the default when no `thumbnail` field is provided in frontmatter.

## Google Fonts
Loaded via `<link>` in `index.html`. Fonts in use: **Space Grotesk** (display/headings), **Inter** (body).
