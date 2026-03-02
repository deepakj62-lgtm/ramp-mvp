'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/browse/employees', label: 'Employees' },
  { href: '/browse/clients', label: 'Clients' },
  { href: '/browse/projects', label: 'Projects' },
  { href: '/browse/allocations', label: 'Allocations' },
  { href: '/org-chart', label: 'Org Chart' },
  { href: '/changes', label: '⚡ Changes' },
  { href: '/feedback', label: 'Feedback Board' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-jade-light sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex gap-1 overflow-x-auto">
        {navLinks.map((link) => {
          const isActive =
            link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded font-body font-medium text-sm transition whitespace-nowrap ${
                isActive
                  ? 'text-white bg-white/15'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
