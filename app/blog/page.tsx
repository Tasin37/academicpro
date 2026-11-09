'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import SectionHeading from "../components/SectionHeading";
import HomeHeader from "../components/HomeHeader";

type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  authorName: string;
  coverImage?: string;
  readTime: string;
  createdAt: string;
  views?: number;
};

const CATEGORIES = [
  "All",
  "Academic Writing",
  "Formatting & Style",
  "Study Skills",
  "Research",
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isActive = true;

    const params = new URLSearchParams();
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());

    fetch(`/api/blogs?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isActive || !data) return;
        setPosts(data.posts || []);
      })
      .catch((err) => console.error("Failed to load blog posts:", err))
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [selectedCategory, searchQuery]);

  return (
    <div className="page-grid min-h-screen text-[#182329]">
      <HomeHeader />

      <main className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
        <SectionHeading
          eyebrow="Insights & Guides"
          title="Academic writing guides and student success strategies"
          description="Explore guides, citation walkthroughs, and research tips curated by academic professionals."
        />

        {/* Filter and Search Bar */}
        <div className="mt-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  selectedCategory === cat
                    ? "bg-[#182329] text-white shadow-xs"
                    : "border border-[#d9ddda] bg-white text-[#647176] hover:border-[#182329] hover:text-[#182329]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full max-w-sm">
            <svg
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search guides, citations, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-full border border-[#d9ddda] bg-white pl-10 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-[#416169] focus:ring-2 focus:ring-[#416169]/20"
            />
          </div>
        </div>

        {/* Articles Grid */}
        <div className="mt-12">
          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse rounded-2xl border border-[#d9ddda] bg-[#fbfaf7] p-8">
                  <div className="h-4 w-24 rounded bg-slate-200" />
                  <div className="mt-4 h-6 w-3/4 rounded bg-slate-200" />
                  <div className="mt-3 h-16 w-full rounded bg-slate-100" />
                  <div className="mt-6 h-4 w-1/3 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#b9c1bd] bg-[#fbfaf7] p-16 text-center text-[#647176]">
              <p className="text-lg font-semibold text-[#182329]">No articles found</p>
              <p className="mt-2 text-sm">
                Try selecting a different category or clearing your search keywords.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((article) => (
                <article
                  key={article._id}
                  className="flex flex-col justify-between rounded-2xl border border-[#d9ddda] bg-white p-7 shadow-xs transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div>
                    {article.coverImage ? (
                      <div className="mb-5 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                          className="h-48 w-full object-cover transition hover:scale-105 duration-300"
                        />
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#c94e39]">
                      <span className="rounded-md bg-[#f9d9d1]/40 px-2 py-0.5 text-[#c94e39]">
                        {article.category}
                      </span>
                      <span className="text-[#647176]">{article.readTime}</span>
                    </div>

                    <h2 className="mt-4 text-xl font-semibold leading-snug text-[#182329] hover:text-[#e8664d] transition">
                      <Link href={`/blog/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-[#647176] line-clamp-3">
                      {article.summary}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-[#d9ddda] pt-4 text-xs text-[#647176]">
                    <span>{new Date(article.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="font-bold text-[#182329] transition hover:text-[#e8664d]"
                    >
                      Read guide →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
