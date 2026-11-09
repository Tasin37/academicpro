'use client';

import { useEffect, useState } from "react";
import SectionHeading from "./SectionHeading";
import TestimonialCard from "./TestimonialCard";

type TestimonialItem = {
  _id: string;
  name: string;
  role: string;
  institution?: string;
  quote: string;
  rating: number;
  createdAt?: string;
};

const REVIEWS_PER_PAGE = 6;

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [role, setRole] = useState("Undergraduate Student");
  const [institution, setInstitution] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  async function loadTestimonials() {
    try {
      const res = await fetch("/api/testimonials");
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials || []);
      }
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;
    fetch("/api/testimonials")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isActive || !data) return;
        setTestimonials(data.testimonials || []);
      })
      .catch((err) => console.error("Failed to load testimonials:", err))
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          role: role.trim(),
          institution: institution.trim(),
          quote: quote.trim(),
          rating,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ text: "Thank you! Your review has been published.", type: "success" });
        setName("");
        setInstitution("");
        setQuote("");
        setRating(5);
        setCurrentPage(1);
        await loadTestimonials();
        setTimeout(() => {
          setIsModalOpen(false);
          setFeedback(null);
        }, 2000);
      } else {
        setFeedback({ text: data.error || "Failed to submit review.", type: "error" });
      }
    } catch {
      setFeedback({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const averageScore = testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / testimonials.length).toFixed(1)
    : "5.0";
  const totalPages = Math.ceil(testimonials.length / REVIEWS_PER_PAGE);
  const visibleTestimonials = testimonials.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  return (
    <section className="bg-slate-100 px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Testimonials"
            title="Students trust AcademicPro"
            description="Real feedback from learners who achieved better grades and reduced stress with our support."
          />

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {/* Live Stats Pill */}
            <div className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs">
              <span aria-hidden="true">★</span> <span className="font-bold text-[#182329]">{averageScore}/5.0</span> ({testimonials.length} reviews)
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#e8664d] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#c94e39]"
            >
              <span aria-hidden="true">✍</span> Leave a Review
            </button>
          </div>
        </div>

        {/* Dynamic Reviews Grid */}
        <div className="mt-14">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-7">
                  <div className="h-4 w-20 rounded bg-slate-200" />
                  <div className="mt-4 h-16 w-full rounded bg-slate-100" />
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-1/3 rounded bg-slate-200" />
                      <div className="h-3 w-1/2 rounded bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleTestimonials.map((item) => (
                <TestimonialCard
                  key={item._id}
                  quote={item.quote}
                  name={item.name}
                  role={item.role}
                  institution={item.institution}
                  rating={item.rating}
                />
              ))}
            </div>
          )}
        </div>

        {!loading && totalPages > 1 ? (
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
      </div>

      {/* Review Submission Modal */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#182329]">Share Your Experience</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Help other students learn about your experience with AcademicPro.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setFeedback(null);
                }}
                className="text-lg font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {feedback ? (
              <div
                className={`mt-4 rounded-xl border p-3 text-xs font-semibold ${
                  feedback.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {feedback.text}
              </div>
            ) : null}

            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  YOUR RATING
                </label>
                <div className="flex items-center gap-1.5 text-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="cursor-pointer transition hover:scale-110"
                      aria-label={`${star} star`}
                    >
                      <span className={(hoverRating || rating) >= star ? "text-amber-500" : "text-slate-300"}>
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-600">
                    {rating} out of 5 stars
                  </span>
                </div>
              </div>

              {/* Name & Academic Role */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    YOUR NAME
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 w-full rounded-xl bg-[#f1f4f6] px-3.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#e8664d]/25 focus:border focus:border-[#e8664d]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    ACADEMIC LEVEL / DEGREE
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Undergraduate, Biology"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-10 w-full rounded-xl bg-[#f1f4f6] px-3.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#e8664d]/25 focus:border focus:border-[#e8664d]"
                  />
                </div>
              </div>

              {/* University / Institution */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  COLLEGE / UNIVERSITY (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Columbia University"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="h-10 w-full rounded-xl bg-[#f1f4f6] px-3.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#e8664d]/25 focus:border focus:border-[#e8664d]"
                />
              </div>

              {/* Review Quote */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  YOUR FEEDBACK
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell other students about the quality, turnaround speed, and communication..."
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full rounded-xl bg-[#f1f4f6] p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#e8664d]/25 focus:border focus:border-[#e8664d]"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFeedback(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#e8664d] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-[#c94e39] disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
