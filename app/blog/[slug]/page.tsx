'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  authorName: string;
  coverImage?: string;
  readTime: string;
  createdAt: string;
  views?: number;
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    let isActive = true;

    fetch(`/api/blogs/${slug}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Article not found.");
        }
        return res.json() as Promise<{ post: BlogPost }>;
      })
      .then((data) => {
        if (!isActive) return;
        setPost(data.post);
      })
      .catch((err) => {
        if (!isActive) return;
        setError(err.message || "Failed to load article.");
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [slug]);

  // Clean formatting for markdown-style headings, quotes, and paragraphs
  function renderFormattedContent(rawContent: string) {
    const blocks = rawContent.split(/\n\n+/);

    return blocks.map((block, index) => {
      const trimmed = block.trim();

      // Heading 3: ### Heading
      if (trimmed.startsWith("### ")) {
        return (
          <h3 key={index} className="mt-8 mb-3 text-xl font-bold tracking-tight text-[#182329]">
            {trimmed.replace(/^###\s+/, "")}
          </h3>
        );
      }

      // Heading 2: ## Heading
      if (trimmed.startsWith("## ")) {
        return (
          <h2 key={index} className="mt-10 mb-4 text-2xl font-bold tracking-tight text-[#182329]">
            {trimmed.replace(/^##\s+/, "")}
          </h2>
        );
      }

      // Blockquote: > Quote
      if (trimmed.startsWith("> ")) {
        return (
          <blockquote
            key={index}
            className="my-6 border-l-4 border-[#e8664d] bg-[#fbfaf7] py-3 px-5 text-sm italic leading-relaxed text-[#39484d]"
          >
            {trimmed.replace(/^>\s+/, "")}
          </blockquote>
        );
      }

      // Bullet list: - Item or * Item
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const items = trimmed.split("\n").filter((line) => line.trim().length > 0);
        return (
          <ul key={index} className="my-4 space-y-2 list-disc pl-6 text-sm sm:text-base leading-relaxed text-[#39484d]">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^[-*]\s+/, "")}</li>
            ))}
          </ul>
        );
      }

      // Standard paragraph
      return (
        <p key={index} className="my-4 text-base sm:text-lg leading-relaxed text-[#39484d]">
          {trimmed}
        </p>
      );
    });
  }

  return (
    <div className="page-grid min-h-screen text-[#182329]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#d9ddda]/80 bg-[#f5f4f0]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-[#182329]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8664d] text-xs font-bold text-white">A</span>
            Academic<span className="text-[#e8664d]">Pro</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-[#647176]">
            <Link href="/" className="transition hover:text-[#e8664d]">Home</Link>
            <Link href="/services" className="transition hover:text-[#e8664d]">Services</Link>
            <Link href="/blog" className="text-[#e8664d] font-semibold">Blog</Link>
            <Link href="/contact" className="transition hover:text-[#e8664d]">Contact</Link>
            <Link href="/auth" className="rounded-full bg-[#182329] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e8664d]">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#647176] transition hover:text-[#e8664d]"
          >
            ← Back to all articles
          </Link>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-32 rounded bg-slate-200" />
            <div className="h-10 w-3/4 rounded bg-slate-200" />
            <div className="h-4 w-48 rounded bg-slate-200" />
            <div className="h-64 w-full rounded-2xl bg-slate-100" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-5/6 rounded bg-slate-200" />
              <div className="h-4 w-4/6 rounded bg-slate-200" />
            </div>
          </div>
        ) : error || !post ? (
          <div className="rounded-3xl border border-dashed border-[#b9c1bd] bg-white p-16 text-center text-[#647176]">
            <h2 className="text-xl font-bold text-[#182329]">Article not found</h2>
            <p className="mt-2 text-sm text-[#647176]">
              {error || "The guide you are looking for may have been moved or unpublished."}
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex rounded-full bg-[#182329] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#e8664d]"
            >
              Browse other guides
            </Link>
          </div>
        ) : (
          <article>
            {/* Article Meta Bar */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-md bg-[#f9d9d1] px-2.5 py-1 font-bold text-[#c94e39] uppercase tracking-wider">
                {post.category}
              </span>
              <span className="text-[#647176]">•</span>
              <span className="text-[#647176]">{post.readTime}</span>
              <span className="text-[#647176]">•</span>
              <span className="text-[#647176]">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-6 text-3xl sm:text-5xl font-bold tracking-tight text-[#182329] leading-tight">
              {post.title}
            </h1>

            {/* Author */}
            <div className="mt-6 flex items-center gap-3 border-y border-[#d9ddda] py-4 text-xs font-medium text-[#647176]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#416169] text-xs font-bold text-white">
                {post.authorName.charAt(0)}
              </span>
              <div>
                <p className="font-bold text-[#182329]">{post.authorName}</p>
                <p className="text-[11px] text-slate-500">Academic Writing Specialist</p>
              </div>
            </div>

            {/* Lead Excerpt */}
            <p className="mt-8 text-lg sm:text-xl font-medium leading-relaxed text-[#182329]">
              {post.summary}
            </p>

            {/* Cover Image */}
            {post.coverImage ? (
              <div className="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImage}
                  alt={post.title}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="max-h-[420px] w-full object-cover"
                />
              </div>
            ) : null}

            {/* Content Body */}
            <div className="mt-8 border-t border-[#d9ddda] pt-8">
              {renderFormattedContent(post.content)}
            </div>

            {/* Bottom Callout / Next Steps */}
            <div className="mt-16 rounded-2xl border border-[#d9ddda] bg-[#fbfaf7] p-8 text-center sm:p-10">
              <h3 className="text-2xl font-bold text-[#182329]">Need tailored academic support?</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-[#647176]">
                Connect directly with verified academic writers for essays, research papers, and thesis review.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/auth?mode=register"
                  className="rounded-full bg-[#e8664d] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#f07860]"
                >
                  Start an Assignment
                </Link>
                <Link
                  href="/blog"
                  className="rounded-full border border-[#d9ddda] bg-white px-8 py-3 text-sm font-semibold text-[#182329] transition hover:border-[#182329]"
                >
                  Browse More Guides
                </Link>
              </div>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
