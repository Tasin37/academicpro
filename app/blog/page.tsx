import Link from "next/link";
import SectionHeading from "../components/SectionHeading";

const articles = [
  {
    title: "How to Structure a Literature Review That Gets an A",
    category: "Academic Writing",
    readTime: "6 min read",
    date: "October 12, 2026",
    summary: "Learn the thematic, chronological, and methodological approaches to organizing your literature review effectively.",
  },
  {
    title: "Mastering APA 7th Edition: The Most Common Citation Pitfalls",
    category: "Formatting & Style",
    readTime: "4 min read",
    date: "September 28, 2026",
    summary: "A practical breakdown of tricky citation scenarios: multiple authors, online lecture slides, and AI tool attribution.",
  },
  {
    title: "5 Time Management Habits of Top Performing College Students",
    category: "Study Skills",
    readTime: "5 min read",
    date: "September 15, 2026",
    summary: "How to block time for deep research, outline papers ahead of deadlines, and manage semester workloads without burning out.",
  },
];

export default function BlogPage() {
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
            <Link href="/pricing" className="transition hover:text-[#e8664d]">Pricing</Link>
            <Link href="/contact" className="transition hover:text-[#e8664d]">Contact</Link>
            <Link href="/auth" className="rounded-full bg-[#182329] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e8664d]">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-16">
        <SectionHeading
          eyebrow="Insights & Guides"
          title="Academic writing guides and student success strategies"
          description="Explore guides, citation walkthroughs, and research tips curated by academic professionals."
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article key={article.title} className="flex flex-col justify-between border border-[#d9ddda] bg-[#fbfaf7] p-8 shadow-sm transition hover:shadow-lg">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#c94e39]">
                  <span>{article.category}</span>
                  <span className="text-[#647176]">{article.readTime}</span>
                </div>
                <h2 className="mt-4 text-xl font-semibold leading-snug text-[#182329]">
                  {article.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#647176]">
                  {article.summary}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#d9ddda] flex items-center justify-between text-xs text-[#647176]">
                <span>{article.date}</span>
                <span className="font-semibold text-[#182329] hover:text-[#e8664d]">Read guide →</span>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}