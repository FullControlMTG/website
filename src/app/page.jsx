import Link from 'next/link';
import HeroCarousel from '@/components/ui/HeroCarousel';
import { getFeaturedDecks, getFeaturedContent, getFeaturedPosts } from '@/lib/markdown';

export default function Landing() {
  const featuredDecks = getFeaturedDecks();
  const featuredContent = getFeaturedContent();
  const featuredPosts = getFeaturedPosts();
  const featuredDeck = featuredDecks[0] ?? null;

  const heroSlides = [
    ...featuredDecks.map((d) => ({
      title: d.frontmatter.title,
      description: d.frontmatter.description,
      image: d.frontmatter.image,
      tag: d.frontmatter.category,
      href: `/decks/${d.slug}`,
      cta: 'View Decklist',
    })),
    ...featuredContent.map((c) => ({
      title: c.frontmatter.title,
      description: c.frontmatter.description,
      image: c.frontmatter.thumbnail,
      tag: 'Video',
      href: c.frontmatter.youtubeUrl,
      cta: 'Watch Now',
    })),
  ];

  return (
    <div className="overflow-x-hidden">
      <HeroCarousel slides={heroSlides} />

      <div className="mx-auto max-w-7xl px-6 pt-14 pb-4">
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '260px 160px' }}
        >
          <Link
            href="/decks"
            className="group relative overflow-hidden rounded-2xl col-span-2 row-span-1 bg-[#0f3460]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: featuredDeck?.frontmatter.image
                  ? `url(${featuredDeck.frontmatter.image})`
                  : undefined,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d1a]/50 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-8">
              <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#7dd3fc]/70">
                Decklists
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                Curated lists.<br />Competitive lines.
              </h2>
              <span className="text-sm text-[#7dd3fc] group-hover:text-[#bae6fd] transition-colors">
                Browse all decks →
              </span>
            </div>
          </Link>

          <Link
            href="/blog"
            className="group relative overflow-hidden rounded-2xl row-span-2 bg-[#1a1a2e] border border-white/10 hover:border-[#7dd3fc]/40 transition-colors"
          >
            {featuredPosts[0]?.frontmatter.coverImage && (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-top transition-transform duration-700 group-hover:scale-105 opacity-20"
                  style={{ backgroundImage: `url(${featuredPosts[0].frontmatter.coverImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1a2e]/60 to-[#1a1a2e]" />
              </>
            )}
            <div className="relative h-full flex flex-col justify-between p-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#7dd3fc]/70">
                Blog
              </span>
              <div>
                {featuredPosts[0] && (
                  <p className="text-sm text-slate-400 italic mb-4 line-clamp-4">
                    &ldquo;{featuredPosts[0].frontmatter.title}&rdquo;
                  </p>
                )}
                <h2 className="font-display text-xl font-bold text-white mb-2 leading-tight">
                  Strategy &amp; analysis
                </h2>
                <span className="text-sm text-[#7dd3fc] group-hover:text-[#bae6fd] transition-colors">
                  Read the blog →
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/content"
            className="group relative overflow-hidden rounded-2xl bg-[#16213e] border border-white/10 hover:border-[#e94560]/40 transition-colors"
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="relative h-full flex flex-col justify-between p-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#e94560]/70">
                Content
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-white mb-1">
                  Watch &amp; learn
                </h2>
                <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                  Videos &amp; deck techs →
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/products"
            className="group relative overflow-hidden rounded-2xl bg-[#1a1a2e] border border-white/10 hover:border-white/30 transition-colors"
          >
            <div className="relative h-full flex flex-col justify-between p-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Products
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-white mb-1">Gear up</h2>
                <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                  Shop →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {featuredDeck && (
        <div className="mt-20 relative overflow-hidden" style={{ minHeight: '380px' }}>
          {featuredDeck.frontmatter.image && (
            <div
              className="absolute inset-0 bg-cover bg-center scale-105"
              style={{ backgroundImage: `url(${featuredDeck.frontmatter.image})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d1a] via-[#0d0d1a]/85 to-[#0d0d1a]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-transparent to-[#0d0d1a]/30" />

          <div className="relative mx-auto max-w-7xl px-6 py-20 flex flex-col justify-center" style={{ minHeight: '380px' }}>
            <div className="max-w-xl">
              <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-widest text-[#7dd3fc]/70">
                Featured Deck · {featuredDeck.frontmatter.category}
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-3">
                {featuredDeck.frontmatter.title}
              </h2>
              {featuredDeck.frontmatter.commander && (
                <p className="text-[#7dd3fc] text-sm mb-4">
                  Commander: {featuredDeck.frontmatter.commander}
                </p>
              )}
              <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-md">
                {featuredDeck.frontmatter.description}
              </p>
              <Link
                href={`/decks/${featuredDeck.slug}`}
                className="inline-block rounded-lg bg-[#e94560] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c73652] transition-colors"
              >
                View Decklist →
              </Link>
            </div>
          </div>
        </div>
      )}

      {featuredContent.length > 0 && (
        <div className="mt-20 mx-auto max-w-7xl px-6">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-white">Latest Content</h2>
            <Link href="/content" className="text-sm text-slate-500 hover:text-white transition-colors">
              View all →
            </Link>
          </div>
          <div
            className="flex gap-4 overflow-x-auto pb-4"
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
          >
            {featuredContent.map((item) => {
              const thumbnail =
                item.frontmatter.thumbnail ??
                (item.frontmatter.youtubeId
                  ? `https://img.youtube.com/vi/${item.frontmatter.youtubeId}/maxresdefault.jpg`
                  : null);
              return (
                <a
                  key={item.slug}
                  href={item.frontmatter.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex-none w-72 rounded-xl overflow-hidden bg-[#1a1a2e] border border-white/10 hover:border-[#e94560]/50 transition-all duration-300"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="relative h-40 overflow-hidden bg-[#0f3460]">
                    {thumbnail && (
                      <img
                        src={thumbnail}
                        alt={item.frontmatter.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="rounded-full bg-[#e94560] p-3">
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-[#e94560] transition-colors">
                      {item.frontmatter.title}
                    </h3>
                  </div>
                </a>
              );
            })}
            <Link
              href="/content"
              className="flex-none w-48 rounded-xl border border-white/10 bg-[#1a1a2e]/50 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-white hover:border-white/30 transition-colors"
              style={{ scrollSnapAlign: 'start' }}
            >
              <span className="text-2xl">→</span>
              <span className="text-xs">See all</span>
            </Link>
          </div>
        </div>
      )}

      {featuredPosts.length > 0 && (
        <div className="mt-20 mx-auto max-w-7xl px-6 pb-24">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-white">From the Blog</h2>
            <Link href="/blog" className="text-sm text-slate-500 hover:text-white transition-colors">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {featuredPosts[0] && (
              <Link
                href={`/blog/${featuredPosts[0].slug}`}
                className="group lg:col-span-3 relative overflow-hidden rounded-2xl bg-[#1a1a2e] border border-white/10 hover:border-[#7dd3fc]/50 transition-all duration-300 flex flex-col"
              >
                {featuredPosts[0].frontmatter.coverImage && (
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={featuredPosts[0].frontmatter.coverImage}
                      alt={featuredPosts[0].frontmatter.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent" />
                  </div>
                )}
                <div className="flex flex-col flex-1 p-8 justify-end">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#7dd3fc]/60 mb-3">
                    {featuredPosts[0].frontmatter.publishedAt
                      ? new Date(featuredPosts[0].frontmatter.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })
                      : 'Recent'}
                  </span>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-3 leading-tight group-hover:text-[#7dd3fc] transition-colors">
                    {featuredPosts[0].frontmatter.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                    {featuredPosts[0].frontmatter.description}
                  </p>
                </div>
              </Link>
            )}

            <div className="lg:col-span-2 flex flex-col gap-4">
              {featuredPosts.slice(1, 3).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex-1 rounded-2xl bg-[#1a1a2e] border border-white/10 hover:border-[#7dd3fc]/50 transition-all duration-300 p-6 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#7dd3fc]/60 mb-3 block">
                      {post.frontmatter.publishedAt
                        ? new Date(post.frontmatter.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })
                        : 'Recent'}
                    </span>
                    <h3 className="font-display text-base font-bold text-white mb-2 leading-snug group-hover:text-[#7dd3fc] transition-colors line-clamp-2">
                      {post.frontmatter.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{post.frontmatter.description}</p>
                  </div>
                </Link>
              ))}
              {featuredPosts.length === 1 && (
                <Link
                  href="/blog"
                  className="flex-1 rounded-2xl border border-white/10 bg-[#1a1a2e]/40 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-colors p-6"
                >
                  <span className="text-sm">More posts →</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
