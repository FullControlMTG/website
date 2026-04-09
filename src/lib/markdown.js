import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const DATA_DIR = path.join(process.cwd(), 'src/data');

// js-yaml used directly instead of gray-matter to avoid its Node.js Buffer dependency.
function parseFrontmatter(rawContent) {
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: rawContent };
  return {
    data: yaml.load(match[1]) ?? {},
    content: match[2],
  };
}

// Local image fields starting with './' are resolved to public URLs.
// Place corresponding files at public/data/{type}/{slug}/assets/{filename}.
const IMAGE_FIELDS = ['image', 'coverImage', 'thumbnail'];

function resolveAsset(type, slug, value) {
  if (typeof value !== 'string' || !value.startsWith('./')) return value;
  return `/data/${type}/${slug}/${value.slice(2)}`;
}

function parseFile(type, slug) {
  const filePath = path.join(DATA_DIR, type, slug, 'index.md');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content: body } = parseFrontmatter(raw);

  for (const field of IMAGE_FIELDS) {
    if (frontmatter[field]) {
      frontmatter[field] = resolveAsset(type, slug, frontmatter[field]);
    }
  }

  if (type === 'content' && frontmatter.youtubeUrl && !frontmatter.youtubeId) {
    const match = frontmatter.youtubeUrl.match(/[?&]v=([^&]+)/);
    if (match) {
      frontmatter.youtubeId = match[1];
    }
  }

  if (type === 'content' && frontmatter.youtubeId && !frontmatter.thumbnail) {
    frontmatter.thumbnail = `https://img.youtube.com/vi/${frontmatter.youtubeId}/maxresdefault.jpg`;
  }

  return { slug, frontmatter, body };
}

function readAll(type) {
  const dir = path.join(DATA_DIR, type);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => parseFile(type, e.name))
    .filter((item) => item.frontmatter.published !== false)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.publishedOn) - new Date(a.frontmatter.publishedOn),
    );
}

export function getAllDecks() {
  return readAll('decks');
}

export function getDeckBySlug(slug) {
  return getAllDecks().find((d) => d.slug === slug) ?? null;
}

export function getAllPosts() {
  return readAll('blog');
}

export function getPostBySlug(slug) {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}

export function getAllContent() {
  return readAll('content');
}

export function getContentBySlug(slug) {
  return getAllContent().find((c) => c.slug === slug) ?? null;
}

export function getFeaturedDecks() {
  return getAllDecks().filter((d) => d.frontmatter.featured);
}

export function getFeaturedPosts() {
  return getAllPosts().filter((p) => p.frontmatter.featured);
}

export function getFeaturedContent() {
  return getAllContent().filter((c) => c.frontmatter.featured);
}

export function readDeckTxt(slug) {
  const filePath = path.join(DATA_DIR, 'decks', slug, 'deck.txt');
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}
