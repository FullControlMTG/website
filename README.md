# FullControlMTG Website

The official website for FullControlMTG — decklists, gameplay content, and strategy writing for Magic: The Gathering.

## Stack

- **Next.js 15** — App Router, Server Components, ISR
- **React 19** — UI
- **Tailwind CSS v4** — styling via `@tailwindcss/postcss` (no `tailwind.config.js`; custom tokens in `src/app/globals.css` under `@theme`)
- **js-yaml** — YAML frontmatter parsing
- **marked** — markdown body → HTML for deck and blog pages, with a custom `[[Card Name]]` extension
- **@tailwindcss/typography** — `prose` classes for rendered markdown

## Project Structure

```
src/
  app/                    Next.js App Router pages and layout
    layout.jsx            Root layout (Header, Footer, fonts)
    globals.css           Global styles and @theme tokens
    page.jsx              Landing page
    decks/                Decklists gallery + [slug] detail
    blog/                 Blog gallery + [slug] post
    content/              Video gallery
    products/             Products (placeholder)
    about/ support/ contact/
  components/
    layout/               Header, Footer
    ui/                   BlogCard, DeckCard, VideoCard, HeroCarousel,
                          TagBadge, LoadingSpinner,
                          DeckGallery, BlogGallery, ContentGallery (client)
                          MarkdownContent (client — card hover previews)
    deck/                 CardStack, DeckSpread (client), DecklistViewer
  data/
    decks/{slug}/         index.md + assets/ (images mirrored to public/data/)
    blog/{slug}/          index.md + assets/
    content/{slug}/       index.md + assets/
  lib/
    markdown.js           Data layer — fs-based, server-only
    moxfield.js           Moxfield API fetch + parse utilities
    parseMarkdown.js      marked configured with [[Card Name]] → hover span extension
public/
  data/                   Local image assets (mirrors src/data/ structure)
```

## Data Layer

All content is markdown files. No CMS, no backend.

`src/lib/markdown.js` reads every `index.md` at request time using Node's `fs` module (server-only). Frontmatter is parsed with js-yaml. The slug for each item is its **folder name**, not the filename (which is always `index.md`).

Local image assets in frontmatter (`./assets/image.jpg`) resolve to `/data/{type}/{slug}/assets/filename.jpg`. Place those files under `public/data/` with the matching path — e.g. `public/data/decks/my-deck/assets/cover.jpg`.

External URLs (Scryfall, YouTube) pass through unchanged.

## Adding Content

### Decklist

1. Create `src/data/decks/{slug}/index.md`
2. Add frontmatter:

```yaml
---
title: "Deck Name"
description: "Short description for cards and previews."
category: "Commander"          # format label
commander: "Commander Name"    # EDH only
tags:
  - tag-one
  - tag-two
moxfieldUrl: "https://moxfield.com/decks/aBcDeFgHiJkLmN"  # ID is derived from this
image: "./assets/cover.jpg"    # or a Scryfall art URL
publishedAt: "2025-01-15"
updatedAt: "2025-03-01"        # optional
featured: true                 # shows in hero carousel and homepage
---
```

3. Optionally add a markdown body below the frontmatter — rendered as "About This Deck" on the detail page.
4. Drop images in `public/data/decks/{slug}/assets/`.

### Blog Post

```yaml
---
title: "Post Title"
description: "One-sentence summary."
author: "FullControlMTG"
publishedAt: "2025-03-01"
tags:
  - strategy
coverImage: "./assets/cover.jpg"  # or external URL
featured: true
---
```

### Content (YouTube)

```yaml
---
title: "Video Title"
description: "Short description."
youtubeId: "dQw4w9WgXcQ"
youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
thumbnail: "./assets/thumb.jpg"   # defaults to YouTube's maxresdefault if omitted
relatedDeckSlug: "deck-slug"      # optional — links to a deck page
tags:
  - deck-tech
publishedAt: "2025-02-10"
featured: true
---
```

## Card References in Markdown

Wrap any card name in double brackets to create a hover preview:

```markdown
Cast [[Goblin Charbelcher]] and activate it for 7 mana.
```

On hover, the Scryfall card image appears following the cursor. This works in both deck body text and blog posts. Card names are highlighted in the project link color (`#4ecdc4`).

## Decklist (deck.txt)

Each deck folder can optionally include a `src/data/decks/{slug}/deck.txt` file. This serves two purposes:

1. **Moxfield fallback** — if the Moxfield API is unavailable or the deck has no `moxfieldUrl`, the page renders the decklist from the local file instead.
2. **Custom card ordering** — cards are displayed in the order they appear in `deck.txt`, so you can control how the visual deck spread is arranged.

### Supported formats

All common plain-text formats are accepted:

```
# MTGA export (preferred — includes set + collector number for precise image lookup)
Deck
4 Goblin Charbelcher (MH3) 128
4 Manamorphose (SPG) 0

Sideboard
1 Empty the Warrens (DMR) 118
```

```
# Simple / MTGO
4 Goblin Charbelcher
4 Manamorphose

Sideboard
1 Empty the Warrens
```

Recognised section headers (case-insensitive): `Deck`, `Commander`, `Sideboard`, `Companion`, `About`, `Maybeboard`. The `About` and `Maybeboard` sections are ignored.

### Scryfall images

Card images are resolved from card names to Scryfall image URLs and stored in `.cache/scryfall-cards.json` (gitignored). This file is the persistent image cache — its lifecycle is:

| Stage | What happens |
|---|---|
| `npm run build` | `prebuild` runs `scripts/warm-cache.js` first — reads every `deck.txt`, batches all unique card names into `POST /cards/collection` calls (75 at a time), writes results to `.cache/scryfall-cards.json`. `next build` then pre-renders all deck pages reading entirely from the warm cache — zero Scryfall calls during render. |
| `docker build` | The populated `.cache/` is copied from the build stage into the serve image (`COPY --from=build /app/.cache ./.cache`), so the cache is baked in and available from the first request. |
| `npm run dev` | `prebuild` does not run. The cache is read lazily — missing cards are fetched from Scryfall on the first page visit and written to the file. |
| Running container | Cache reads only. Any write (missing card fetched at runtime) is ephemeral — lost on the next `docker compose up --build`. Rebuild to make new cards permanent. |

If a card is missing from the cache at runtime, `enrichWithScryfallImages` resolves it on that request via the same batch POST approach and serves the correct image — but the fix is not persisted in production until the next build.

## Moxfield Integration

The deck detail page fetches live data (card count, views, likes, full decklist) from the unofficial Moxfield API server-side. Because this runs on the Next.js server, there are no CORS restrictions. Moxfield data is cached for 1 hour via ISR (`revalidate = 3600`). The page renders fully from local markdown if the fetch fails — falling back to `deck.txt` if one exists, or a link to Moxfield otherwise.

## Theme

Design tokens are in `src/app/globals.css` under `@theme`. Colours of note:

| Token | Value | Used for |
|---|---|---|
| `--color-brand-900` | `#0d0d1a` | Page background |
| `--color-brand-800` | `#1a1a2e` | Card backgrounds |
| `--color-primary` | `#7dd3fc` | Headings, active states, accents |
| `--color-accent` | `#e94560` | CTAs, buttons |
| `--color-link` | `#4ecdc4` | Prose links, card name references |

The display font (`font-display` utility) is **Space Grotesk**, the body font is **Inter**. Both are loaded via `next/font/google` (self-hosted at build time, no Google CDN dependency).

## Development

```bash
npm install
npm run dev      # localhost:3000
npm run build
npm start        # serve the production build locally
```

## Deployment

```bash
docker compose down && docker system prune && docker compose up -d --build && docker logs -f fullcontrolmtg-website
```
