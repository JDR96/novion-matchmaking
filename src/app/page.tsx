import SearchBar from "@/components/SearchBar";

const features = [
  {
    title: "Vector Search",
    description:
      "Zoek in natuurlijke taal. AI begrijpt de context en vindt de meest relevante contacten.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    title: "17.500+ Contacten",
    description:
      "Gecombineerde database van LinkedIn en iPhone-contacten, verrijkt met sector- en expertisedata.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
      "Elke match krijgt een relevantiescore (0-1) op basis van cosine similarity met de zoekvraag.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-[#0f1729] to-[#162033] px-4 py-20 sm:px-6 sm:py-28">
        {/* Subtle grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Accent glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse-ring" />
            Contact Intelligence System
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Vind de juiste mensen
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-white/50">
            Beschrijf in het Nederlands wie je zoekt. Novion doorzoekt 17.500+
            contacten via AI-gestuurde vector search en toont de meest relevante
            matches.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar hero />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((feature, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 text-primary">{feature.icon}</div>
              <h2 className="text-[15px] font-semibold text-foreground">
                {feature.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-card px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-semibold text-foreground">
            Hoe werkt het?
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Beschrijf je zoekvraag",
                desc: "Typ in het Nederlands wie je zoekt. Bijvoorbeeld: 'iemand met ervaring in maritime logistics'.",
              },
              {
                step: "2",
                title: "AI genereert embeddings",
                desc: "Je zoekvraag wordt omgezet naar een vector via OpenAI. Deze wordt vergeleken met 17.500+ contact-embeddings.",
              },
              {
                step: "3",
                title: "Top-10 matches",
                desc: "Je krijgt de 10 meest relevante contacten, gesorteerd op cosine similarity met naam, functie, sector en motivatie.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
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
