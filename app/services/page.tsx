import Link from "next/link";
import SectionHeading from "../components/SectionHeading";
import ServiceCard from "../components/ServiceCard";
import HomeHeader from "../components/HomeHeader";

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
      <HomeHeader />

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
              href="/contact"
              className="rounded-full border border-[#d9ddda] bg-white px-8 py-3 text-sm font-semibold text-[#182329] transition hover:border-[#182329]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}