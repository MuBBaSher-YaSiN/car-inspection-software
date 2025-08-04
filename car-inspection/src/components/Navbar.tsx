'use client';

import { ThemeToggle } from '@/components/theme-toggle';

export default function Navbar() {
  return (
    <header className="w-full border-b bg-background p-4 flex items-center justify-between">
      {/* <h1 className="text-xl font-bold">AutoSure</h1> */}
        <h1 className="text-xl font-bold">DriveProof</h1>
      <ThemeToggle />
    </header>
  );
}
