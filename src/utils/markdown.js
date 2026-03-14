import yaml from 'js-yaml';

const deckFiles = import.meta.glob('../data/decks/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const contentFiles = import.meta.glob('../data/content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// js-yaml used directly instead of gray-matter to avoid its Node.js Buffer dependency in the browser.
function parseFrontmatter(rawContent) {
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: rawContent };
  return {
    data: yaml.load(match[1]) ?? {},
    content: match[2],
  };
}

function parseFile(filePath, rawContent) {
  const { data: frontmatter, content: body } = parseFrontmatter(rawContent);
  const slug = filePath.split('/').pop().replace('.md', '');
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
