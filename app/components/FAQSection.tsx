"use client";

import { useEffect, useState } from "react";
import SectionHeading from "./SectionHeading";
import FAQItem from "./FAQItem";

type FAQ = { _id: string; question: string; answer: string };
const FAQS_PER_PAGE = 4;

export default function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/api/faqs")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data) setFaqs(data.faqs || []);
      })
      .catch((error) => console.error("Failed to load FAQs:", error));
  }, []);

  const totalPages = Math.ceil(faqs.length / FAQS_PER_PAGE);
  const visibleFaqs = faqs.slice(
    (currentPage - 1) * FAQS_PER_PAGE,
    currentPage * FAQS_PER_PAGE
  );

  return (
    <section id="faq" className="px-6 py-20 sm:px-10 lg:px-16">
      <SectionHeading
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Get quick answers about deadlines, revisions, and the support process."
      />
      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        {visibleFaqs.map((item) => (
          <FAQItem key={item._id} question={item.question} answer={item.answer} />
        ))}
      </div>
      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-[#416169] hover:text-[#416169] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-slate-600" aria-live="polite">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="rounded-full bg-[#416169] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#324d54] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}
