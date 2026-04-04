---
name: Design decisions and conventions
description: Visual design language, component conventions, and non-obvious implementation choices made during development
type: project
---

## Visual language
- **Aquatic theme** — dark navy backgrounds, sky-blue primary accent (`#7dd3fc`), red CTAs (`#e94560`), teal link color (`#4ecdc4`)
- **No gold/yellow** — was gold originally, replaced with blue to avoid competing with white text
- **Space Grotesk** for all headings (`font-display` Tailwind utility). Inter for body. No serif fonts.
- Hardcoded hex values used throughout components (not CSS variables) — the vars in `@theme` exist for documentation and potential utility-class use, but components reference hex directly
- **Link color (`#4ecdc4`)** — muted teal, distinct from the sky-blue header color. Used for prose links and `[[Card Name]]` references. CTAs/buttons keep the red accent (`#e94560`).

## Landing page layout
Intentionally non-uniform — "parallax inspired stack" aesthetic:
1. **Hero carousel** — full-width, 500px tall, auto-rotates every 6s
2. **Bento hub** — asymmetric 3-col × 2-row CSS grid. Decklists: 2-col wide, pulls its background from the first featured deck's `image`. Blog: spans both rows on the right. Content + Products: two shorter bottom-left cells.
3. **Featured deck panel** — full-bleed cinematic strip, art as background with layered gradients. No card border.
4. **Content strip** — horizontal scroll with `scroll-snap`, `w-72` cards, trailing "see all" ghost card
5. **Blog editorial** — lead post 3/5 wide, secondary posts stacked in 2/5

## Component conventions
- `DeckCard` / `BlogCard` / `VideoCard` — gallery card components, consistent hover lift + border glow
- `HeroCarousel` — self-contained with auto-advance interval; cleans up on unmount; handles internal (`next/link`) and external (`<a target="_blank">`) CTAs
- Gallery pages (Decks, Blog, Content) pass data from server page → client gallery component (`DeckGallery`, `BlogGallery`, `ContentGallery`) which handles search + tag filter state
- `DeckDetail` fetches Moxfield first; on failure falls back to `deck.txt`; gracefully degrades to a Moxfield link if neither is available
- `CardStack` — renders N cards stacked vertically with 85% overlap via `clip-path inset`. Clip values are runtime-computed (JS, not CSS) because they reference CSS custom properties set by `DeckSpread`. Each card is an `<a>` linking to Scryfall. Hover expands the card to full height.
- `DeckSpread` — `'use client'`; measures container width via `ResizeObserver`, derives column count (`min(4, floor(w / 120px))`), sets `--deck-card-w/h/strip-h` as inline CSS variables so columns always fill the box exactly. Cards are distributed sequentially across columns so same-name cards stay together.
- `DecklistViewer` — server component; no type grouping; expands each card entry into N individual copies; passes the flat list to `DeckSpread`. Commanders are rendered separately at full size above the spread.
- **Layout principle**: dimensions are derived from container width, not hardcoded breakpoints. `DeckSpread` is the canonical example — card width = `containerWidth / numCols`.

## Markdown data layer (src/lib/markdown.js)
- `fs.readdirSync` + `fs.readFileSync` — server-only, runs at request time (or build time for static pages)
- Slug = folder name (parent of `index.md`)
- `IMAGE_FIELDS = ['image', 'coverImage', 'thumbnail']` — resolved from `./assets/x` to `/data/{type}/{slug}/assets/x`
- Local image files must live under `public/data/` (Next.js serves `public/` as static assets)
- No gray-matter — still uses js-yaml for consistency and simplicity

## Card reference system (`[[Card Name]]`)
- `src/lib/parseMarkdown.js` — marked configured with a custom inline extension; converts `[[Card Name]]` → `<span class="mtg-card-ref" data-card="Card Name">Card Name</span>`
- `src/components/ui/MarkdownContent.jsx` — `'use client'`; renders HTML via `dangerouslySetInnerHTML`; intercepts `mousemove` on `[data-card]` spans; shows Scryfall card image tooltip following the cursor with viewport clamping
- Uses `requestAnimationFrame` for smooth tooltip updates
- Both deck detail and blog post pages use `parseMarkdown` + `<MarkdownContent>` instead of raw `marked.parse` + `dangerouslySetInnerHTML`
- `.mtg-card-ref` in `globals.css` — teal color (`var(--color-link)`), `cursor: help`, no underline

## Comments policy
Only three comments exist in the codebase, all explaining non-obvious constraints:
1. `lib/moxfield.js` — unofficial API, server-side only note
2. `lib/markdown.js` — why js-yaml instead of gray-matter
3. `app/contact/ContactForm.jsx` — form backend hookup needed
JSX section labels and JSDoc blocks were deliberately removed.
