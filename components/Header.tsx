'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Overview' },
  { href: '/specification', label: 'Specification' },
  { href: '/examples', label: 'Examples' },
  { href: '/resolvers', label: 'Resolvers' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-bg border-b border-border">
      <div className="max-w-[1000px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-lg no-underline hover:opacity-80">
          Pact
        </Link>
        <nav className="flex gap-4 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`no-underline hover:opacity-80 transition-opacity ${
                pathname === link.href ? 'text-white' : 'text-text'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
