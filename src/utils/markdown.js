import yaml from 'js-yaml';

const deckFiles = import.meta.glob('../data/decks/*/index.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const contentFiles = import.meta.glob('../data/content/*/index.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const blogFiles = import.meta.glob('../data/blog/*/index.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// Eagerly import all local assets so Vite processes and hashes them.
// Values are resolved URL strings that can be used directly in <img src>.
const assetModules = import.meta.glob(
  '../data/**/*.{jpg,jpeg,png,webp,gif,svg}',
  { eager: true, import: 'default' },
);

// js-yaml used directly instead of gray-matter to avoid its Node.js Buffer dependency in the browser.
function parseFrontmatter(rawContent) {
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: rawContent };
  return {
    data: yaml.load(match[1]) ?? {},
    content: match[2],
  };
}

// Resolve a frontmatter image field that starts with './' against the item's
// folder, returning the Vite-processed URL for local files or the original
// value unchanged for external URLs.
function resolveAsset(itemPath, value) {
  if (typeof value !== 'string' || !value.startsWith('./')) return value;
  const dir = itemPath.substring(0, itemPath.lastIndexOf('/'));
  const key = `${dir}/${value.slice(2)}`;
  return assetModules[key] ?? value;
}

const IMAGE_FIELDS = ['image', 'coverImage', 'thumbnail'];

function parseFile(filePath, rawContent) {
  const { data: frontmatter, content: body } = parseFrontmatter(rawContent);

  // Slug is the parent folder name, not the filename (which is always index.md).
  const parts = filePath.split('/');
  const slug = parts[parts.length - 2];

  for (const field of IMAGE_FIELDS) {
    if (frontmatter[field]) {
      frontmatter[field] = resolveAsset(filePath, frontmatter[field]);
    }
  }

  return { slug, frontmatter, body };
}

export function getAllDecks() {
  return Object.entries(deckFiles)
    .map(([path, raw]) => parseFile(path, raw))
    .sort(
      (a, b) =>
        new Date(b.frontmatter.publishedAt) -
        new Date(a.frontmatter.publishedAt),
    );
}

export function getDeckBySlug(slug) {
  return getAllDecks().find((deck) => deck.slug === slug) ?? null;
}

export function getAllContent() {
  return Object.entries(contentFiles)
    .map(([path, raw]) => parseFile(path, raw))
    .sort(
      (a, b) =>
        new Date(b.frontmatter.publishedAt) -
        new Date(a.frontmatter.publishedAt),
    );
}

export function getContentBySlug(slug) {
  return getAllContent().find((item) => item.slug === slug) ?? null;
}

export function getFeaturedDecks() {
  return getAllDecks().filter((d) => d.frontmatter.featured);
}

export function getFeaturedContent() {
  return getAllContent().filter((c) => c.frontmatter.featured);
}

export function getAllPosts() {
  return Object.entries(blogFiles)
    .map(([path, raw]) => parseFile(path, raw))
    .sort(
      (a, b) =>
        new Date(b.frontmatter.publishedAt) -
        new Date(a.frontmatter.publishedAt),
    );
}

export function getPostBySlug(slug) {
  return getAllPosts().find((post) => post.slug === slug) ?? null;
}

export function getFeaturedPosts() {
  return getAllPosts().filter((p) => p.frontmatter.featured);
}
