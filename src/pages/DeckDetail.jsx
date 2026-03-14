import { useParams, Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { marked } from 'marked';
import { getDeckBySlug } from '../utils/markdown';
import { fetchMoxfieldDeck, parseMoxfieldDeck } from '../api/moxfield';
import TagBadge from '../components/ui/TagBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function DeckDetail() {
  const { slug } = useParams();
  const deck = getDeckBySlug(slug);

  const [moxfield, setMoxfield] = useState(null);
  const [moxLoading, setMoxLoading] = useState(false);
  const [moxError, setMoxError] = useState(null);

  useEffect(() => {
    if (!deck?.frontmatter.moxfieldId) return;
    setMoxLoading(true);
    fetchMoxfieldDeck(deck.frontmatter.moxfieldId)
      .then((data) => setMoxfield(parseMoxfieldDeck(data)))
      .catch((err) => setMoxError(err.message))
      .finally(() => setMoxLoading(false));
  }, [deck?.frontmatter.moxfieldId]);

  if (!deck) return <Navigate to="/decks" replace />;

  const fm = deck.frontmatter;
  const bodyHtml = deck.body?.trim() ? marked.parse(deck.body) : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <nav className="mb-6 text-sm text-slate-500">
        <Link to="/decks" className="hover:text-slate-300 transition-colors">Decklists</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">{fm.title}</span>
      </nav>

      <div className="relative mb-10 overflow-hidden rounded-2xl bg-[#1a1a2e] border border-white/10">
        {fm.image && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${fm.image})` }}
          />
        )}
        <div className="relative p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="rounded-full bg-[#0f3460] px-3 py-0.5 text-xs font-semibold text-[#7dd3fc]">
              {fm.category}
            </span>
            {fm.tags?.map((tag) => <TagBadge key={tag} tag={tag} />)}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            {fm.title}
          </h1>
          {fm.commander && (
            <p className="text-[#7dd3fc] text-sm mb-4">Commander: {fm.commander}</p>
          )}
          <p className="text-slate-300 max-w-2xl mb-6 leading-relaxed">{fm.description}</p>

          <div className="flex flex-wrap gap-3">
            <a
              href={fm.moxfieldUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#e94560] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#c73652] transition-colors"
            >
              View on Moxfield
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {fm.moxfieldId && (
            <section>
              <h2 className="font-display text-xl font-semibold text-[#7dd3fc] mb-4">Decklist</h2>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-[#1a1a2e]">
                <iframe
                  src={`https://www.moxfield.com/decks/${fm.moxfieldId}/embed`}
                  title={`${fm.title} decklist`}
                  className="w-full"
                  style={{ height: '600px', border: 'none' }}
                  loading="lazy"
                />
              </div>
            </section>
          )}

          {bodyHtml && (
            <section>
              <h2 className="font-display text-xl font-semibold text-[#7dd3fc] mb-4">About This Deck</h2>
              <div
                className="prose prose-invert prose-sm max-w-none text-slate-300 [&_h2]:font-display [&_h2]:text-[#7dd3fc] [&_h3]:text-white [&_a]:text-[#e94560] [&_strong]:text-white"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-5">
            <h3 className="font-semibold text-white mb-4">Deck Info</h3>
            {moxLoading && <LoadingSpinner label="Loading Moxfield data..." />}
            {moxError && (
              <p className="text-xs text-slate-500">
                Moxfield data unavailable ({moxError})
              </p>
            )}
            {moxfield && (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Format</dt>
                  <dd className="text-white capitalize">{moxfield.format}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Cards</dt>
                  <dd className="text-white">{moxfield.cardCount}</dd>
                </div>
                {moxfield.viewCount != null && (
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Views</dt>
                    <dd className="text-white">{moxfield.viewCount.toLocaleString()}</dd>
                  </div>
                )}
                {moxfield.likeCount != null && (
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Likes</dt>
                    <dd className="text-white">{moxfield.likeCount.toLocaleString()}</dd>
                  </div>
                )}
                {moxfield.updatedAt && (
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Updated</dt>
                    <dd className="text-white">{new Date(moxfield.updatedAt).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>
            )}
            {!moxLoading && !moxfield && !moxError && (
              <dl className="space-y-2 text-sm">
                {fm.category && (
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Format</dt>
                    <dd className="text-white">{fm.category}</dd>
                  </div>
                )}
                {fm.publishedAt && (
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Published</dt>
                    <dd className="text-white">{new Date(fm.publishedAt).toLocaleDateString()}</dd>
                  </div>
                )}
                {fm.updatedAt && (
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Updated</dt>
                    <dd className="text-white">{new Date(fm.updatedAt).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          {fm.tags?.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-5">
              <h3 className="font-semibold text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {fm.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
