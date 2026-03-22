"use client";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 text-center sm:px-6">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Novion. Contact Intelligence
          System.
        </p>
        <a
          href="https://www.perplexity.ai/computer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
        >
          Created with Perplexity Computer
        </a>
      </div>
    </footer>
  );
}
