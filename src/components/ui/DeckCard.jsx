import { Link } from 'react-router-dom';
import TagBadge from './TagBadge';

export default function DeckCard({ deck }) {
  const { slug, frontmatter: fm } = deck;

  return (
    <Link
      to={`/decks/${slug}`}
      className="group block rounded-xl overflow-hidden bg-[#1a1a2e] border border-white/10 hover:border-[#7dd3fc]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
    >
      <div className="relative h-48 overflow-hidden bg-[#0f3460]">
        {fm.image ? (
          <img
            src={fm.image}
            alt={fm.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-4xl text-[#7dd3fc]/30">FC</span>
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-[#0d0d1a]/80 px-2 py-0.5 text-xs font-medium text-[#7dd3fc] backdrop-blur-sm">
          {fm.category}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-display text-base font-semibold text-white mb-1 group-hover:text-[#7dd3fc] transition-colors line-clamp-2">
          {fm.title}
        </h3>
        {fm.commander && (
          <p className="text-xs text-slate-400 mb-2">Commander: {fm.commander}</p>
        )}
        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{fm.description}</p>

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
