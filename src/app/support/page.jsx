import Link from 'next/link';

export const metadata = { title: 'Support Us — FullControlMTG' };

const items = [
  {
    title: 'Watch & Subscribe',
    description: 'Subscribe to our YouTube channel and watch our videos. Your support keeps us going.',
    icon: '▶',
    cta: 'YouTube',
    href: 'https://www.youtube.com/channel/UCOsYQm0E3ozKUhRTpM1PdPg/',
    external: true,
  },
  {
    title: 'Explore Decklists',
    description: 'Explore our expansive decklist collection on Moxfield to inspire your next deck!',
    icon: '🃏',
    cta: 'Moxfield',
    href: 'https://moxfield.com/users/FullControlMTG',
    external: true,
  },
  {
    title: 'Explore the FullControlMTG Community',
    description: 'Engage with our Discord community to cross-pollinate your ideas with other likeminded MTG enjoyers.',
    icon: '🤝',
    cta: 'Join the Discord',
    href: 'https://discord.gg/fsaXnZeJdp',
    external: false,
  },
  {
    title: 'Shop Our Products',
    description: 'Explore membership-only exclusives, access to the Patreon, and other products that directly support the channel!',
    icon: '🛒',
    cta: 'Products',
    href: '/products',
    external: false,
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-4xl font-bold text-[#7dd3fc] mb-6">Support Us</h1>
      <p className="text-slate-400 mb-8 leading-relaxed">
        FullControlMTG is a passion project. If you enjoy our content and want to help us keep creating,
        here are some ways you can support us — most of them are free!
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(({ title, description, icon, cta, href, external }) => {
          const className =
            'group flex flex-col gap-3 rounded-xl border border-white/10 bg-[#1a1a2e] p-6 hover:border-[#7dd3fc]/50 transition-all';
          const inner = (
            <>
              <span className="text-3xl">{icon}</span>
              <h2 className="font-semibold text-white group-hover:text-[#7dd3fc] transition-colors">{title}</h2>
              <p className="text-sm text-slate-400 flex-1">{description}</p>
              <span className="text-sm font-medium text-[#e94560]">{cta} →</span>
            </>
          );
          return external ? (
            <a key={title} href={href} target="_blank" rel="noopener noreferrer" className={className}>
              {inner}
            </a>
          ) : (
            <Link key={title} href={href} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
