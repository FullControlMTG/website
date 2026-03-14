'use client';

import { useState } from 'react';
import BlogCard from './BlogCard';

export default function BlogGallery({ posts }) {
  const allTags = [...new Set(posts.flatMap((p) => p.frontmatter.tags ?? []))].sort();

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const filtered = posts.filter((post) => {
    const fm = post.frontmatter;
    const matchesSearch =
      !search ||
      fm.title?.toLowerCase().includes(search.toLowerCase()) ||
      fm.description?.toLowerCase().includes(search.toLowerCase()) ||
      fm.author?.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || fm.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-white/10 bg-[#1a1a2e] px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-[#7dd3fc]/50 focus:outline-none"
        />
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
          No posts found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
