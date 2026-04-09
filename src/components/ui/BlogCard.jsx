import Link from 'next/link';
import TagBadge from './TagBadge';

export default function BlogCard({ post }) {
  const { slug, frontmatter: fm } = post;

  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex flex-col rounded-xl overflow-hidden bg-[#1a1a2e] border border-white/10 hover:border-[#7dd3fc]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
    >
      {fm.coverImage && (
        <div className="relative h-44 overflow-hidden bg-[#0f3460]">
          <img
            src={fm.coverImage}
            alt={fm.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
          {fm.author && <span>{fm.author}</span>}
          {fm.author && fm.publishedOn && <span>·</span>}
          {fm.publishedOn && (
            <time dateTime={fm.publishedOn}>
              {new Date(fm.publishedOn).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
        </div>

        <h3 className="font-display text-base font-semibold text-white mb-2 group-hover:text-[#7dd3fc] transition-colors line-clamp-2">
          {fm.title}
        </h3>

        <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">{fm.description}</p>

        {fm.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {fm.tags.slice(0, 4).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
