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
    <header className="site-nav sticky top-0 z-50">
      <div className="max-w-[1000px] mx-auto px-6 h-[54px] flex items-center justify-between">
        <Link href="/" className="nav-mark">
          Pact
        </Link>
        <nav className="flex gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link${pathname === link.href ? ' active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
