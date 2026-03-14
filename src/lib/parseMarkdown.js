import { marked } from 'marked';

// Converts [[Card Name]] syntax into hoverable spans for Scryfall preview.
const cardRefExtension = {
  name: 'cardRef',
  level: 'inline',
  start(src) {
    return src.indexOf('[[');
  },
  tokenizer(src) {
    const match = src.match(/^\[\[([^\]]+)\]\]/);
    if (match) {
      return { type: 'cardRef', raw: match[0], name: match[1].trim() };
    }
  },
  renderer(token) {
    const escaped = token.name.replace(/"/g, '&quot;');
    return `<span class="mtg-card-ref" data-card="${escaped}">${token.name}</span>`;
  },
};

marked.use({ extensions: [cardRefExtension] });

export function parseMarkdown(src) {
  return marked.parse(src ?? '');
}
