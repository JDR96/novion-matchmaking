"use client";

import Link from "next/link";
import NovionLogo from "./NovionLogo";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#0f1729]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-white no-underline transition-opacity hover:opacity-80"
          data-testid="link-home"
        >
          <NovionLogo size={28} />
          <span className="text-[15px] font-semibold tracking-tight">
            Novion
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            data-testid="link-nav-home"
          >
            Home
          </Link>
          <Link
            href="/zoeken"
            className="rounded-md px-3 py-1.5 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            data-testid="link-nav-search"
          >
            Zoeken
          </Link>
        </nav>
      </div>
    </header>
  );
}
