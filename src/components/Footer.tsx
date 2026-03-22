"use client";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center sm:px-6">
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs font-medium uppercase tracking-widest text-white/40">
          Novion &middot; Turning Vision into Value
        </p>
        <p className="text-xs text-white/25">
          &copy; {new Date().getFullYear()} Novion Capital. Contact Intelligence System.
        </p>
        <a
          href="https://www.perplexity.ai/computer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-white/15 transition-colors hover:text-white/30"
        >
          Created with Perplexity Computer
        </a>
      </div>
    </footer>
  );
}
