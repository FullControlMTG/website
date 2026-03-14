# FullControlMTG Website

The official website for FullControlMTG — decklists, gameplay content, and strategy writing for Magic: The Gathering.

## Stack

- **Vite + React** — build tooling and UI
- **React Router v7** — client-side routing
- **Tailwind CSS v4** — styling via `@tailwindcss/vite` plugin (no `tailwind.config.js` needed; custom tokens live in `src/index.css` under `@theme`)
- **js-yaml** — YAML frontmatter parsing (used directly rather than gray-matter, which requires Node's `Buffer` in the browser)
- **marked** — markdown body → HTML for deck and blog pages
- **@tailwindcss/typography** — `prose` classes for rendered markdown

## Project Structure

```
src/
  api/
    moxfield.js         Moxfield API utilities (fetch, parse, extract ID)
  components/
    layout/             Header, Footer, Layout wrapper
    ui/                 BlogCard, DeckCard, VideoCard, HeroCarousel,
                        TagBadge, LoadingSpinner
  data/
    decks/{slug}/       index.md + assets/
    blog/{slug}/        index.md + assets/
    content/{slug}/     index.md + assets/
  pages/                One file per route
  utils/
    markdown.js         Data layer — glob imports, frontmatter parsing,
                        local asset resolution, all query functions
  index.css             Global styles and @theme tokens
```

## Data Layer

All content is static markdown. No CMS, no backend.

`src/utils/markdown.js` uses Vite's `import.meta.glob` with `eager: true` to load every `index.md` at build time. Frontmatter is parsed with js-yaml. The slug for each item is its **folder name**, not the filename (which is always `index.md`).

Local image assets (`./assets/image.jpg`) are resolved by a parallel asset glob that lets Vite process and content-hash them. External URLs (Scryfall, YouTube) pass through unchanged.

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
moxfieldId: "aBcDeFgHiJkLmN"  # ID segment from the Moxfield URL
moxfieldUrl: "https://moxfield.com/decks/aBcDeFgHiJkLmN"
image: "./assets/cover.jpg"    # or a Scryfall URL
colorIdentity:
  - U
  - G
publishedAt: "2025-01-15"
updatedAt: "2025-03-01"        # optional
featured: true                 # shows in hero carousel and homepage
---
```

3. Optionally add a markdown body below the frontmatter — rendered as "About This Deck" on the detail page.
4. Drop any images in `assets/`.

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

Write the post body in markdown below the frontmatter.

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

## Moxfield Integration

The deck detail page embeds a Moxfield iframe and attempts to fetch live stats (card count, views, likes) from the unofficial Moxfield API (`api2.moxfield.com/v3`). CORS restrictions may block this in production — the page renders fully from local markdown if the request fails.

## Theme

Design tokens are in `src/index.css` under `@theme`. Colours of note:

| Token | Value | Used for |
|---|---|---|
| `--color-brand-900` | `#0d0d1a` | Page background |
| `--color-brand-800` | `#1a1a2e` | Card backgrounds |
| `--color-primary` | `#7dd3fc` | Headings, active states, accents |
| `--color-accent` | `#e94560` | CTAs, hover states |

The display font (`font-display` utility) is **Space Grotesk**, loaded from Google Fonts. Body text uses **Inter**.

## Development

```bash
npm install
npm run dev      # localhost:5173
npm run build
npm run preview
```

## Deployment
```bash
docker compose down && docker system prune && docker compose up -d --build && docker logs -f fullcontrolmtg-website
```
