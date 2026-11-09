'use client';

import Link from "next/link";
import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Process", href: "/#how-it-works" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const emptySubscribe = () => () => {};

export default function HomeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Lock body scroll and listen for Escape key when menu is open
  useEffect(() => {
    if (!isMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  // Mobile Drawer Portal content
  const mobileMenuContent = isMenuOpen && mounted ? (
    <div
      className="fixed inset-0 z-[9999] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      {/* Dark backdrop overlay */}
      <div
        onClick={() => setIsMenuOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-out Drawer */}
      <div className="fixed inset-y-0 right-0 z-[10000] flex w-full max-w-xs flex-col border-l border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-2xl transition-transform duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#d9ddda] pb-5">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2.5 text-base font-bold tracking-tight text-[#182329]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8664d] text-xs font-bold text-white">
              A
            </span>
            Academic<span className="text-[#e8664d]">Pro</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9ddda] bg-white text-base font-bold text-[#182329] shadow-2xs transition hover:bg-[#e8664d] hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 flex-1 space-y-2 overflow-y-auto" aria-label="Mobile navigation">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-[#182329] transition hover:bg-white hover:text-[#e8664d] hover:shadow-2xs"
            >
              <span>{item.label}</span>
              <span className="text-xs text-slate-400">→</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-3 border-t border-[#d9ddda] pt-6">
          <Link
            href="/auth"
            onClick={() => setIsMenuOpen(false)}
            className="flex h-11 w-full items-center justify-center rounded-xl border border-[#d9ddda] bg-white text-sm font-semibold text-[#182329] transition hover:border-[#182329]"
          >
            Sign in
          </Link>
          <Link
            href="/auth?mode=register"
            onClick={() => setIsMenuOpen(false)}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-[#e8664d] text-sm font-bold text-white shadow-xs transition hover:bg-[#c94e39]"
          >
            Get started
          </Link>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#d9ddda]/80 bg-[#f5f4f0]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:py-5">
          <Link className="flex items-center gap-3 text-lg font-semibold tracking-tight text-[#182329]" href="/">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8664d] text-xs font-bold text-white">
              A
            </span>
            Academic<span className="text-[#e8664d]">Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#647176] md:flex">
            {navigation.slice(1).map((item) => (
              <Link key={item.label} href={item.href} className="transition hover:text-[#e8664d]">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/auth" className="text-sm font-semibold text-[#182329] transition hover:text-[#e8664d]">
              Sign in
            </Link>
            <Link
              href="/auth?mode=register"
              className="rounded-full bg-[#182329] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e8664d]"
            >
              Get started
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d9ddda] bg-white text-[#182329] shadow-2xs transition hover:border-[#e8664d] hover:text-[#e8664d] md:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Render mobile drawer directly into document.body to avoid stacking context traps */}
      {mounted && typeof document !== "undefined" && mobileMenuContent
        ? createPortal(mobileMenuContent, document.body)
        : null}
    </>
  );
}
