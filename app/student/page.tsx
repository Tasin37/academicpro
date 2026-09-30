'use client';

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

type Order = {
  _id: string;
  title: string;
  subject: string;
  deadline: string;
  budget: number;
  status: string;
};

const initialForm = {
  title: "",
  subject: "",
  description: "",
  deadline: "",
  pages: "",
  academicLevel: "Bachelor",
  budget: "",
  notes: "",
};

export default function StudentDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadOrders() {
    const response = await fetch("/api/orders");
    if (response.ok) {
      const data = (await response.json()) as { orders: Order[] };
      setOrders(data.orders);
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
          setOrders(data.orders);
        } else {
          setLoadError("We could not load your orders. Please refresh and try again.");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function createOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, pages: Number(form.pages), budget: Number(form.budget) }),
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(data.error || "Unable to create the order.");
      setIsSubmitting(false);
      return;
    }

    setForm(initialForm);
    setMessage("Order submitted. We will match you with an expert shortly.");
    await loadOrders();
    setIsSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-[#f5f4f0] px-6 py-16 text-[#182329] sm:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 border-b border-[#d9ddda] pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c94e39]">Student workspace</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Your assignments</h1>
            <p className="mt-3 text-[#647176]">Create a brief, track progress, and keep every deadline visible.</p>
          </div>
          <button type="button" onClick={() => void signOut({ callbackUrl: "/" })} className="text-sm font-semibold text-[#c94e39]">Sign out</button>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <form onSubmit={createOrder} className="border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold">Start an assignment</h2>
            <div className="mt-6 space-y-4">
              <label className="sr-only" htmlFor="title">Assignment title</label><input id="title" required placeholder="Assignment title" value={form.title} onChange={(event) => updateField("title", event.target.value)} className="field" />
              <label className="sr-only" htmlFor="subject">Subject or course</label><input id="subject" required placeholder="Subject or course" value={form.subject} onChange={(event) => updateField("subject", event.target.value)} className="field" />
              <label className="sr-only" htmlFor="description">Assignment description</label><textarea id="description" required placeholder="Describe what you need help with" value={form.description} onChange={(event) => updateField("description", event.target.value)} className="field min-h-28" />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-[#647176]">Deadline<input required type="datetime-local" value={form.deadline} onChange={(event) => updateField("deadline", event.target.value)} className="field mt-2" /></label>
                <label className="text-sm text-[#647176]">Academic level<select value={form.academicLevel} onChange={(event) => updateField("academicLevel", event.target.value)} className="field mt-2"><option>High School</option><option>Associate</option><option>Bachelor</option><option>Master</option><option>PhD</option></select></label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sr-only" htmlFor="pages">Number of pages</label><input id="pages" required type="number" min="1" placeholder="Pages" value={form.pages} onChange={(event) => updateField("pages", event.target.value)} className="field" />
                <label className="sr-only" htmlFor="budget">Budget in dollars</label><input id="budget" required type="number" min="0" step="1" placeholder="Budget ($)" value={form.budget} onChange={(event) => updateField("budget", event.target.value)} className="field" />
              </div>
              <label className="sr-only" htmlFor="notes">Notes or instructions</label><textarea id="notes" placeholder="Notes or instructions (optional)" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} className="field min-h-20" />
            </div>
            {message ? <p role="status" className="mt-4 text-sm text-[#c94e39]">{message}</p> : null}
            <button disabled={isSubmitting} className="mt-6 w-full rounded-full bg-[#182329] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e8664d] disabled:opacity-50">{isSubmitting ? "Submitting..." : "Submit assignment"}</button>
          </form>

          <section>
            <div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">Recent orders</h2><span className="text-sm text-[#647176]">{orders.length} total</span></div>
            {loadError ? <p role="alert" className="mt-4 text-sm text-[#c94e39]">{loadError}</p> : null}
            <div className="mt-6 space-y-4">
              {orders.length === 0 ? <div className="border border-dashed border-[#b9c1bd] p-10 text-center text-[#647176]">Your submitted assignments will appear here.</div> : orders.map((order) => (
                <article key={order._id} className="border border-[#d9ddda] bg-[#fbfaf7] p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row"><div><h3 className="text-lg font-semibold">{order.title}</h3><p className="mt-1 text-sm text-[#647176]">{order.subject}</p></div><span className="h-fit rounded-full bg-[#f9d9d1] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#c94e39]">{order.status}</span></div>
                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#647176]"><span>Due {new Date(order.deadline).toLocaleDateString()}</span><span>${order.budget}</span></div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
      <style jsx>{`.field { width: 100%; border: 1px solid #d9ddda; background: #f5f4f0; padding: 0.75rem 1rem; color: #182329; outline: none; } .field:focus { border-color: #e8664d; }`}</style>
    </main>
  );
}