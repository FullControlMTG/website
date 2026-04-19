---
name: FullControlMTG Website Architecture
description: Tech stack, file structure, routing, styling tokens, and key design decisions for the FullControlMTG website
type: project
---

Next.js 15 (App Router) + React 19 + Tailwind CSS v4. Server-rendered, Docker deployed. No separate backend.

**Why Next.js:** Replaced Vite+React Router SPA to enable server-side Moxfield API calls (CORS bypass) and build-time static generation of deck pages.

**Rendering model:** Fully static. Every page is generated once at `next build` (Moxfield + Scryfall calls happen during the build), then served as static HTML until the next deploy. No `revalidate` — content refreshes only when the site is rebuilt. Slug routes use `dynamicParams: false` so any unknown slug returns 404 without runtime rendering. Markdown files with `published: false` are filtered out in `lib/markdown.js#readPublished` and never reach `generateStaticParams`, so their pages aren't built at all.

## Stack decisions
- **Next.js App Router** — Server Components by default; client components marked with `'use client'`
- **@tailwindcss/postcss** — Tailwind v4 PostCSS plugin for Next.js (replaces `@tailwindcss/vite`)
- **next/font/google** — Space Grotesk + Inter self-hosted at build time (no Google CDN)
- **js-yaml** — YAML frontmatter parsing (server-side, no browser Buffer issue)
- **marked** — markdown body → HTML in deck detail and blog post pages, extended with `[[Card Name]]` card reference syntax via `src/lib/parseMarkdown.js`
- **`output: 'standalone'`** — minimal Docker image; `src/data/` and `.cache/` explicitly copied in Dockerfile

## File structure
```
src/
  app/                    Next.js App Router
    layout.jsx            Root layout
    globals.css           Global styles + @theme tokens
    page.jsx              Landing
    decks/page.jsx        Deck gallery
    decks/[slug]/page.jsx Deck detail (async server component, fetches Moxfield)
    blog/page.jsx         Blog gallery
    blog/[slug]/page.jsx  Blog post
    content/page.jsx      Video gallery
    products/ about/ support/ contact/
    contact/ContactForm.jsx  'use client' form component
  components/
    layout/               Header ('use client'), Footer
    ui/                   DeckCard, BlogCard, VideoCard, TagBadge, LoadingSpinner (server)
                          HeroCarousel ('use client')
                          DeckGallery, BlogGallery, ContentGallery ('use client' — search/filter)
                          MarkdownContent ('use client' — renders HTML with card hover previews)
    deck/                 CardStack ('use client'), DeckSpread ('use client'), DecklistViewer (server), CardFace (shared image/fallback renderer)
  data/
    decks/{slug}/         index.md + optional deck.txt + (assets in public/data/...)
    blog/{slug}/          index.md
    content/{slug}/       index.md
  lib/
    markdown.js           Server-only fs-based data layer (includes readDeckTxt)
    moxfield.js           Server-only Moxfield fetch + parse
    parseDeckTxt.js       Parses deck.txt into the same shape as buildDecklist()
    scryfall.js           Server-only Scryfall image enrichment for deck.txt cards
scripts/
  warm-cache.js           Prebuild script — populates .cache/scryfall-cards.json before next build
.cache/
  scryfall-cards.json     Gitignored. Maps card name → Scryfall image URL. Baked into Docker image.
public/
  data/                   Local image assets (mirrors src/data/ slug structure)
```

## Routing
```
/                   Landing
/decks              Deck gallery
/decks/:slug        Deck detail (static, built once per deploy)
/blog               Blog gallery
/blog/:slug         Blog post
/content            Video gallery
/products           Products (placeholder)
/about
/support
/contact
```

## Server vs Client components
- **Server**: all pages, Footer, DeckCard, BlogCard, VideoCard, TagBadge, LoadingSpinner, DecklistViewer
- **Client** (`'use client'`): Header (mobile menu), HeroCarousel (interval), CardStack (hover JS), DeckSpread (ResizeObserver + column layout), DeckGallery/BlogGallery/ContentGallery (search/filter state), ContactForm (mailto link), MarkdownContent (card hover previews)

## Theme tokens (src/app/globals.css)
| Token                 | Value     | Role                        |
|-----------------------|-----------|-----------------------------||  `--color-brand-900`   | #0d0d1a   | Page background             |
| `--color-brand-800`   | #1a1a2e   | Card/panel backgrounds      |
| `--color-brand-700`   | #16213e   | Secondary backgrounds       |
| `--color-brand-600`   | #0f3460   | Tertiary / image fallback   |
| `--color-primary`     | #7dd3fc   | Headings, active nav, accents |
| `--color-primary-light` | #bae6fd | Hover variant of primary    |
| `--color-accent`      | #e94560   | CTAs, video hover           |
| `--color-accent-hover`| #c73652   | CTA hover                   |
| `--color-link`        | #4ecdc4   | Prose links, card name refs |

Fonts injected via CSS variables `--font-display` and `--font-sans` from `next/font/google` on `<html>`.

## Key commands
- `npm run dev` → localhost:3000 (no prebuild; Scryfall cache populated lazily)
- `npm run build` → runs `prebuild` (warm-cache.js) then `next build`
- `npm start` → serve production build locally
- Deploy: `docker compose down && docker system prune && docker compose up -d --build`

## Scryfall cache lifecycle
`.cache/scryfall-cards.json` maps card name → Scryfall image URL.
- **Build time:** `prebuild` populates it for all `deck.txt` cards before `next build` runs
- **Docker image:** `.cache/` copied from build stage into serve stage — baked in, available from first request
- **Dev:** populated lazily on first page visit per missing card
- **Runtime writes:** ephemeral — lost on next `docker compose up --build`. Rebuild to persist new cards.
