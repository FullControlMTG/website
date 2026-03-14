import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0d0d1a] py-10 mt-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-[#7dd3fc] mb-3">
              FullControlMTG
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Competitive Magic: The Gathering strategy, decklists, and gameplay content.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/decks" className="hover:text-white transition-colors">Decklists</Link></li>
              <li><Link to="/content" className="hover:text-white transition-colors">Content</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Connect</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/support" className="hover:text-white transition-colors">Support Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FullControlMTG. Magic: The Gathering is © Wizards of the Coast.</p>
        </div>
      </div>
    </footer>
  );
}
