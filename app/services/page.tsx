import Link from "next/link";
import SectionHeading from "../components/SectionHeading";
import ServiceCard from "../components/ServiceCard";

const services = [
  {
    icon: "01",
    title: "Essay & Paper Writing",
    description: "Original, custom essays and research papers written from scratch following your grading rubric.",
  },
  {
    icon: "02",
    title: "Dissertation & Thesis",
    description: "In-depth chapter drafting, literature review synthesis, and methodology formulation for graduate work.",
  },
  {
    icon: "03",
    title: "Proofreading & Editing",
    description: "Grammar, syntax, formatting (APA, MLA, Chicago, Harvard), and plagiarism checking by human editors.",
  },
  {
    icon: "04",
    title: "STEM & Problem Solving",
    description: "Calculations, case studies, coding assignments, and data analysis supported by qualified domain tutors.",
  },
];

export default function ServicesPage() {
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
            <Link href="/pricing" className="transition hover:text-[#e8664d]">Pricing</Link>
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
          eyebrow="Our Services"
          title="Expert academic support for every discipline"
          description="Whatever your field of study, our vetted academic specialists provide high-quality, tailored assistance on your timeline."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>

        <div className="mt-20 border border-[#d9ddda] bg-[#fbfaf7] p-8 text-center sm:p-12">
          <h2 className="text-3xl font-semibold">Need a custom assignment plan?</h2>
          <p className="mx-auto mt-4 max-w-xl text-[#647176]">
            Create a free student account, submit your requirements, and receive quotes from subject matter experts in minutes.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/auth?mode=register"
              className="rounded-full bg-[#e8664d] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#f07860]"
            >
              Get Started Now
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-[#d9ddda] bg-white px-8 py-3 text-sm font-semibold text-[#182329] transition hover:border-[#182329]"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}