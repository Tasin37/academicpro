import Link from "next/link";
import SectionHeading from "../components/SectionHeading";

const tiers = [
  {
    name: "High School / College",
    price: "$15",
    unit: "per page",
    description: "Ideal for foundational coursework, response essays, and standard lab reports.",
    features: [
      "Standard academic formatting",
      "Plagiarism report included",
      "Free title and reference pages",
      "7-day revision window",
      "Direct chat with writer",
    ],
    highlighted: false,
  },
  {
    name: "Undergraduate (Bachelor)",
    price: "$22",
    unit: "per page",
    description: "Tailored for rigorous university research papers, case studies, and term projects.",
    features: [
      "Subject specialist matching",
      "Peer-reviewed academic sources",
      "Complete bibliography & citations",
      "14-day revision window",
      "Priority writer support",
    ],
    highlighted: true,
  },
  {
    name: "Graduate (Master & PhD)",
    price: "$35",
    unit: "per page",
    description: "For complex theses, dissertations, statistical analysis, and journal publications.",
    features: [
      "Doctoral-level writer assignment",
      "Statistical software validation",
      "Chapter-by-chapter delivery",
      "30-day extended revisions",
      "Dedicated account manager",
    ],
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="page-grid min-h-screen text-[#182329]">
      <header className="sticky top-0 z-10 border-b border-[#d9ddda]/80 bg-[#f5f4f0]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-[#182329]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8664d] text-xs font-bold text-white">A</span>
            Academic<span className="text-[#e8664d]">Pro</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-[#647176]">
            <Link href="/" className="transition hover:text-[#e8664d]">Home</Link>
            <Link href="/services" className="transition hover:text-[#e8664d]">Services</Link>
            <Link href="/blog" className="transition hover:text-[#e8664d]">Blog</Link>
            <Link href="/contact" className="transition hover:text-[#e8664d]">Contact</Link>
            <Link href="/auth" className="rounded-full bg-[#182329] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e8664d]">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-16">
        <SectionHeading
          eyebrow="Transparent Rates"
          title="Simple, transparent pricing per academic level"
          description="No hidden fees. Every order includes original research, formatting, formatting citations, and full revision guarantees."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col justify-between border p-8 shadow-sm transition hover:shadow-xl ${
                tier.highlighted
                  ? "border-[#e8664d] bg-[#fbfaf7] ring-2 ring-[#e8664d]/20"
                  : "border-[#d9ddda] bg-[#fbfaf7]"
              }`}
            >
              <div>
                {tier.highlighted ? (
                  <span className="inline-block rounded-full bg-[#e8664d] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Most Popular
                  </span>
                ) : null}
                <h3 className={`text-xl font-semibold text-[#182329] ${tier.highlighted ? "mt-4" : ""}`}>
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-[#647176]">{tier.description}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight text-[#182329]">{tier.price}</span>
                  <span className="text-sm text-[#647176]">{tier.unit}</span>
                </div>
                <ul className="mt-8 space-y-3 text-sm text-[#39484d]">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="text-[#e8664d]">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-[#d9ddda]">
                <Link
                  href="/auth?mode=register"
                  className={`block w-full text-center rounded-full py-3 text-sm font-semibold transition ${
                    tier.highlighted
                      ? "bg-[#e8664d] text-white hover:bg-[#f07860]"
                      : "bg-[#182329] text-white hover:bg-[#e8664d]"
                  }`}
                >
                  Order at this level
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}