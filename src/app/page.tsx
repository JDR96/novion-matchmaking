import SearchBar from "@/components/SearchBar";
import Image from "next/image";

const features = [
  {
    title: "Vector Search",
    description:
      "Zoek in natuurlijke taal. AI begrijpt de context en vindt de meest relevante contacten uit ons netwerk.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    title: "17.500+ Contacten",
    description:
      "Gecombineerde database van LinkedIn en directe contacten, verrijkt met sector- en expertisedata.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Match Scoring",
    description:
      "Elke match krijgt een relevantiescore op basis van cosine similarity met uw zoekvraag.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy px-4 py-24 sm:px-6 sm:py-32">
        {/* Subtle pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(196,165,106,0.4) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Gold accent glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[500px] -translate-x-1/2 rounded-full bg-gold/5 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <Image
              src="/novion-logo.jpg"
              alt="Novion Capital"
              width={220}
              height={55}
              className="h-auto"
              priority
            />
          </div>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Contact{" "}
            <span className="text-gold-gradient">Intelligence</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/50">
            Beschrijf in het Nederlands wie u zoekt. Ons systeem doorzoekt
            17.500+ contacten via AI-gestuurde vector search en toont de meest
            relevante matches uit uw netwerk.
          </p>
          <div className="mx-auto mt-10 max-w-xl">
            <SearchBar hero />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-cream px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-white p-6 shadow-[0_4px_20px_hsla(213,71%,13%,0.06)] transition-shadow hover:shadow-[0_8px_30px_hsla(213,71%,13%,0.1)]"
              >
                <div className="mb-3 text-gold">{feature.icon}</div>
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-[15px] font-semibold text-foreground">
                  {feature.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-foreground">
            Hoe werkt het?
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Beschrijf uw zoekvraag",
                desc: "Typ in het Nederlands wie u zoekt. Bijvoorbeeld: 'iemand met ervaring in maritime logistics'.",
              },
              {
                step: "2",
                title: "AI genereert embeddings",
                desc: "Uw zoekvraag wordt omgezet naar een vector via OpenAI en vergeleken met 17.500+ contact-embeddings.",
              },
              {
                step: "3",
                title: "Top matches",
                desc: "U krijgt de meest relevante contacten, gesorteerd op similarity met naam, functie, sector en motivatie.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-gold">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
