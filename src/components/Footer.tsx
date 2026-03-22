"use client";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-cream py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center sm:px-6">
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs font-medium uppercase tracking-widest text-foreground/30">
          Novion &middot; Turning Vision into Value
        </p>
        <p className="text-xs text-foreground/20">
          &copy; {new Date().getFullYear()} Novion Capital. Contact Intelligence System.
        </p>
        <a
          href="https://www.perplexity.ai/computer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-foreground/10 transition-colors hover:text-foreground/25"
        >
          Created with Perplexity Computer
        </a>
      </div>
    </footer>
  );
}
