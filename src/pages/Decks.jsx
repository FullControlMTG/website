import { useState } from 'react';
import DeckCard from '../components/ui/DeckCard';
import { getAllDecks } from '../utils/markdown';

const allDecks = getAllDecks();
const allTags = [...new Set(allDecks.flatMap((d) => d.frontmatter.tags ?? []))].sort();
const allCategories = [...new Set(allDecks.map((d) => d.frontmatter.category).filter(Boolean))].sort();

export default function Decks() {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const filtered = allDecks.filter((deck) => {
    const fm = deck.frontmatter;
    const matchesSearch =
      !search ||
      fm.title?.toLowerCase().includes(search.toLowerCase()) ||
      fm.description?.toLowerCase().includes(search.toLowerCase()) ||
      fm.commander?.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || fm.tags?.includes(selectedTag);
    const matchesCategory = !selectedCategory || fm.category === selectedCategory;
    return matchesSearch && matchesTag && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-[#7dd3fc] mb-2">Decklists</h1>
        <p className="text-slate-400">
          Browse our curated Magic: The Gathering decklists. Click any deck to view the full list on Moxfield.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search decks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-white/10 bg-[#1a1a2e] px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-[#7dd3fc]/50 focus:outline-none"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#1a1a2e] px-4 py-2 text-sm text-white focus:border-[#7dd3fc]/50 focus:outline-none"
        >
          <option value="">All formats</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#1a1a2e] px-4 py-2 text-sm text-white focus:border-[#7dd3fc]/50 focus:outline-none"
        >
          <option value="">All tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          No decklists found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((deck) => (
            <DeckCard key={deck.slug} deck={deck} />
          ))}
        </div>
      )}
    </div>
  );
}
