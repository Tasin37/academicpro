'use client';

import { useEffect, useState, useRef } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

type OrderItem = {
  _id: string;
  title: string;
  description: string;
  subject: string;
  subjectCode?: string;
  academicLevel: string;
  pages: number;
  budget: number;
  deadline: string;
  status: string;
  attachments?: string[];
  cloudLink?: string;
  notes?: string;
  submittedDocument?: string;
  submittedFiles?: string[];
  submissionNotes?: string;
  submittedCloudLink?: string;
  completedAt?: string;
  createdAt: string;
};

type WriterStats = {
  availableCount: number;
  assignedCount: number;
  completedCount: number;
  totalEarnings: number;
};

export default function WriterDashboardPage() {
  const [activeTab, setActiveTab] = useState<"available" | "myOrders">("available");
  const [availableOrders, setAvailableOrders] = useState<OrderItem[]>([]);
  const [myOrders, setMyOrders] = useState<OrderItem[]>([]);
  const [stats, setStats] = useState<WriterStats>({
    availableCount: 0,
    assignedCount: 0,
    completedCount: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Submission state for completing assignments
  const [submittingOrderId, setSubmittingOrderId] = useState<string | null>(null);
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [submissionCloudLink, setSubmissionCloudLink] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadData() {
    try {
      const res = await fetch("/api/writer/orders");
      if (res.ok) {
        const data = await res.json();
        setAvailableOrders(data.availableOrders || []);
        setMyOrders(data.myOrders || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load writer data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;
    fetch("/api/writer/orders")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isActive || !data) return;
        setAvailableOrders(data.availableOrders || []);
        setMyOrders(data.myOrders || []);
        if (data.stats) setStats(data.stats);
      })
      .catch((err) => console.error("Failed to load writer data:", err))
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function handleClaimOrder(orderId: string) {
    setActionLoading(orderId);
    setAlertMessage(null);
    try {
      const res = await fetch("/api/writer/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "claim" }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMessage({ text: "Order successfully claimed! It is now in your active assignments.", type: "success" });
        await loadData();
        setActiveTab("myOrders");
      } else {
        setAlertMessage({ text: data.error || "Failed to claim order.", type: "error" });
      }
    } catch {
      setAlertMessage({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  function handleFileSelection(files: FileList | null) {
    if (!files) return;
    const newFiles = Array.from(files);
    setSubmissionFiles((prev) => [...prev, ...newFiles]);
  }

  function removeSubmissionFile(index: number) {
    setSubmissionFiles((prev) => prev.filter((_, i) => i !== index));
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

  function openSubmissionForm(orderId: string) {
    setSubmittingOrderId(orderId);
    setSubmissionFiles([]);
    setSubmissionCloudLink("");
    setSubmissionNotes("");
    setAlertMessage(null);
  }

  function closeSubmissionForm() {
    setSubmittingOrderId(null);
    setSubmissionFiles([]);
    setSubmissionCloudLink("");
    setSubmissionNotes("");
  }

  async function handleConfirmSubmit(orderId: string) {
    if (submissionFiles.length === 0 && !submissionCloudLink.trim() && !submissionNotes.trim()) {
      setAlertMessage({
        text: "Please attach at least one completed file or provide a cloud storage link.",
        type: "error",
      });
      return;
    }

    setIsSubmittingDraft(true);
    setAlertMessage(null);

    try {
      // 1. Upload files if any are selected
      let uploadedUrls: string[] = [];
      if (submissionFiles.length > 0) {
        const formData = new FormData();
        submissionFiles.forEach((file) => formData.append("files", file));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = (await uploadRes.json()) as { urls: string[] };
          uploadedUrls = uploadData.urls || [];
        } else {
          uploadedUrls = submissionFiles.map((f) => f.name);
        }
      }

      // 2. Submit order with files and links
      const res = await fetch("/api/writer/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action: "submit",
          submittedFiles: uploadedUrls,
          submittedCloudLink: submissionCloudLink.trim(),
          submissionNotes: submissionNotes.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAlertMessage({
          text: "Assignment draft and completed files submitted successfully! Your earnings have been updated.",
          type: "success",
        });
        closeSubmissionForm();
        await loadData();
      } else {
        setAlertMessage({ text: data.error || "Failed to submit assignment draft.", type: "error" });
      }
    } catch {
      setAlertMessage({ text: "Network error while submitting files. Please try again.", type: "error" });
    } finally {
      setIsSubmittingDraft(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f4f0] px-6 py-16 text-[#182329] sm:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 border-b border-[#d9ddda] pb-8 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xs font-semibold uppercase tracking-[0.3em] text-[#647176] hover:text-[#e8664d]">
                ← AcademicPro
              </Link>
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#c94e39]">Writer workspace</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Writer Dashboard</h1>
            <p className="mt-3 text-[#647176]">Browse student briefs, claim assignments, submit completed drafts with files, and track earnings.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void loadData()}
              className="rounded-full border border-[#d9ddda] bg-white px-4 py-2.5 text-sm font-semibold text-[#182329] transition hover:border-[#182329]"
            >
              ↻ Refresh
            </button>
            <button
              type="button"
              onClick={() => void signOut({ callbackUrl: "/" })}
              className="rounded-full border border-[#d9ddda] bg-white px-5 py-2.5 text-sm font-semibold text-[#c94e39] transition hover:border-[#c94e39] hover:bg-[#fbfaf7]"
            >
              Sign out
            </button>
          </div>
        </div>

        {alertMessage ? (
          <div
            className={`mt-6 rounded-xl border p-4 text-sm font-medium ${
              alertMessage.type === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-rose-300 bg-rose-50 text-rose-800"
            }`}
          >
            {alertMessage.text}
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#647176]">Open Requests</p>
            <p className="mt-3 text-3xl font-semibold text-[#182329]">{loading ? "..." : stats.availableCount}</p>
            <p className="mt-2 text-sm text-[#647176]">Ready to claim</p>
          </div>
          <div className="rounded-2xl border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#647176]">In Progress</p>
            <p className="mt-3 text-3xl font-semibold text-[#182329]">{loading ? "..." : stats.assignedCount}</p>
            <p className="mt-2 text-sm text-[#647176]">Assigned to you</p>
          </div>
          <div className="rounded-2xl border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#647176]">Completed Drafts</p>
            <p className="mt-3 text-3xl font-semibold text-[#182329]">{loading ? "..." : stats.completedCount}</p>
            <p className="mt-2 text-sm text-[#647176]">Finished deliveries</p>
          </div>
          <div className="rounded-2xl border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#647176]">Total Earnings</p>
            <p className="mt-3 text-3xl font-semibold text-[#182329]">
              {loading ? "..." : `$${stats.totalEarnings.toFixed(2)}`}
            </p>
            <p className="mt-2 text-sm text-[#647176]">From completed work</p>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex border-b border-[#d9ddda]">
            <button
              type="button"
              onClick={() => setActiveTab("available")}
              className={`pb-4 px-6 text-sm font-semibold transition border-b-2 ${
                activeTab === "available"
                  ? "border-[#e8664d] text-[#182329]"
                  : "border-transparent text-[#647176] hover:text-[#182329]"
              }`}
            >
              Available Opportunities ({availableOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("myOrders")}
              className={`pb-4 px-6 text-sm font-semibold transition border-b-2 ${
                activeTab === "myOrders"
                  ? "border-[#e8664d] text-[#182329]"
                  : "border-transparent text-[#647176] hover:text-[#182329]"
              }`}
            >
              My Assignments ({myOrders.length})
            </button>
          </div>

          <div className="mt-8">
            {activeTab === "available" ? (
              <div>
                {availableOrders.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#b9c1bd] bg-[#fbfaf7] p-16 text-center text-[#647176]">
                    <p className="text-lg font-semibold text-[#182329]">No unassigned orders right now</p>
                    <p className="mt-2 text-sm">When students place new assignment orders, they will appear here instantly.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {availableOrders.map((order) => (
                      <article key={order._id} className="flex flex-col justify-between rounded-2xl border border-[#d9ddda] bg-white p-6 shadow-xs transition hover:shadow-sm">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span className="inline-block rounded-md bg-[#f5f4f0] border border-[#d9ddda] px-2.5 py-1 text-xs font-bold text-[#182329]">
                                {order.subjectCode || order.subject}
                              </span>
                              <h3 className="mt-3 text-xl font-semibold text-[#182329]">{order.title}</h3>
                            </div>
                            <span className="text-2xl font-bold text-[#182329]">${order.budget}</span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-[#647176] line-clamp-3">{order.description}</p>
                          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#647176]">
                            <span>🎓 {order.academicLevel}</span>
                            <span>📄 {order.pages} page{order.pages > 1 ? "s" : ""}</span>
                            <span>⏰ Due: {new Date(order.deadline).toLocaleDateString()}</span>
                          </div>

                          {/* Student Attachments preview */}
                          {order.attachments && order.attachments.length > 0 ? (
                            <div className="mt-4 border-t border-[#d9ddda] pt-3">
                              <p className="text-xs font-semibold text-slate-700">Student Attachments:</p>
                              <div className="mt-1.5 flex flex-wrap gap-2">
                                {order.attachments.map((att, i) => (
                                  <a
                                    key={i}
                                    href={att}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded bg-[#f5f4f0] border border-[#d9ddda] px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-[#e8664d]"
                                  >
                                    📎 Document {i + 1}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {order.cloudLink ? (
                            <div className="mt-2 text-xs">
                              <a
                                href={order.cloudLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-[#416169] underline hover:text-[#182329]"
                              >
                                Student Cloud Link ↗
                              </a>
                            </div>
                          ) : null}

                          {order.notes ? (
                            <p className="mt-3 border-t border-[#d9ddda] pt-3 text-xs italic text-[#647176]">
                              Note: {order.notes}
                            </p>
                          ) : null}
                        </div>
                        <div className="mt-6 pt-4 border-t border-[#d9ddda]">
                          <button
                            type="button"
                            disabled={actionLoading === order._id}
                            onClick={() => handleClaimOrder(order._id)}
                            className="w-full rounded-xl bg-[#182329] py-3 text-sm font-semibold text-white transition hover:bg-[#e8664d] disabled:opacity-50"
                          >
                            {actionLoading === order._id ? "Claiming..." : "Claim Assignment"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {myOrders.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#b9c1bd] bg-[#fbfaf7] p-16 text-center text-[#647176]">
                    <p className="text-lg font-semibold text-[#182329]">You have not claimed any assignments yet</p>
                    <p className="mt-2 text-sm">Switch to the &quot;Available Opportunities&quot; tab to claim pending briefs.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {myOrders.map((order) => {
                      const isCompleted = order.status === "completed" || order.status === "submitted";
                      const isSubmittingThis = submittingOrderId === order._id;

                      return (
                        <article key={order._id} className="rounded-2xl border border-[#d9ddda] bg-white p-6 shadow-xs">
                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-[#182329]">
                                  {order.subjectCode || order.subject}
                                </span>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                                    isCompleted
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-[#f9d9d1] text-[#c94e39]"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <h3 className="mt-3 text-xl font-semibold text-[#182329]">{order.title}</h3>
                              <p className="mt-1 text-sm text-[#647176]">{order.academicLevel} • {order.pages} pages</p>
                              <p className="mt-3 text-sm text-[#39484d] leading-relaxed">{order.description}</p>

                              <div className="mt-4 flex flex-wrap gap-6 text-xs text-[#647176]">
                                <span>Due: <strong>{new Date(order.deadline).toLocaleDateString()}</strong></span>
                                <span>Compensation: <strong>${order.budget}</strong></span>
                              </div>

                              {/* Student files given for this order */}
                              {(order.attachments && order.attachments.length > 0) || order.cloudLink ? (
                                <div className="mt-4 rounded-xl bg-[#f5f4f0] p-3 border border-[#d9ddda]">
                                  <p className="text-xs font-bold text-[#182329]">Student Reference Materials:</p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {order.attachments?.map((att, i) => (
                                      <a
                                        key={i}
                                        href={att}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 rounded bg-white border border-[#d9ddda] px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-[#e8664d]"
                                      >
                                        📎 Attachment {i + 1}
                                      </a>
                                    ))}
                                    {order.cloudLink ? (
                                      <a
                                        href={order.cloudLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 rounded bg-white border border-[#d9ddda] px-2.5 py-1 text-xs font-semibold text-[#416169] hover:underline"
                                      >
                                        📁 Student Cloud Folder ↗
                                      </a>
                                    ) : null}
                                  </div>
                                </div>
                              ) : null}

                              {/* Already Submitted Deliverables */}
                              {isCompleted ? (
                                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                                      ✓ Your Delivered Submission
                                    </span>
                                    {order.completedAt ? (
                                      <span className="text-xs text-emerald-700">
                                        Submitted on {new Date(order.completedAt).toLocaleDateString()}
                                      </span>
                                    ) : null}
                                  </div>

                                  {order.submittedFiles && order.submittedFiles.length > 0 ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {order.submittedFiles.map((fileUrl, idx) => (
                                        <a
                                          key={idx}
                                          href={fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-2xs hover:bg-emerald-50"
                                        >
                                          📥 Delivered Document {idx + 1}
                                        </a>
                                      ))}
                                    </div>
                                  ) : null}

                                  {order.submittedCloudLink ? (
                                    <div className="mt-2 text-xs">
                                      <a
                                        href={order.submittedCloudLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-emerald-800 underline hover:text-emerald-900"
                                      >
                                        Delivered Cloud Link ↗
                                      </a>
                                    </div>
                                  ) : null}

                                  {order.submissionNotes ? (
                                    <p className="mt-2.5 text-xs text-slate-700 italic border-t border-emerald-200/60 pt-2">
                                      Your notes: {order.submissionNotes}
                                    </p>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>

                            {/* Action Button for Active Orders */}
                            {!isCompleted && !isSubmittingThis ? (
                              <div className="sm:self-start">
                                <button
                                  type="button"
                                  onClick={() => openSubmissionForm(order._id)}
                                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-[#416169] px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#324d54]"
                                >
                                  Submit Assignment Draft →
                                </button>
                              </div>
                            ) : null}
                          </div>

                          {/* Interactive Submission Form Drawer */}
                          {!isCompleted && isSubmittingThis ? (
                            <div className="mt-6 border-t border-slate-200 pt-6">
                              <div className="rounded-2xl border border-slate-200 bg-[#fbfaf7] p-6 shadow-inner">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                  <div>
                                    <h4 className="text-base font-bold text-[#182329]">Submit Completed Draft & Files</h4>
                                    <p className="text-xs text-slate-500">Attach your final documents or provide a cloud link for the student.</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={closeSubmissionForm}
                                    className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                                  >
                                    ✕ Cancel
                                  </button>
                                </div>

                                <div className="mt-5 space-y-5">
                                  {/* Dashed Upload Dropzone */}
                                  <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                      UPLOAD COMPLETED FILES
                                    </label>
                                    <div
                                      onClick={() => fileInputRef.current?.click()}
                                      onDragOver={handleDragOver}
                                      onDragLeave={handleDragLeave}
                                      onDrop={handleDrop}
                                      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition cursor-pointer ${
                                        isDragging
                                          ? "border-[#416169] bg-[#eef3f5] scale-[1.01]"
                                          : "border-[#d8dee3] bg-white hover:border-[#416169] hover:bg-[#f3f6f8]"
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
                                      <p className="mt-2 text-sm font-semibold text-slate-700">
                                        Click or drag to upload completed files
                                      </p>
                                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        MULTIPLE FILES ALLOWED (PDF, DOCX, ZIP, PPTX)
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

                                    {/* Uploaded File List Chips */}
                                    {submissionFiles.length > 0 ? (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {submissionFiles.map((file, i) => (
                                          <span
                                            key={i}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs"
                                          >
                                            📄 {file.name} ({(file.size / 1024).toFixed(0)} KB)
                                            <button
                                              type="button"
                                              onClick={() => removeSubmissionFile(i)}
                                              className="ml-1 text-slate-400 hover:text-rose-600 font-bold"
                                              title="Remove file"
                                            >
                                              ×
                                            </button>
                                          </span>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>

                                  {/* Divider: OR USE A LINK */}
                                  <div className="relative my-4 text-center">
                                    <div className="absolute inset-0 flex items-center">
                                      <div className="w-full border-t border-slate-200" />
                                    </div>
                                    <div className="relative flex justify-center">
                                      <span className="bg-[#fbfaf7] px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        OR USE A CLOUD STORAGE LINK
                                      </span>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                      CLOUD STORAGE LINK (OPTIONAL)
                                    </label>
                                    <input
                                      type="url"
                                      placeholder="https://drive.google.com/... or Dropbox link"
                                      value={submissionCloudLink}
                                      onChange={(e) => setSubmissionCloudLink(e.target.value)}
                                      className="h-11 w-full rounded-xl bg-white px-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none border border-slate-200 focus:border-[#416169] focus:ring-2 focus:ring-[#416169]/25 transition"
                                    />
                                  </div>

                                  <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                                      NOTES OR INSTRUCTIONS FOR STUDENT (OPTIONAL)
                                    </label>
                                    <textarea
                                      rows={3}
                                      placeholder="Explain the structure of your work, references consulted, or guidelines followed..."
                                      value={submissionNotes}
                                      onChange={(e) => setSubmissionNotes(e.target.value)}
                                      className="w-full rounded-xl bg-white p-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none border border-slate-200 focus:border-[#416169] focus:ring-2 focus:ring-[#416169]/25 transition"
                                    />
                                  </div>

                                  {/* Submit & Cancel Buttons */}
                                  <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                      type="button"
                                      onClick={closeSubmissionForm}
                                      disabled={isSubmittingDraft}
                                      className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isSubmittingDraft}
                                      onClick={() => handleConfirmSubmit(order._id)}
                                      className="inline-flex items-center gap-2 rounded-xl bg-[#416169] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-[#324d54] disabled:opacity-60"
                                    >
                                      {isSubmittingDraft ? (
                                        <>
                                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                          Submitting...
                                        </>
                                      ) : (
                                        "Confirm & Submit Work"
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
