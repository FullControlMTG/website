---
name: FullControlMTG Website Architecture
description: Tech stack, file structure, routing, styling tokens, and key design decisions for the FullControlMTG website
type: project
---

Vite + React + React Router v7 + Tailwind CSS v4. Fully static — no backend, no CMS. Deploys to any CDN.

**Why:** Content-first MTG brand site. All content lives as markdown files; adding a deck or post requires no code changes.

## Stack decisions
- **js-yaml** instead of gray-matter — gray-matter calls `Buffer.from()` on every parse, which throws in the browser. js-yaml has no such dependency.
- **Tailwind v4** — configured via `@tailwindcss/vite` plugin. No `tailwind.config.js`. Custom tokens defined in `src/index.css` under `@theme`. Typography plugin registered with `@plugin "@tailwindcss/typography"`.
- **`font-display` utility** — maps to `--font-family-display: "Space Grotesk", sans-serif` in `@theme`. All headings use `font-display`. Body uses Inter.
- **marked** for rendering markdown body content in deck detail and blog post pages.

## File structure
```
src/
  api/moxfield.js           Moxfield fetch + parse utilities
  components/
    layout/                 Header, Footer, Layout
    ui/                     BlogCard, DeckCard, VideoCard, HeroCarousel,
                            TagBadge, LoadingSpinner
  data/
    decks/{slug}/           index.md + assets/
    blog/{slug}/            index.md + assets/
    content/{slug}/         index.md + assets/
  pages/                    One file per route
  utils/markdown.js         Entire data layer
  index.css                 Global styles + @theme tokens
```

## Routing
```
/                   Landing
/decks              Deck gallery
/decks/:slug        Deck detail
/blog               Blog gallery
/blog/:slug         Blog post
/content            Video gallery
/products           Products (placeholder)
/about
/support
/contact
```

## Theme tokens (src/index.css)
| Token                 | Value     | Role                        |
|-----------------------|-----------|-----------------------------|
| `--color-brand-900`   | #0d0d1a   | Page background             |
| `--color-brand-800`   | #1a1a2e   | Card/panel backgrounds      |
| `--color-brand-700`   | #16213e   | Secondary backgrounds       |
| `--color-brand-600`   | #0f3460   | Tertiary / image fallback   |
| `--color-primary`     | #7dd3fc   | Headings, active nav, accents |
| `--color-primary-light` | #bae6fd | Hover variant of primary    |
| `--color-accent`      | #e94560   | CTAs, video hover           |
| `--color-accent-hover`| #c73652   | CTA hover                   |

## Key commands
- `npm run dev` → localhost:5173
- `npm run build` → dist/
- `npm run preview` → preview built dist
