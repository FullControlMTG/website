import Link from 'next/link';
import HeroCarousel from '@/components/ui/HeroCarousel';
import DeckCard from '@/components/ui/DeckCard';
import VideoCard from '@/components/ui/VideoCard';
import BlogCard from '@/components/ui/BlogCard';
import {
  getAllDecks,
  getAllContent,
  getAllPosts,
  getFeaturedDecks,
  getFeaturedContent,
  getFeaturedPosts,
} from '@/lib/markdown';

function SectionHeader({ eyebrow, title, href, linkLabel }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-[#7dd3fc]/70">
          {eyebrow}
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">{title}</h2>
      </div>
      <Link
        href={href}
        className="shrink-0 text-sm text-slate-400 hover:text-white transition-colors"
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

function CardRow({ className, children }) {
  return (
    <div
      className={`-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 ${className}`}
    >
      {children.map((child) => (
        <div key={child.key} className="w-[80%] shrink-0 snap-start sm:w-auto [&>*]:h-full">
          {child}
        </div>
      ))}
    </div>
  );
}

function ExploreTile({ href, label, count, noun, blurb, accent }) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#1a1a2e] p-4 sm:gap-6 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/30"
    >
      <div>
        <span className={`text-xs font-semibold uppercase tracking-widest ${accent}`}>{label}</span>
        <p className="mt-3 hidden text-sm text-slate-400 leading-relaxed sm:block">{blurb}</p>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-2xl sm:text-3xl font-bold text-white">
          {count}
          <span className="ml-2 hidden text-sm font-normal text-slate-500 sm:inline">{noun}</span>
        </span>
        <span className="hidden text-sm text-[#7dd3fc] group-hover:text-[#bae6fd] transition-colors sm:inline">→</span>
      </div>
    </Link>
  );
}

export default function Landing() {
  const allDecks = getAllDecks();
  const allContent = getAllContent();
  const allPosts = getAllPosts();
  const featuredDecks = getFeaturedDecks();
  const featuredContent = getFeaturedContent();
  const featuredPosts = getFeaturedPosts();

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

  const formats = [...new Set(allDecks.map((d) => d.frontmatter.category).filter(Boolean))];

  return (
    <div className="overflow-x-hidden">
      <HeroCarousel slides={heroSlides} />

      <section className="mx-auto max-w-7xl px-6 pt-14">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
            Take <span className="text-[#7dd3fc]">full control</span> of the game.
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Curated decklists, deck techs, and strategy writing for players who want to understand
            their lines and play with intention.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <ExploreTile
            href="/decks"
            label="Decklists"
            count={allDecks.length}
            noun="decks"
            blurb={formats.length ? `Maintained lists across ${formats.join(', ')}.` : 'Maintained, competitive lists.'}
            accent="text-[#7dd3fc]/80"
          />
          <ExploreTile
            href="/content"
            label="Videos"
            count={allContent.length}
            noun="videos"
            blurb="Deck techs and gameplay breakdowns on YouTube."
            accent="text-[#e94560]/80"
          />
          <ExploreTile
            href="/blog"
            label="Blog"
            count={allPosts.length}
            noun="articles"
            blurb="Deep dives on archetype history, combo timing, and strategy."
            accent="text-[#4ecdc4]/80"
          />
        </div>
      </section>

      {featuredDecks.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pt-20">
          <SectionHeader eyebrow="Decklists" title="Latest Decks" href="/decks" linkLabel="All decks" />
          <CardRow className="sm:grid-cols-2 lg:grid-cols-4">
            {featuredDecks.slice(0, 4).map((deck) => (
              <DeckCard key={deck.slug} deck={deck} />
            ))}
          </CardRow>
        </section>
      )}

      {featuredContent.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pt-20">
          <SectionHeader eyebrow="Content" title="Latest Videos" href="/content" linkLabel="All videos" />
          <CardRow className="sm:grid-cols-3">
            {featuredContent.slice(0, 3).map((item) => (
              <VideoCard key={item.slug} item={item} />
            ))}
          </CardRow>
        </section>
      )}

      {featuredPosts.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pt-20">
          <SectionHeader eyebrow="Blog" title="From the Blog" href="/blog" linkLabel="All posts" />
          <CardRow className="sm:grid-cols-3">
            {featuredPosts.slice(0, 3).map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </CardRow>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 pt-20">
        <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#16213e] to-[#0f3460]/60 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-bold text-white mb-2">Enjoying the content?</h2>
            <p className="text-slate-300 leading-relaxed">
              Learn more about FullControlMTG, or help keep the decklists and videos coming.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/about"
              className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/50 transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/support"
              className="rounded-lg bg-[#e94560] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c73652] transition-colors"
            >
              Support Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
