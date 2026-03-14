import { Link } from 'react-router-dom';
import HeroCarousel from '../components/ui/HeroCarousel';
import DeckCard from '../components/ui/DeckCard';
import VideoCard from '../components/ui/VideoCard';
import { getFeaturedDecks, getFeaturedContent } from '../utils/markdown';

const featuredDecks = getFeaturedDecks();
const featuredContent = getFeaturedContent();

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

export default function Landing() {
  return (
    <div>
      <HeroCarousel slides={heroSlides} />

      <div className="mx-auto max-w-7xl px-6 py-16 space-y-20">
        <section>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                to: '/decks',
                title: 'Decklists',
                description: 'Browse our curated Commander & competitive decklists with Moxfield integration.',
                icon: '🃏',
              },
              {
                to: '/content',
                title: 'Content',
                description: 'Deck techs, gameplay videos, and in-depth strategy guides on YouTube.',
                icon: '▶',
              },
              {
                to: '/products',
                title: 'Products',
                description: 'Accessories, playmats, and gear for the discerning MTG player.',
                icon: '🛒',
              },
            ].map(({ to, title, description, icon }) => (
              <Link
                key={to}
                to={to}
                className="group flex flex-col gap-3 rounded-xl border border-white/10 bg-[#1a1a2e] p-6 hover:border-[#7dd3fc]/50 transition-all hover:-translate-y-1"
              >
                <span className="text-3xl">{icon}</span>
                <h2 className="font-display text-lg font-semibold text-white group-hover:text-[#7dd3fc] transition-colors">
                  {title}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
                <span className="mt-auto text-sm font-medium text-[#e94560] group-hover:text-[#c73652]">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {featuredDecks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-[#7dd3fc]">Featured Decklists</h2>
              <Link to="/decks" className="text-sm text-slate-400 hover:text-white transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredDecks.map((deck) => (
                <DeckCard key={deck.slug} deck={deck} />
              ))}
            </div>
          </section>
        )}

        {featuredContent.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-[#7dd3fc]">Latest Content</h2>
              <Link to="/content" className="text-sm text-slate-400 hover:text-white transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredContent.map((item) => (
                <VideoCard key={item.slug} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
