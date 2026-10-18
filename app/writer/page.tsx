'use client';

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

type OrderItem = {
  _id: string;
  title: string;
  description: string;
  subject: string;
  academicLevel: string;
  pages: number;
  budget: number;
  deadline: string;
  status: string;
  notes?: string;
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
    loadData();
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

  async function handleSubmitDraft(orderId: string) {
    setActionLoading(orderId);
    setAlertMessage(null);
    try {
      const res = await fetch("/api/writer/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "submit" }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMessage({ text: "Draft marked as submitted! Earnings have been updated.", type: "success" });
        await loadData();
      } else {
        setAlertMessage({ text: data.error || "Failed to submit draft.", type: "error" });
      }
    } catch {
      setAlertMessage({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setActionLoading(null);
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
            <p className="mt-3 text-[#647176]">Browse student briefs, claim assignments, submit drafts, and track earnings.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadData()}
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
            className={`mt-6 border p-4 text-sm font-medium ${
              alertMessage.type === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-rose-300 bg-rose-50 text-rose-800"
            }`}
          >
            {alertMessage.text}
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#647176]">Open Requests</p>
            <p className="mt-3 text-3xl font-semibold text-[#182329]">{loading ? "..." : stats.availableCount}</p>
            <p className="mt-2 text-sm text-[#647176]">Ready to claim</p>
          </div>
          <div className="border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#647176]">In Progress</p>
            <p className="mt-3 text-3xl font-semibold text-[#182329]">{loading ? "..." : stats.assignedCount}</p>
            <p className="mt-2 text-sm text-[#647176]">Assigned to you</p>
          </div>
          <div className="border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#647176]">Completed Drafts</p>
            <p className="mt-3 text-3xl font-semibold text-[#182329]">{loading ? "..." : stats.completedCount}</p>
            <p className="mt-2 text-sm text-[#647176]">Finished deliveries</p>
          </div>
          <div className="border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-sm">
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
                  <div className="border border-dashed border-[#b9c1bd] bg-[#fbfaf7] p-16 text-center text-[#647176]">
                    <p className="text-lg font-semibold text-[#182329]">No unassigned orders right now</p>
                    <p className="mt-2 text-sm">When students place new assignment orders, they will appear here instantly.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {availableOrders.map((order) => (
                      <article key={order._id} className="flex flex-col justify-between border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-sm transition hover:shadow-md">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span className="inline-block rounded-full bg-[#f5f4f0] border border-[#d9ddda] px-3 py-1 text-xs font-semibold text-[#647176]">
                                {order.subject}
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
                            className="w-full rounded-full bg-[#182329] py-2.5 text-sm font-semibold text-white transition hover:bg-[#e8664d] disabled:opacity-50"
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
                  <div className="border border-dashed border-[#b9c1bd] bg-[#fbfaf7] p-16 text-center text-[#647176]">
                    <p className="text-lg font-semibold text-[#182329]">You have not claimed any assignments yet</p>
                    <p className="mt-2 text-sm">Switch to the "Available Opportunities" tab to claim pending briefs.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myOrders.map((order) => {
                      const isCompleted = order.status === "completed" || order.status === "submitted";
                      return (
                        <article key={order._id} className="border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-sm">
                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-[#182329]">{order.title}</h3>
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
                              <p className="mt-1 text-sm text-[#647176]">{order.subject} • {order.academicLevel} • {order.pages} pages</p>
                              <p className="mt-2 text-sm text-[#39484d]">{order.description}</p>
                              <div className="mt-3 flex gap-6 text-xs text-[#647176]">
                                <span>Due: {new Date(order.deadline).toLocaleDateString()}</span>
                                <span>Compensation: <strong>${order.budget}</strong></span>
                              </div>
                            </div>
                            <div>
                              {!isCompleted ? (
                                <button
                                  type="button"
                                  disabled={actionLoading === order._id}
                                  onClick={() => handleSubmitDraft(order._id)}
                                  className="w-full sm:w-auto rounded-full bg-[#e8664d] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f07860] disabled:opacity-50"
                                >
                                  {actionLoading === order._id ? "Submitting..." : "Submit Completed Draft"}
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full">
                                  ✓ Draft Submitted
                                </span>
                              )}
                            </div>
                          </div>
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