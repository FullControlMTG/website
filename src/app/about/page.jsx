export const metadata = { title: 'About — FullControlMTG' };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-4xl font-bold text-[#7dd3fc] mb-6">About</h1>

      <div className="space-y-6 text-slate-300 leading-relaxed">
        <p>
          <strong className="text-white">FullControlMTG</strong> is a Magic: The Gathering content brand
          focused on constructed gameplay. We create detailed deck techs,
          gameplay videos, and maintain up-to-date decklists for our community.
        </p>
        <p>
          Our philosophy is about taking <em>full control</em> of the game state — understanding your
          lines, knowing your combos, and playing with intention. Whether you&apos;re optimizing a storm line
          or tuning an aggro list, we want to help you play better Magic.
        </p>

        <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6 mt-8">
          <h2 className="font-display text-xl font-semibold text-white mb-3">What We Do</h2>
          <ul className="space-y-2 text-sm">
            {[
              'Publish and maintain curated decklists',
              'Produce deck tech and gameplay videos on YouTube',
              'Write in-depth strategy and card analysis content',
              'Foster a community of casual & competitive MTG players',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-[#7dd3fc] mt-0.5">▸</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
