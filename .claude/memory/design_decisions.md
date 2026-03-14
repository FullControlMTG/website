---
name: Design decisions and conventions
description: Visual design language, component conventions, and non-obvious implementation choices made during development
type: project
---

## Visual language
- **Aquatic theme** — dark navy backgrounds, sky-blue primary accent (`#7dd3fc`), red CTAs (`#e94560`)
- **No gold/yellow** — was gold originally, replaced with blue to avoid competing with white text
- **Space Grotesk** for all headings (`font-display` Tailwind utility). Inter for body. No serif fonts.
- Hardcoded hex values used throughout components (not CSS variables) — the vars in `@theme` exist for documentation and potential utility-class use, but components reference hex directly

## Landing page layout
Intentionally non-uniform — "parallax inspired stack" aesthetic:
1. **Hero carousel** — full-width, 500px tall, auto-rotates every 6s
2. **Bento hub** — asymmetric 3-col × 2-row CSS grid. Decklists: 2-col wide, pulls its background from the first featured deck's `image`. Blog: spans both rows on the right. Content + Products: two shorter bottom-left cells.
3. **Featured deck panel** — full-bleed cinematic strip, art as background with layered gradients. No card border.
4. **Content strip** — horizontal scroll with `scroll-snap`, `w-72` cards, trailing "see all" ghost card
5. **Blog editorial** — lead post 3/5 wide, secondary posts stacked in 2/5

## Component conventions
- `DeckCard` / `BlogCard` / `VideoCard` — gallery card components, consistent hover lift + border glow
- `HeroCarousel` — self-contained with auto-advance interval; cleans up on unmount
- All gallery pages (Decks, Blog, Content) have client-side search + tag filter over the statically-loaded array
- `DeckDetail` fetches Moxfield in a `useEffect` with try/catch; page never blocks on it

## Markdown data layer (src/utils/markdown.js)
- `import.meta.glob` with `eager: true` — all files bundled at build time, zero runtime fetches for content
- Slug = folder name (parent of `index.md`), not the filename
- `IMAGE_FIELDS = ['image', 'coverImage', 'thumbnail']` — all three are checked for `./` prefix and resolved against the item's folder via a parallel asset glob
- No gray-matter — it calls `Buffer.from()` which doesn't exist in browsers

## Comments policy
Only three comments exist in the codebase, all explaining non-obvious constraints:
1. `moxfield.js` — CORS / unofficial API note
2. `markdown.js` — why js-yaml instead of gray-matter
3. `Contact.jsx` — form backend hookup needed
JSX section labels and JSDoc blocks were deliberately removed.
