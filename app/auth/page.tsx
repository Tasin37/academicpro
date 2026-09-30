'use client';

import { useState } from "react";
import { Suspense } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isRegistering, setIsRegistering] = useState(searchParams.get("mode") === "register");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callbackUrl = searchParams.get("callbackUrl");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (isRegistering) {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error || "Unable to create your account.");
        setIsSubmitting(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: callbackUrl || "/student",
    });

    if (!result) {
      setError("An unexpected error occurred.");
      setIsSubmitting(false);
      return;
    }

    if (result.error) {
      setError("Invalid email or password.");
      setIsSubmitting(false);
      return;
    }

    const session = await getSession();
    const roleDestination = session?.user?.role === "admin"
      ? "/admin"
      : session?.user?.role === "writer"
        ? "/writer"
        : "/student";
    router.push(callbackUrl ? result.url || callbackUrl : roleDestination);
  }

  return (
    <section className="page-grid min-h-screen px-6 py-20 text-[#182329] sm:px-10">
      <div className="mx-auto max-w-md border border-[#d9ddda] bg-[#fbfaf7] p-8 shadow-xl shadow-[#182329]/5 sm:p-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8664d] text-sm font-bold text-white">A</div>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight">{isRegistering ? "Create your account" : "Sign in"}</h1>
        <p className="mt-3 text-[#647176]">{isRegistering ? "Start managing your assignments in one place." : "Use your account to access your dashboard and assignments."}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {isRegistering ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[#39484d]">First name</label>
                <input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} required className="mt-2 w-full border border-[#d9ddda] bg-[#f5f4f0] px-4 py-3 outline-none transition focus:border-[#e8664d]" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[#39484d]">Last name</label>
                <input id="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} required className="mt-2 w-full border border-[#d9ddda] bg-[#f5f4f0] px-4 py-3 outline-none transition focus:border-[#e8664d]" />
              </div>
            </div>
          ) : null}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#39484d]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full border border-[#d9ddda] bg-[#f5f4f0] px-4 py-3 outline-none transition focus:border-[#e8664d]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#39484d]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 w-full border border-[#d9ddda] bg-[#f5f4f0] px-4 py-3 outline-none transition focus:border-[#e8664d]"
            />
          </div>

          {error ? <p role="alert" className="text-sm text-[#c94e39]">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[#182329] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e8664d] disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Please wait..." : isRegistering ? "Create account" : "Sign in"}
          </button>
        </form>

        <button type="button" onClick={() => { setIsRegistering((value) => !value); setError(null); }} className="mt-6 w-full text-sm font-medium text-[#c94e39] hover:text-[#182329]">
          {isRegistering ? "Already have an account? Sign in" : "Need an account? Create one"}
        </button>
      </div>
    </section>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<section className="page-grid min-h-screen px-6 py-20 sm:px-10" />}>
      <AuthForm />
    </Suspense>
  );
}
