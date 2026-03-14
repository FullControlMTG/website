import { useState } from 'react';
import VideoCard from '../components/ui/VideoCard';
import { getAllContent } from '../utils/markdown';

const allContent = getAllContent();
const allTags = [...new Set(allContent.flatMap((c) => c.frontmatter.tags ?? []))].sort();

export default function Content() {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const filtered = allContent.filter((item) => {
    const fm = item.frontmatter;
    const matchesSearch =
      !search ||
      fm.title?.toLowerCase().includes(search.toLowerCase()) ||
      fm.description?.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || fm.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-[#7dd3fc] mb-2">Content</h1>
        <p className="text-slate-400">
          Deck techs, gameplay videos, and in-depth strategy content. All videos hosted on YouTube.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-white/10 bg-[#1a1a2e] px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-[#e94560]/50 focus:outline-none"
        />
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#1a1a2e] px-4 py-2 text-sm text-white focus:border-[#e94560]/50 focus:outline-none"
        >
          <option value="">All tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          No content found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <VideoCard key={item.slug} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
