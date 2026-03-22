"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 no-underline transition-opacity hover:opacity-80"
          data-testid="link-home"
        >
          <Image
            src="/novion-icon.jpg"
            alt="Novion"
            width={36}
            height={36}
            className="rounded"
          />
          <span className="font-[family-name:var(--font-space-grotesk)] text-[17px] font-semibold tracking-tight text-foreground">
            NOVION
          </span>
        </Link>
        <nav className="flex items-center gap-0.5">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-[13px] font-medium text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
            data-testid="link-nav-home"
          >
            Home
          </Link>
          <Link
            href="/zoeken"
            className="rounded-full px-4 py-2 text-[13px] font-medium text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
            data-testid="link-nav-search"
          >
            Zoeken
          </Link>
          <Link
            href="/contacten"
            className="rounded-full px-4 py-2 text-[13px] font-medium text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
            data-testid="link-nav-contacts"
          >
            Contacten
          </Link>
        </nav>
      </div>
    </header>
  );
}
