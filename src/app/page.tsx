import HeroChatInput from "@/components/HeroChatInput";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "AI Chat Assistent",
    description:
      "Stel uw vraag in natuurlijke taal. Onze AI-assistent begrijpt context, stelt verhelderende vragen en vindt de beste matches.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
    title: "Web Research",
    description:
      "Bij elke match zoekt de assistent actuele informatie over de organisatie, zodat u direct context heeft.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero — warm cream background */}
      <section className="relative overflow-hidden bg-cream px-4 py-24 sm:px-6 sm:py-32">
        {/* Subtle gold accent glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[400px] -translate-x-1/2 rounded-full bg-gold/5 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <Image
              src="/novion-logo.png"
              alt="Novion Capital"
              width={260}
              height={46}
              className="h-auto"
              priority
            />
          </div>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Contact{" "}
            <span className="text-gold-gradient">Intelligence</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Beschrijf wie u zoekt en onze AI-assistent vindt de beste matches
            uit 17.500+ contacten — inclusief actuele bedrijfsinformatie.
          </p>

          {/* Chat input that navigates to /zoeken */}
          <div className="mx-auto mt-10 max-w-xl">
            <HeroChatInput />
          </div>

          {/* Or direct link */}
          <div className="mt-4">
            <Link
              href="/zoeken"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Start een gesprek
            </Link>
          </div>
        </div>
      </section>

      {/* Features — white background */}
      <section className="border-t border-border bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-cream/50 p-6 transition-shadow hover:shadow-[0_8px_30px_hsla(36,30%,50%,0.08)]"
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

      {/* How it works — cream background */}
      <section className="border-t border-border bg-cream px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-foreground">
            Hoe werkt het?
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Stel uw vraag",
                desc: "Beschrijf in het Nederlands wie u zoekt. Onze AI stelt verhelderende vragen als uw vraag breed is.",
              },
              {
                step: "2",
                title: "AI zoekt & verrijkt",
                desc: "De assistent doorzoekt 17.500+ contacten via vector search en zoekt actuele informatie over relevante organisaties.",
              },
              {
                step: "3",
                title: "Resultaten met context",
                desc: "U krijgt contactkaarten met match-scores én een onderbouwde toelichting waarom iemand relevant is.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-gold-dark">
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
