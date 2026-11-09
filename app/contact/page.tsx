'use client';

import { useState } from "react";
import SectionHeading from "../components/SectionHeading";
import HomeHeader from "../components/HomeHeader";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Unable to send your message.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-grid min-h-screen text-[#182329]">
      <HomeHeader />

      <main className="mx-auto max-w-5xl px-6 py-20 sm:px-10 lg:px-16">
        <SectionHeading
          eyebrow="Get in Touch"
          title="We are here to support your academic goals"
          description="Have questions about our writers, turnaround times, or custom assignment quotes? Send us a message and our support team will reply within 1 hour."
        />

        <div className="mt-16 grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div className="border border-[#d9ddda] bg-[#fbfaf7] p-8 shadow-sm">
            <h2 className="text-xl font-semibold">Contact Information</h2>
            <div className="mt-6 space-y-5 text-sm text-[#39484d]">
              <div>
                <p className="font-semibold text-[#182329]">Email Support</p>
                <a href="mailto:hello@academicpro.com" className="mt-1 block text-[#e8664d] hover:underline">
                  hello@academicpro.com
                </a>
              </div>
              <div>
                <p className="font-semibold text-[#182329]">Operating Hours</p>
                <p className="mt-1 text-[#647176]">24 hours a day, 7 days a week</p>
              </div>
              <div>
                <p className="font-semibold text-[#182329]">Turnaround</p>
                <p className="mt-1 text-[#647176]">Emergency orders supported within 6 hours</p>
              </div>
            </div>
          </div>

          <div className="border border-[#d9ddda] bg-[#fbfaf7] p-8 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e8664d] text-white">✓</span>
                <h3 className="mt-4 text-2xl font-semibold text-[#182329]">Message Sent!</h3>
                <p className="mt-2 text-sm text-[#647176]">Thank you, {name}. Our team will get back to you at {email} shortly.</p>
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setName(""); setEmail(""); setSubject(""); setMessage(""); }}
                  className="mt-6 text-sm font-semibold text-[#e8664d] hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-semibold">Send a message</h2>
                {error ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[#39484d]">Name</label>
                    <input
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="mt-2 w-full border border-[#d9ddda] bg-[#f5f4f0] px-4 py-2.5 text-sm outline-none transition focus:border-[#e8664d]"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-[#39484d]">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@university.edu"
                      className="mt-2 w-full border border-[#d9ddda] bg-[#f5f4f0] px-4 py-2.5 text-sm outline-none transition focus:border-[#e8664d]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-xs font-semibold uppercase tracking-wider text-[#39484d]">Subject</label>
                  <input
                    id="subject"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Question about assignment help..."
                    className="mt-2 w-full border border-[#d9ddda] bg-[#f5f4f0] px-4 py-2.5 text-sm outline-none transition focus:border-[#e8664d]"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-[#39484d]">Message</label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you need help with..."
                    className="mt-2 w-full border border-[#d9ddda] bg-[#f5f4f0] px-4 py-2.5 text-sm outline-none transition focus:border-[#e8664d]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[#182329] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e8664d] disabled:cursor-wait disabled:opacity-60"
                >
                  {isSubmitting ? "Sending..." : "Submit Inquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}