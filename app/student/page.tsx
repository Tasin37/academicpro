'use client';

import { useEffect, useState, useRef } from "react";
import { signOut, getSession } from "next-auth/react";
import Link from "next/link";

type Order = {
  _id: string;
  title: string;
  subject: string;
  subjectCode?: string;
  whatsappNumber?: string;
  studentName?: string;
  studentEmail?: string;
  deadline: string;
  pages?: number;
  budget?: number;
  status: string;
  attachments?: string[];
  cloudLink?: string;
  description?: string;
  submittedDocument?: string;
  submittedFiles?: string[];
  submissionNotes?: string;
  submittedCloudLink?: string;
  completedAt?: string;
  createdAt?: string;
};

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function StudentDashboardPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states matching the exact design
  const [name, setName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [deadlineDate, setDeadlineDate] = useState(getTomorrowDate());
  const [deadlineTime, setDeadlineTime] = useState("23:00");
  const [pages, setPages] = useState(1);
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [cloudLink, setCloudLink] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Auto-fill student name and email from session asynchronously
  useEffect(() => {
    let isActive = true;
    getSession().then((session) => {
      if (!isActive || !session?.user) return;
      if (session.user.name) setName(session.user.name);
      if (session.user.email) setEmail(session.user.email);
    }).catch(() => {
      // Ignore session fetch errors
    });

    return () => {
      isActive = false;
    };
  }, []);

  async function loadOrders() {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = (await response.json()) as { orders: Order[] };
        setOrders(data.orders || []);
      } else {
        setLoadError("We could not load your orders. Please refresh and try again.");
      }
    } catch {
      setLoadError("Network error while loading your orders.");
    }
  }

  useEffect(() => {
    let isActive = true;
    fetch("/api/orders")
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as { orders: Order[] };
      })
      .then((data) => {
        if (!isActive) return;
        if (data) {
          setOrders(data.orders || []);
        } else {
          setLoadError("We could not load your orders. Please refresh and try again.");
        }
      })
      .catch(() => {
        if (isActive) setLoadError("Network error while loading your orders.");
      });

    return () => {
      isActive = false;
    };
  }, []);

  function handleFileSelection(files: FileList | null) {
    if (!files) return;
    const newFiles = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      // 1. Upload files if any are selected
      let uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((f) => formData.append("files", f));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = (await uploadRes.json()) as { urls: string[] };
          uploadedUrls = uploadData.urls || [];
        } else {
          // If upload fails, retain filenames for reference
          uploadedUrls = selectedFiles.map((f) => f.name);
        }
      }

      // 2. Construct deadline datetime
      const combinedDeadline = new Date(`${deadlineDate}T${deadlineTime}:00`);

      // 3. Post order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          whatsappNumber: whatsappNumber.trim(),
          email: email.trim(),
          subjectCode: subjectCode.trim(),
          deadline: combinedDeadline.toISOString(),
          pages,
          description: description.trim(),
          cloudLink: cloudLink.trim(),
          attachments: uploadedUrls,
        }),
      });

      const data = (await response.json()) as { error?: string; order?: Order };

      if (!response.ok) {
        setFeedback({
          type: "error",
          text: data.error || "Unable to submit your assignment request.",
        });
        setIsSubmitting(false);
        return;
      }

      // Reset form
      setSubjectCode("");
      setDescription("");
      setSelectedFiles([]);
      setCloudLink("");
      setPages(1);
      setDeadlineDate(getTomorrowDate());
      setDeadlineTime("23:00");

      setFeedback({
        type: "success",
        text: "Your assignment request has been submitted successfully! We are matching you with an expert.",
      });

      await loadOrders();
    } catch {
      setFeedback({
        type: "error",
        text: "A network error occurred while submitting your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f4f0] px-4 py-12 text-[#182329] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#d9ddda] pb-8 sm:flex-row sm:items-end">
          <div>
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-[#647176] transition hover:text-[#e8664d]"
            >
              ← AcademicPro
            </Link>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#c94e39]">
              Student workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Assignment Request Portal
            </h1>
            <p className="mt-2 text-sm text-[#647176]">
              Submit detailed instructions, upload materials, and monitor your assignments in real-time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/" })}
            className="text-xs font-bold uppercase tracking-wider text-[#c94e39] transition hover:text-[#e8664d]"
          >
            Sign out
          </button>
        </div>

        {/* 2-Column Responsive Workspace Grid */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] items-start">
          {/* Start an Assignment Form Card (Pixel matched with image) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-10">
            {feedback ? (
              <div
                className={`mb-6 rounded-xl border p-4 text-xs font-semibold ${
                  feedback.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                {feedback.text}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Name & WhatsApp Number */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    NAME
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 w-full rounded-xl bg-[#f1f4f6] px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none transition focus:bg-white focus:ring-2 focus:ring-[#416169]/25 focus:border focus:border-[#416169]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    WHATSAPP NUMBER
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1234567890"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="h-12 w-full rounded-xl bg-[#f1f4f6] px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none transition focus:bg-white focus:ring-2 focus:ring-[#416169]/25 focus:border focus:border-[#416169]"
                  />
                </div>
              </div>

              {/* Row 2: Email Address & Subject Code */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl bg-[#f1f4f6] px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none transition focus:bg-white focus:ring-2 focus:ring-[#416169]/25 focus:border focus:border-[#416169]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    SUBJECT CODE
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS101"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="h-12 w-full rounded-xl bg-[#f1f4f6] px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none transition focus:bg-white focus:ring-2 focus:ring-[#416169]/25 focus:border focus:border-[#416169]"
                  />
                </div>
              </div>

              {/* Row 3: Deadline & Length (Pages/Words) */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    DEADLINE
                  </label>
                  <div className="flex h-12 w-full items-center rounded-xl bg-[#f1f4f6] border border-transparent focus-within:border-[#416169] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#416169]/25 transition">
                    {/* Date picker */}
                    <div className="flex flex-1 items-center gap-2 px-3">
                      <svg
                        className="h-4 w-4 text-slate-400 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <input
                        type="date"
                        required
                        value={deadlineDate}
                        onChange={(e) => setDeadlineDate(e.target.value)}
                        className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 outline-none cursor-pointer"
                      />
                    </div>
                    {/* Divider */}
                    <div className="h-6 w-[1px] bg-slate-300 shrink-0" />
                    {/* Time picker */}
                    <div className="flex flex-1 items-center gap-2 px-3">
                      <svg
                        className="h-4 w-4 text-slate-400 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <input
                        type="time"
                        required
                        value={deadlineTime}
                        onChange={(e) => setDeadlineTime(e.target.value)}
                        className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    LENGTH (PAGES/WORDS)
                  </label>
                  <div className="flex h-12 w-full items-center justify-between rounded-xl bg-[#f1f4f6] px-2 border border-transparent">
                    {/* Decrement Button */}
                    <button
                      type="button"
                      onClick={() => setPages((p) => Math.max(1, p - 1))}
                      disabled={pages <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-xs text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-lg"
                      aria-label="Decrease pages"
                    >
                      −
                    </button>

                    {/* Counter Label */}
                    <div className="text-center">
                      <div className="text-sm font-bold text-slate-800 leading-tight">
                        {pages} {pages === 1 ? "Page" : "Pages"}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-tight">
                        {pages * 250} WORDS
                      </div>
                    </div>

                    {/* Increment Button */}
                    <button
                      type="button"
                      onClick={() => setPages((p) => p + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-xs text-slate-600 transition hover:bg-slate-100 font-semibold text-lg"
                      aria-label="Increase pages"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 4: Assignment Description */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  ASSIGNMENT DESCRIPTION
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detailed requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[110px] w-full rounded-xl bg-[#f1f4f6] p-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none transition focus:bg-white focus:ring-2 focus:ring-[#416169]/25 focus:border focus:border-[#416169]"
                />
              </div>

              {/* Row 5: Materials (Optional) */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  MATERIALS (OPTIONAL)
                </label>

                {/* Dashed Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition cursor-pointer ${
                    isDragging
                      ? "border-[#416169] bg-[#eef3f5] scale-[1.01]"
                      : "border-[#d8dee3] bg-[#fafbfc] hover:border-[#416169] hover:bg-[#f3f6f8]"
                  }`}
                >
                  <svg
                    className="h-8 w-8 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Click or drag to upload documents
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    MULTIPLE FILES ALLOWED
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelection(e.target.files)}
                    accept=".pdf,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg,.xlsx,.pptx"
                  />
                </div>

                {/* Selected Files List Chips */}
                {selectedFiles.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedFiles.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs"
                      >
                        📄 {f.name} ({(f.size / 1024).toFixed(0)} KB)
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(i);
                          }}
                          className="ml-1 text-slate-400 hover:text-rose-600 font-bold"
                          title="Remove file"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* Divider: OR USE A LINK */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      OR USE A LINK
                    </span>
                  </div>
                </div>

                {/* Helper text */}
                <p className="text-xs leading-relaxed text-slate-500">
                  If your file is too large or you prefer cloud storage, paste a Google Drive/Dropbox link
                  (ensure sharing is set to &apos;Anyone with the link&apos;).
                </p>

                {/* Cloud link input */}
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={cloudLink}
                  onChange={(e) => setCloudLink(e.target.value)}
                  className="mt-3 h-12 w-full rounded-xl bg-[#f1f4f6] px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none transition focus:bg-white focus:ring-2 focus:ring-[#416169]/25 focus:border focus:border-[#416169]"
                />
              </div>

              {/* Submit Request Button */}
              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-xl bg-[#416169] px-10 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#324d54] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side: Orders Directory / Status */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#d9ddda] pb-3">
              <div>
                <h2 className="text-xl font-semibold text-[#182329]">Your assignments</h2>
                <p className="text-xs text-[#647176]">Live status and delivery updates</p>
              </div>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-[#182329]">
                {orders.length} Total
              </span>
            </div>

            {loadError ? (
              <p role="alert" className="text-xs font-semibold text-[#c94e39]">
                {loadError}
              </p>
            ) : null}

            {orders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#b9c1bd] bg-white p-12 text-center text-[#647176]">
                <p className="text-base font-semibold text-[#182329]">No assignments placed yet</p>
                <p className="mt-2 text-xs text-[#647176]">
                  Fill out the form on the left to request assignment help. Your orders will appear here immediately.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusColors: Record<string, string> = {
                    pending: "bg-amber-100 text-amber-800 border-amber-300",
                    assigned: "bg-blue-100 text-blue-800 border-blue-300",
                    in_progress: "bg-purple-100 text-purple-800 border-purple-300",
                    submitted: "bg-emerald-100 text-emerald-800 border-emerald-300",
                    completed: "bg-emerald-200 text-emerald-900 border-emerald-400",
                    cancelled: "bg-rose-100 text-rose-800 border-rose-300",
                  };
                  const badgeClass =
                    statusColors[order.status] || "bg-slate-100 text-slate-800 border-slate-300";

                  return (
                    <article
                      key={order._id}
                      className="rounded-2xl border border-[#d9ddda] bg-white p-5 shadow-xs transition hover:shadow-sm"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-bold text-[#182329]">
                              {order.subjectCode || order.subject}
                            </span>
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <h3 className="mt-2 text-base font-semibold text-[#182329]">
                            {order.title}
                          </h3>
                        </div>
                        {order.budget ? (
                          <span className="text-lg font-bold text-[#182329]">
                            ${order.budget}
                          </span>
                        ) : null}
                      </div>

                      {order.description ? (
                        <p className="mt-2 text-xs leading-relaxed text-[#647176] line-clamp-2">
                          {order.description}
                        </p>
                      ) : null}

                      {/* Completed Deliverables from Writer */}
                      {order.submittedFiles && order.submittedFiles.length > 0 ? (
                        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                              ✓ Completed Work Delivered
                            </span>
                            {order.completedAt ? (
                              <span className="text-[11px] text-emerald-700">
                                Delivered on {new Date(order.completedAt).toLocaleDateString()}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {order.submittedFiles.map((fileUrl, idx) => (
                              <a
                                key={idx}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-2xs hover:bg-emerald-50 transition"
                              >
                                📥 Download File {idx + 1}
                              </a>
                            ))}
                          </div>
                          {order.submittedCloudLink ? (
                            <div className="mt-2 text-xs">
                              <a
                                href={order.submittedCloudLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-emerald-800 underline hover:text-emerald-900"
                              >
                                Writer Cloud Deliverable Link ↗
                              </a>
                            </div>
                          ) : null}
                          {order.submissionNotes ? (
                            <p className="mt-2 border-t border-emerald-200/60 pt-1.5 text-xs italic text-slate-700">
                              Note from writer: {order.submissionNotes}
                            </p>
                          ) : null}
                        </div>
                      ) : order.submittedCloudLink ? (
                        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                              ✓ Completed Work Delivered
                            </span>
                          </div>
                          <div className="mt-2">
                            <a
                              href={order.submittedCloudLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-emerald-800 underline hover:text-emerald-900"
                            >
                              📥 Access Delivered Files (Cloud Storage) ↗
                            </a>
                          </div>
                          {order.submissionNotes ? (
                            <p className="mt-2 border-t border-emerald-200/60 pt-1.5 text-xs italic text-slate-700">
                              Note from writer: {order.submissionNotes}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3 text-xs text-[#647176]">
                        <span>📄 {order.pages || 1} page{(order.pages || 1) > 1 ? "s" : ""} ({(order.pages || 1) * 250} words)</span>
                        <span>⏰ Due {new Date(order.deadline).toLocaleDateString()}</span>
                        {order.attachments && order.attachments.length > 0 ? (
                          <span>📎 {order.attachments.length} file{order.attachments.length > 1 ? "s" : ""}</span>
                        ) : null}
                        {order.cloudLink ? (
                          <a
                            href={order.cloudLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#416169] underline hover:text-[#182329]"
                          >
                            Cloud Folder ↗
                          </a>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
