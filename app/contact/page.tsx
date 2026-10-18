'use client';

import { useState } from "react";
import Link from "next/link";
import SectionHeading from "../components/SectionHeading";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

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
            <Link href="/blog" className="transition hover:text-[#e8664d]">Blog</Link>
            <Link href="/auth" className="rounded-full bg-[#182329] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e8664d]">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

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
                  className="w-full rounded-full bg-[#182329] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e8664d]"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}