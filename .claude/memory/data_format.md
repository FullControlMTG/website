---
name: Data folder format and frontmatter schemas
description: How content is structured in src/data/, slug derivation, local asset resolution, and all frontmatter field definitions
type: project
---

Each content item lives in its own folder: `src/data/{type}/{slug}/index.md` plus an optional `assets/` subfolder.

**Slug = folder name.** The filename is always `index.md`. `markdown.js` reads the second-to-last path segment as the slug.

## Local image assets
Set any image field to `./assets/filename.jpg` to use a local file. `markdown.js` resolves these via a Vite asset glob, which content-hashes them at build time. External URLs (Scryfall, YouTube) pass through unchanged. Fields checked: `image`, `coverImage`, `thumbnail`.

## Deck frontmatter — `src/data/decks/{slug}/index.md`
```yaml
title: "string"           # required
description: "string"     # required — used on cards and detail page
category: "Commander"     # required — format label
tags:                     # required
  - tag
commander: "Name"         # optional — EDH only
moxfieldId: "aBcDeF"      # required — ID segment from Moxfield URL
moxfieldUrl: "https://moxfield.com/decks/aBcDeF"  # required
image: "./assets/cover.jpg"  # optional — or Scryfall URL
colorIdentity: [U, G]     # optional
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
youtubeId: "dQw4w9WgXcQ"  # required
youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # required
thumbnail: "./assets/thumb.jpg"  # optional — defaults to YouTube maxresdefault
relatedDeckSlug: "deck-slug"     # optional — links to /decks/{slug}
tags:                     # required
  - deck-tech
publishedAt: "2025-02-10" # required
featured: true            # optional
```

## `featured` field
Items with `featured: true` appear in:
- Hero carousel (decks and content)
- Homepage bento hub / featured sections
- "From the Blog" editorial strip (blog posts)
