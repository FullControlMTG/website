export default function Products() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-[#7dd3fc] mb-2">Products</h1>
        <p className="text-slate-400">Accessories and gear for the discerning Magic: The Gathering player.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#1a1a2e] p-16 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="font-display text-2xl font-semibold text-white mb-3">Coming Soon</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          We're working on bringing you high-quality MTG accessories and products. Check back soon!
        </p>
      </div>
    </div>
  );
}
