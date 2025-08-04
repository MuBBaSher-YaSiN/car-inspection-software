'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils'; // optional utility to manage classNames

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/admin/dashboard', label: 'Admin Dashboard' },
    { href: '/team/dashboard', label: 'Team Dashboard' },
  ];

  return (
    <header className="w-full border-b bg-background p-4 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-xl font-bold text-primary">
          AutoSure
        </Link>
        <nav className="space-x-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium hover:text-primary transition-colors',
                pathname.startsWith(link.href) && 'text-primary underline'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <ThemeToggle />
    </header>
  );
}
