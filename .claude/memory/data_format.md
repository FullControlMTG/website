---
name: Data folder format and frontmatter schemas
description: How content is structured in src/data/, slug derivation, local asset resolution, and all frontmatter field definitions
type: project
---

Each content item lives in its own folder: `src/data/{type}/{slug}/index.md`.

**Slug = folder name.** The filename is always `index.md`. `markdown.js` reads the directory listing and uses the directory name as the slug.

## Local image assets
Set any image field to `./assets/filename.jpg` in frontmatter. `markdown.js` resolves these to `/data/{type}/{slug}/assets/filename.jpg` — a public URL. The actual file must be placed at `public/data/{type}/{slug}/assets/filename.jpg` so Next.js serves it. External URLs (Scryfall, YouTube) pass through unchanged. Fields checked: `image`, `coverImage`, `thumbnail`.

## deck.txt — optional local decklist

Each deck folder can contain `src/data/decks/{slug}/deck.txt`. The page uses this when:
- Moxfield is unreachable / returns an error, OR
- `moxfieldUrl` is absent

**Purposes:**
1. Moxfield fallback — deck renders locally instead of showing a dead link
2. Custom card ordering — cards display in file order; no automatic grouping

**Parsed by** `src/lib/parseDeckTxt.js`. Supported formats:
- MTGA export: `4 Card Name (SET) 123` — captures set + collector number for direct Scryfall lookup
- Simple / MTGO: `4 Card Name`

Section headers recognised (case-insensitive): `Deck` → mainboard, `Commander`, `Sideboard`, `Companion` → sideboard, `About` / `Maybeboard` → ignored.

Inline `*CMDR*` marker also moves a card to the commanders pile.

After parsing, `src/lib/scryfall.js` enriches each card with `imageUrl` from `.cache/scryfall-cards.json` (pre-warmed at build time by `scripts/warm-cache.js`). MTGA cards also carry `set`/`collectorNumber` fields used to build the Scryfall card page link.

## Deck frontmatter — `src/data/decks/{slug}/index.md`
```yaml
title: "string"           # required
description: "string"     # required — used on cards and detail page
category: "Commander"     # required — format label
tags:                     # required
  - tag
commander: "Name"         # optional — EDH only
moxfieldUrl: "https://moxfield.com/decks/aBcDeF"  # optional — ID is derived from this
image: "./assets/cover.jpg"  # optional — or Scryfall URL
publishedAt: "2025-01-15" # required — ISO date, used for sort order
updatedAt: "2025-03-01"   # optional
featured: true            # optional — appears in hero carousel and homepage
```
Markdown body below frontmatter renders as "About This Deck" on the detail page.

## Blog post frontmatter — `src/data/blog/{slug}/index.md`
```yaml
title: "string"           # required
description: "string"     # required
author: "string"          # optional
publishedAt: "2025-03-01" # required
updatedAt: "2025-03-10"   # optional
tags:                     # required
  - strategy
coverImage: "./assets/cover.jpg"  # optional — or external URL
featured: true            # optional
```
Markdown body renders as the full post content.

## Content (YouTube) frontmatter — `src/data/content/{slug}/index.md`
```yaml
title: "string"           # required
description: "string"     # required
youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # required — ID and thumbnail are derived from this in markdown.js
relatedDeckSlug: "deck-slug"     # optional — links to /decks/{slug}
tags:                     # required
  - deck-tech
publishedAt: "2025-02-10" # required
featured: true            # optional
```
`markdown.js` extracts `youtubeId` from the `?v=` query param and synthesizes `thumbnail` as `https://img.youtube.com/vi/{id}/maxresdefault.jpg` — no need to specify either in the file.

## `featured` field
Items with `featured: true` appear in:
- Hero carousel (decks and content)
- Homepage bento hub / featured sections
- "From the Blog" editorial strip (blog posts)
