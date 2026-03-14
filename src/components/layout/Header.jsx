import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const navLinks = [
  { to: '/decks',   label: 'Decklists' },
  { to: '/content', label: 'Content' },
  { to: '/products', label: 'Products' },
  { to: '/about',   label: 'About' },
  { to: '/support', label: 'Support' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0d1a]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-wider text-[#7dd3fc] hover:text-[#bae6fd] transition-colors"
        >
          FullControl<span className="text-white">MTG</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[#7dd3fc]'
                    : 'text-slate-300 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          className="md:hidden text-slate-300 hover:text-white"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-white/10 bg-[#0d0d1a] px-6 pb-4">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-[#7dd3fc]' : 'text-slate-300 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
