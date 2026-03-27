'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#features',     label: 'Features'     },
  { href: '/#routes',       label: 'Routes'       },
  { href: '/#operators',    label: 'For Operators' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const base = isHome && !scrolled
    ? 'bg-transparent border-transparent'
    : 'bg-white/95 backdrop-blur-md border-slate-200/80 shadow-sm';

  return (
    <header className={`fixed top-0 inset-x-0 z-50 border-b transition-all duration-300 ${base}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <span className={`font-heading font-extrabold text-lg tracking-tight ${isHome && !scrolled ? 'text-white' : 'text-slate-900'}`}>
            SafeTrack
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${isHome && !scrolled ? 'text-slate-300' : 'text-slate-600'}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className={`font-heading font-semibold text-sm px-4 py-2 rounded-lg transition-colors ${
              isHome && !scrolled
                ? 'text-slate-300 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </Link>
          <Link
            href="/signup/passenger"
            className="font-heading font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-all shadow-md shadow-blue-600/20"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-2 rounded-lg ${isHome && !scrolled ? 'text-white' : 'text-slate-700'}`}
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-2">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 space-y-2 border-t border-slate-100 mt-2">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block text-center py-2.5 rounded-lg border border-slate-200 text-sm font-heading font-semibold text-slate-700"
            >
              Sign In
            </Link>
            <Link
              href="/signup/passenger"
              onClick={() => setMenuOpen(false)}
              className="block text-center py-2.5 rounded-lg bg-blue-600 text-sm font-heading font-bold text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
