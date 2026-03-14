import Link from 'next/link';
import TagBadge from './TagBadge';

export default function VideoCard({ item }) {
  const { slug, frontmatter: fm } = item;

  const thumbnail =
    fm.thumbnail ??
    (fm.youtubeId
      ? `https://img.youtube.com/vi/${fm.youtubeId}/maxresdefault.jpg`
      : null);

  return (
    <div className="group rounded-xl overflow-hidden bg-[#1a1a2e] border border-white/10 hover:border-[#e94560]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40">
      <a
        href={fm.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative h-48 overflow-hidden bg-[#0f3460]"
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={fm.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#0f3460]">
            <svg className="h-12 w-12 text-[#e94560]/50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <div className="rounded-full bg-[#e94560] p-3">
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </a>

      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-[#e94560] transition-colors">
          {fm.title}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{fm.description}</p>

        <div className="flex items-center justify-between">
          {fm.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {fm.tags.slice(0, 7).map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
          {fm.relatedDeckSlug && (
            <Link
              href={`/decks/${fm.relatedDeckSlug}`}
              className="text-xs text-[#7dd3fc] hover:text-[#bae6fd] transition-colors shrink-0 ml-2"
            >
              View Deck →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
