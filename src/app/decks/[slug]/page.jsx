import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllDecks, getDeckBySlug } from '@/lib/markdown';
import { parseMarkdown } from '@/lib/parseMarkdown';
import MarkdownContent from '@/components/ui/MarkdownContent';
import { extractMoxfieldId, fetchMoxfieldDeck, parseMoxfieldDeck, buildDecklist } from '@/lib/moxfield';
import DecklistViewer from '@/components/deck/DecklistViewer';
import TagBadge from '@/components/ui/TagBadge';

export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllDecks().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const deck = getDeckBySlug(slug);
  if (!deck) return {};
  return { title: `${deck.frontmatter.title} — FullControlMTG` };
}

export default async function DeckDetailPage({ params }) {
  const { slug } = await params;
  const deck = getDeckBySlug(slug);
  if (!deck) notFound();

  const fm = deck.frontmatter;
  const bodyHtml = deck.body?.trim() ? parseMarkdown(deck.body) : null;
  const moxfieldId = extractMoxfieldId(fm.moxfieldUrl);

  let moxfield = null;
  let decklist = null;

  if (moxfieldId) {
    try {
      const data = await fetchMoxfieldDeck(moxfieldId);
      moxfield = parseMoxfieldDeck(data);
      decklist = buildDecklist(data);
    } catch {
      // Moxfield unavailable — render without live data
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/decks" className="hover:text-slate-300 transition-colors">Decklists</Link>
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
          <span className="inline-block rounded-full bg-[#0f3460] px-3 py-0.5 text-xs font-semibold text-[#7dd3fc] mb-4">
            {fm.category}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">{fm.title}</h1>
          {fm.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {fm.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
            </div>
          )}
          {fm.commander && (
            <p className="text-[#7dd3fc] text-sm mb-4">Commander: {fm.commander}</p>
          )}
          <p className="text-slate-300 max-w-2xl mb-6 leading-relaxed">{fm.description}</p>
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

      <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
        <div className="space-y-12 min-w-0">
          {moxfieldId && (
            <section>
              <h2 className="font-display text-xl font-semibold text-[#7dd3fc] mb-6">Decklist</h2>
              {decklist ? (
                <DecklistViewer decklist={decklist} />
              ) : (
                <p className="text-sm text-slate-500">
                  Decklist unavailable — view on{' '}
                  <a href={fm.moxfieldUrl} target="_blank" rel="noopener noreferrer" className="text-[#7dd3fc] hover:underline">
                    Moxfield
                  </a>.
                </p>
              )}
            </section>
          )}

          {bodyHtml && (
            <section>
              <h2 className="font-display text-xl font-semibold text-[#7dd3fc] mb-4">About This Deck</h2>
              <MarkdownContent
                html={bodyHtml}
                className="prose prose-invert prose-sm max-w-none text-slate-300 [&_h2]:font-display [&_h2]:text-[#7dd3fc] [&_h3]:text-white [&_a]:text-[#4ecdc4] [&_strong]:text-white"
              />
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-5">
            <h3 className="font-semibold text-white mb-4">Deck Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Format</dt>
                <dd className="text-white">{moxfield?.format ?? fm.category}</dd>
              </div>
              {moxfield?.cardCount && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Cards</dt>
                  <dd className="text-white">{moxfield.cardCount}</dd>
                </div>
              )}
              {moxfield?.viewCount != null && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Views</dt>
                  <dd className="text-white">{moxfield.viewCount.toLocaleString()}</dd>
                </div>
              )}
              {moxfield?.likeCount != null && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Likes</dt>
                  <dd className="text-white">{moxfield.likeCount.toLocaleString()}</dd>
                </div>
              )}
              {(moxfield?.updatedAt ?? fm.updatedAt) && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Updated</dt>
                  <dd className="text-white">
                    {new Date(moxfield?.updatedAt ?? fm.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {fm.publishedAt && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Published</dt>
                  <dd className="text-white">{new Date(fm.publishedAt).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
